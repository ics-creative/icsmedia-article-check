import path from "node:path";
import prompts from "prompts";
import { DEV_PATH } from "../config/filepath";
import process from "process";
import { ENTRY_DIR } from "../consts/consts";

export type GetPathOptions = {
  /**
   * 指定時は対話入力・DEV_PATH より優先します。
   * 開発環境では `./foo` や `../entry/260410` など記事ディレクトリへの相対・絶対パスも受け付けます。
   * 本番・または記事 ID のみ（例: 200317）のときは `${cwd}${ENTRY_DIR}/${id}` を返します。
   */
  articleId?: string;
};

/** `https://ics.media/entry/■■■■/` のプレフィックス・末尾 `/` を除き、記事ディレクトリ名に使う ID を返す */
const ARTICLE_ID_STRIP = /(http.+ics.media\/entry\/)|\/$/g;

/**
 * 対話入力または CLI の第1引数で受け取った文字列を記事 ID に正規化します。
 * 前後の空白を除き、`https://ics.media/entry/■■■■/` 形式なら記事 ID のみにします。
 * @param raw 記事 ID（例: 200317）または ics.media の entry URL
 */
export const normalizeArticleId = (raw: string): string =>
  raw.trim().replace(ARTICLE_ID_STRIP, "");

/**
 * `process.argv` 相当の配列から記事 ID を取得します。
 * 第1引数が存在し、`-` で始まらないときだけ記事 ID として返します（2引数目以降は無視）。
 * `-` で始まる場合はオプション風の入力として扱い、例外にします。
 */
export const parseArticleIdFromArgv = (argv: string[]): string | undefined => {
  const first = argv[0];
  if (first === undefined || first === "") {
    return undefined;
  }
  if (first.startsWith("-")) {
    throw new Error(
      "最初の引数に記事IDを指定してください。例: node build/index.js 200317",
    );
  }
  return first;
};

/**
 * 開発時、第1引数が「記事ディレクトリへのパス」か「純粋な記事 ID」かを区別します。
 * ics.media URL はこの前に {@link normalizeArticleId} 済みである前提です。
 */
const isArticleDirectoryPathInput = (normalized: string): boolean => {
  if (path.isAbsolute(normalized)) {
    return true;
  }
  if (normalized.startsWith(".")) {
    return true;
  }
  if (normalized.includes("/") || normalized.includes("\\")) {
    return true;
  }
  return false;
};

/**
 * チェックを行うディレクトリを取得します。
 * <br>
 * `options.articleId` 指定時: 常にその ID の記事パス（開発・本番共通）
 * 開発環境：環境変数 `ARTICLE_CHECK_BASE_PATH` があればそれを、なければ config/filepath.ts の `DEV_PATH` を使用
 * <br>
 * 未指定かつ開発環境：`config/filepath.ts` で指定したディレクトリを使用
 * <br>
 * 未指定かつ本番環境：対話型 CLI で記事 ID を入力
 */

export const getPath = async (options?: GetPathOptions): Promise<string> => {
  const fromOpt = options?.articleId?.trim();
  if (fromOpt) {
    const articleId = normalizeArticleId(fromOpt);
    if (
      process.env.NODE_ENV === "development" &&
      isArticleDirectoryPathInput(articleId)
    ) {
      return path.resolve(process.cwd(), articleId);
    }
    return `${process.cwd()}${ENTRY_DIR}/${articleId}`;
  }
  if (process.env.NODE_ENV === "development") {
    return process.env.ARTICLE_CHECK_BASE_PATH ?? DEV_PATH;
  }
  return getPromptPath();
};

/**
 * 本番環境で対話入力から記事 ID を取得し、記事ディレクトリの絶対パスを組み立てます。
 * URL（ics.media の entry URL）で入力された場合も記事 ID に正規化します。
 */
const getPromptPath = async (): Promise<string> => {
  const res: Record<string, string> = await prompts<string>({
    type: "text",
    message: "記事IDを指定ください。 例) 200317",
    name: "value"
  });

  const articleId = normalizeArticleId(res.value);
  return `${process.cwd()}${ENTRY_DIR}/${articleId}`;
};
