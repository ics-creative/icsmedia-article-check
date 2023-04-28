#!/usr/bin/env node

import {getPath} from "./utils/getPath";
import {readFile} from "./utils/readFile";
import {MD_NAME} from "./consts/consts";
import {toHtml} from "./utils/toHtml";
import {expiredLinkCheck} from "./logics/expiredLinkCheck/expiredLinkCheck";
import {fileCapacityCheck} from "./logics/fileCapacityCheck/fileCapacityCheck";
import {articleRelatedCheck} from "./articleCheck/articleRelatedCheck";

// チェックするファイルがあるディレクトリのパスを取得
const basePath = getPath();
// マークダウンファイルを読み込み
const mdFile = readFile(`${basePath}/${MD_NAME}`);
// HTML形式に変換
const html = toHtml(mdFile);

// リンク切れチェック
void expiredLinkCheck(html);

// 容量チェック
fileCapacityCheck(basePath);

// 関連記事の個数チェック
articleRelatedCheck(mdFile);
