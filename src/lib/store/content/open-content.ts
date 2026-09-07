import { getStoreContentProvider } from "@/lib/store/content/provider-factory";
import type {
  StoreContentOpenResult,
  StoreContentRange,
  StoreContentRef,
} from "@/lib/store/content/types";

export async function openStoreContent(
  ref: StoreContentRef,
  range?: StoreContentRange | null,
): Promise<StoreContentOpenResult> {
  const provider = getStoreContentProvider();
  return provider.open(ref, range);
}
