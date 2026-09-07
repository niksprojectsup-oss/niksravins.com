import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import type {
  StoreContentOpenResult,
  StoreContentProvider,
  StoreContentRange,
  StoreContentRef,
} from "@/lib/store/content/types";

const DEFAULT_CONTENT_ROOT = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "storage",
  "private-content",
);

export function getStoreContentRoot(): string {
  return process.env.STORE_CONTENT_ROOT?.trim() || DEFAULT_CONTENT_ROOT;
}

export function resolveStoreContentPath(objectKey: string): string {
  const root = path.resolve(getStoreContentRoot());
  const normalizedKey = objectKey.replace(/^\/+/, "");
  const absolutePath = path.resolve(root, normalizedKey);

  if (!absolutePath.startsWith(`${root}${path.sep}`) && absolutePath !== root) {
    throw new Error("Invalid content key.");
  }

  return absolutePath;
}

function statContentFile(objectKey: string): { absolutePath: string; totalSize: number } {
  const absolutePath = resolveStoreContentPath(objectKey);

  if (!existsSync(absolutePath)) {
    throw new Error("Content file not found.");
  }

  const stats = statSync(absolutePath);
  if (!stats.isFile()) {
    throw new Error("Content path is not a file.");
  }

  return { absolutePath, totalSize: stats.size };
}

function openFileStream(
  absolutePath: string,
  range?: StoreContentRange | null,
): ReadableStream {
  const nodeStream =
    range === undefined || range === null
      ? createReadStream(absolutePath)
      : createReadStream(absolutePath, { start: range.start, end: range.end });

  return Readable.toWeb(nodeStream) as ReadableStream;
}

export const localStoreContentProvider: StoreContentProvider = {
  async open(
    ref: StoreContentRef,
    range?: StoreContentRange | null,
  ): Promise<StoreContentOpenResult> {
    const { absolutePath, totalSize } = statContentFile(ref.objectKey);

    if (range) {
      return {
        body: openFileStream(absolutePath, range),
        totalSize,
        ranged: true,
        rangeStart: range.start,
        rangeEnd: range.end,
      };
    }

    return {
      body: openFileStream(absolutePath),
      totalSize,
      ranged: false,
    };
  },
};
