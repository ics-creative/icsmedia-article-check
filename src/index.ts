#!/usr/bin/env node

import {getPath} from "./utils/getPath";
import {readFile} from "./utils/readFile";
import {MD_NAME} from "./consts/consts";
import {toHtml} from "./utils/toHtml";
import {articleHeadingLevelCheck} from "./articleCheck/articleHeadingLevelCheck";
import {expiredLinkCheck} from "./logics/expiredLinkCheck/expiredLinkCheck";

// チェックするファイルがあるディレクトリのパスを取得
const basePath = getPath();
// マークダウンファイルを読み込み
const mdFile = readFile(`${basePath}/${MD_NAME}`);
// HTML形式に変換
const html = toHtml(mdFile);

// リンク切れチェック
void expiredLinkCheck(html);

// htmlに変換される前の見出しレベルのチェック
articleHeadingLevelCheck(mdFile);
