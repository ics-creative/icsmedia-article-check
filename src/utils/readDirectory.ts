import fs from "node:fs";
import process from "process";
import { LOG_ERROR } from "../consts/consts";

/**
 * 引数で受け取ったディレクトリ配下のファイルを読み込みます
 * @param path パス
 */
export const readDirectory = (path: string) => {
  try {
    return fs.readdirSync(path, { withFileTypes: true });
  } catch (e) {
    console.warn(`${LOG_ERROR}ディレクトリが存在しません。${path}`);
    process.exit(1);
  }
};
