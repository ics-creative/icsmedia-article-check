import prompts from "prompts";
import { DEV_PATH } from "../config/filepath";
import process from "process";
import { ENTRY_DIR } from "../consts/consts";

/**
 * チェックを行うディレクトリを取得します。
 * <br>
 * 開発環境：環境変数 `ARTICLE_CHECK_BASE_PATH` があればそれを、なければ config/filepath.ts の `DEV_PATH` を使用
 * <br>
 * 本番環境：対話型cliで指定されたディレクトリを使用
 */
export const getPath = async () => {
  const env = process.env.NODE_ENV;
  if (env === "development") {
    return process.env.ARTICLE_CHECK_BASE_PATH ?? DEV_PATH;
  }
  return await getPrompt();
};

/**
 * 本番環境で対話入力から記事 ID を取得し、記事ディレクトリの絶対パスを組み立てます。
 * URL（ics.media の entry URL）で入力された場合は記事 ID に正規化します。
 */
const getPrompt = async () => {
  const res: Record<string, string> = await prompts<string>({
    type: "text",
    message: "記事IDを指定ください。 例) 200317",
    name: "value"
  });

  // url（https://ics.media/entry/■■■■/）で入力された場合は記事IDに変換
  const articleId = res.value.replace(/(http.+ics.media\/entry\/)|\/$/g, "");
  return `${process.cwd()}${ENTRY_DIR}/${articleId}`;
};
