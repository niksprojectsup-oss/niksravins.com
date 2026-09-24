export type CmsImageUploadResult = {
  url: string;
  filename: string;
};

export async function uploadCmsImage(file: File): Promise<CmsImageUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/cms/images", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Image upload failed.");
  }

  return response.json() as Promise<CmsImageUploadResult>;
}
