export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function generateSlug(title: string) {
  const base = slugify(title) || "event";
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base}-${suffix}`;
}