#!/usr/bin/env node

import { getPath } from "./utils/getPath";
import { readFile } from "./utils/readFile";
import { MD_NAME } from "./consts/consts";
import { toHtml } from "./utils/toHtml";
import { toHtmlText } from "./utils/toHtmlText";
import { articleHeadingLevelCheck } from "./logics/articleCheck/articleHeadingLevelCheck";
import { expiredLinkCheck } from "./logics/expiredLinkCheck/expiredLinkCheck";
import { fileCapacityCheck } from "./logics/fileCapacityCheck/fileCapacityCheck";
import { eyecatchCheck } from "./logics/eyecatchCheck/eyecatchCheck";
import { articleDateCheck } from "./logics/articleCheck/articleDateCheck";
import { articleRelatedCheck } from "./logics/articleCheck/articleRelatedCheck";
import { printErrorLog, printNoProblemLog } from "./utils/printErrorLog";

const validate = async () => {
  // チェックするファイルがあるディレクトリのパスを取得
  const basePath = await getPath();
  // マークダウンファイルを読み込み
  const mdFile = readFile(`${basePath}/${MD_NAME}`);
  // HTML形式に変換
  const html = toHtml(mdFile);
  // HTML形式に変換(文字列)
  const htmlText = toHtmlText(mdFile);

  const results = await Promise.allSettled([
    // リンク切れチェック
    expiredLinkCheck(htmlText),
    // アイキャッチの検証
    eyecatchCheck(basePath),
    // 容量チェック
    Promise.resolve(fileCapacityCheck(basePath)),
    // 見出しレベルのチェック
    Promise.resolve(articleHeadingLevelCheck(htmlText)),
    // 関連記事の個数チェック
    Promise.resolve(articleRelatedCheck(mdFile)),
    // 公開日と更新日の整合性チェック
    Promise.resolve(articleDateCheck(html)),
  ]);

  // 各チェックでエラーメッセージがあった場合
  const errors = results
    .filter(({ status }) => status === "fulfilled")
    .flatMap((p) => (p as PromiseFulfilledResult<string[]>).value);

  // 各チェックで予期しないエラーがあった場合
  const rejected = results
    .filter(({ status }) => status === "rejected")
    .flatMap((p) => (p as PromiseRejectedResult).reason as string);

  // ログを出力
  if (errors.length > 0 || rejected.length > 0) {
    printErrorLog(errors);
    printErrorLog(rejected);
  } else {
    printNoProblemLog();
  }
};

void validate();
