#!/usr/bin/env node

import {getPath} from "./utils/getPath";
import {readFile} from "./utils/readFile";
import {MD_NAME} from "./consts/consts";
import {toHtml} from "./utils/toHtml";
import {articleHeadingLevelCheck} from "./logics/articleCheck/articleHeadingLevelCheck";
import {expiredLinkCheck} from "./logics/expiredLinkCheck/expiredLinkCheck";
import {fileCapacityCheck} from "./logics/fileCapacityCheck/fileCapacityCheck";
import {eyecatchCheck} from "./logics/eyecatchCheck/eyecatchCheck";
import {articleDateCheck} from "./logics/articleCheck/articleDateCheck";

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

// アイキャッチの検証
void eyecatchCheck(basePath);

// htmlに変換される前の見出しレベルのチェック
articleHeadingLevelCheck(mdFile);

// 公開日と更新日の整合性チェック
articleDateCheck(html);
