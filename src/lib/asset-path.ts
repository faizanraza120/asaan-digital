// GitHub project sites have a repository prefix until a custom domain is set.
// Next.js prefixes its own files; public images and CSS masks need this helper.
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
