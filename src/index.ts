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

const validate = async () => {
  // チェックするファイルがあるディレクトリのパスを取得
  const basePath = await getPath();
  // マークダウンファイルを読み込み
  const mdFile = readFile(`${basePath}/${MD_NAME}`);
  // HTML形式に変換
  const html = toHtml(mdFile);
  // HTML形式に変換(文字列)
  const htmlText = toHtmlText(mdFile);

  // リンク切れチェック
  void expiredLinkCheck(html);
  // 容量チェック
  fileCapacityCheck(basePath);
  // アイキャッチの検証
  void eyecatchCheck(basePath);
  // 見出しレベルのチェック
  articleHeadingLevelCheck(htmlText);
  // 関連記事の個数チェック
  articleRelatedCheck(mdFile);
  // 公開日と更新日の整合性チェック
  articleDateCheck(html);
};

void validate();
