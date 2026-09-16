import { resolve, sep } from "node:path";
import { resourcePath } from "./validation";

export function downloadFilePath(path: string, cwd = process.cwd()) {
  resourcePath.parse(path);
  const root = resolve(cwd, "content", "private", "downloads");
  const file = resolve(root, path.slice("/downloads/".length));
  if (!file.startsWith(`${root}${sep}`))
    throw new Error("Invalid resource path");
  return file;
}
