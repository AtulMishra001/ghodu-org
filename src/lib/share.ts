// The phone's share sheet where there is one, otherwise a copied link.
export async function shareLink(title: string, url = window.location.href): Promise<"shared" | "copied" | "failed"> {
  if (navigator.share) {
    // Closing the share sheet rejects; that isn't a failure worth showing.
    await navigator.share({ title, url }).catch(() => {});
    return "shared";
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
