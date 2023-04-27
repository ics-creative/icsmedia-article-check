import process from "process";
import {DEV_PATH, PROD_PATH} from "../config/filepath";

/**
 * チェックを行うディレクトリを取得します。
 * <br>
 * 開発環境：configで指定したディレクトリを使用
 * <br>
 * 本番環境：カレントディレクトリを使用します
 */
export const getPath = () => {
  const env = process.env.NODE_ENV;
  return env === "development" ? DEV_PATH : PROD_PATH;
};
