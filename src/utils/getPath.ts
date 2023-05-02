import path from "path";
import prompts from "prompts";
import { DEV_PATH } from "../config/filepath";

/**
 * チェックを行うディレクトリを取得します。
 * <br>
 * 開発環境：config/filepath.tsで指定したディレクトリを使用
 * <br>
 * 本番環境：対話型cliで指定されたディレクトリを使用
 */
export const getPath = async () => {
  const env = process.env.NODE_ENV;
  return env === "development" ? DEV_PATH : await getPrompt();
};

const getPrompt = async () => {
  const res = await prompts<string>({
    type: "text",
    message: "検証を行うファイル名を入力してください。 例) 230101",
    name: "value"
  });
  return `${path.resolve(__dirname)}/${res.value}`;
};
