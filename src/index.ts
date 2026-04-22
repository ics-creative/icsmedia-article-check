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
import {
  printErrorLog,
  printNoProblemLog,
  printWarnLog,
} from "./utils/printErrorLog";

/**
 * 記事ディレクトリを解決し、マークダウンを読み込んで各種チェックを並列実行し、
 * エラーがあれば警告ログ、なければ成功ログを出力します。
 */
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

  const linkResult = results[0];
  const linkOutcome =
    linkResult.status === "fulfilled"
      ? linkResult.value
      : { errors: [] as string[], warnings: [] as string[] };

  // 各チェックでエラーメッセージがあった場合（リンク検査は errors / warnings に分離）
  const errors = [
    ...linkOutcome.errors,
    ...results
      .slice(1)
      .filter(({ status }) => status === "fulfilled")
      .flatMap((p) => (p as PromiseFulfilledResult<string[]>).value),
  ];

  // 各チェックで予期しないエラーがあった場合
  const rejected = results
    .filter(({ status }) => status === "rejected")
    .flatMap((p) => (p as PromiseRejectedResult).reason as string);

  if (linkOutcome.warnings.length > 0) {
    printWarnLog(linkOutcome.warnings);
  }

  // ログを出力
  if (errors.length > 0 || rejected.length > 0) {
    printErrorLog(errors);
    printErrorLog(rejected);
  } else if (linkOutcome.warnings.length === 0) {
    printNoProblemLog();
  }
};

void validate();
