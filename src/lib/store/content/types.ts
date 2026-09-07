export type StoreContentRef = {
  objectKey: string;
  mimeType: string;
  sizeBytes?: number | null;
};

export type StoreContentRange = {
  start: number;
  end: number;
};

export type StoreContentOpenResult = {
  body: ReadableStream;
  totalSize: number;
  ranged: boolean;
  rangeStart?: number;
  rangeEnd?: number;
};

export interface StoreContentProvider {
  open(
    ref: StoreContentRef,
    range?: StoreContentRange | null,
  ): Promise<StoreContentOpenResult>;
}
