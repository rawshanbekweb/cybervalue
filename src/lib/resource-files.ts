import { readdir, realpath, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { downloadFilePath } from "./files";
import { resourcePath } from "./validation";

export const MAX_RESOURCE_BYTES = 20 * 1024 * 1024;
export type ResourceFile = {
  path: string;
  size: number | null;
  name?: string;
  status: "Available" | "Missing" | "Too large" | "Unavailable";
};

export async function inspectResourceFile(
  path: string,
  cwd = process.cwd(),
): Promise<ResourceFile> {
  try {
    const file = downloadFilePath(path, cwd);
    if ((await realpath(file)) !== file)
      return { path, size: null, status: "Unavailable" };
    const info = await stat(file);
    if (!info.isFile()) return { path, size: null, status: "Unavailable" };
    return {
      path,
      size: info.size,
      status: info.size > MAX_RESOURCE_BYTES ? "Too large" : "Available",
    };
  } catch (error) {
    return {
      path,
      size: null,
      status:
        (error as NodeJS.ErrnoException).code === "ENOENT"
          ? "Missing"
          : "Unavailable",
    };
  }
}

export async function listResourceFiles(
  cwd = process.cwd(),
): Promise<ResourceFile[]> {
  let names: string[];
  try {
    names = await readdir(resolve(cwd, "content/private/downloads"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new Error(
      "Resource files could not be listed. Check storage access.",
    );
  }
  const paths = names
    .map((name) => `/downloads/${name}`)
    .filter((path) => resourcePath.safeParse(path).success)
    .sort();
  const files: ResourceFile[] = [];
  // Bound concurrent filesystem work even for a large directory.
  for (let start = 0; start < paths.length; start += 20) {
    files.push(
      ...(await Promise.all(
        paths
          .slice(start, start + 20)
          .map((path) => inspectResourceFile(path, cwd)),
      )),
    );
  }
  return files;
}
