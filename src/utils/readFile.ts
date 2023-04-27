import fs from "node:fs";

/**
 * 引数で受け取ったパスのファイルを読み込みます
 * @param filePath ファイルパス
 */
export const readFile = (filePath: string) => {
  return fs.readFileSync(filePath, "utf-8");
};
