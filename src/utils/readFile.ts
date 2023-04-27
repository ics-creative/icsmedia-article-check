import fs from "node:fs";
import process from "process";
import {LOG_ERROR} from "../consts/consts";

/**
 * 引数で受け取ったパスのファイルを読み込みます
 * @param filePath ファイルパス
 */
export const readFile = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    console.warn(`${LOG_ERROR}ファイルが存在しません。${filePath}`);
    process.exit(1);
  }
};
