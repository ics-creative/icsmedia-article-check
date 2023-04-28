import {printErrorLog} from "../../utils/printErrorLog";

/** 見出しの正規表現 */
const PATTERN_BASE = /\n#+.+/g;

/** 見出しレベルにh3とh4以外を設定しているパターンの正規表現 */
const PATTERN_ERROR_LEVEL = /\n(#{1,2}|#{5,})(\s|\u3000|[^#]).+/g;

/** #の直後に全角スペースが続くパターンの正規表現 */
const PATTERN_ERROR_SPACE = /\n#+\u3000.+/g;

/** #の直後に半角スペースがないパターンの正規表現 */
const PATTERN_ERROR_ZERO_SPACE = /\n#+[^#|\s]+/g;

/** 素の<>タグが入るパターンの正規表現（`<input>`のようにバッククォートで囲んでいない）*/
const PATTERN_ERROR_TAG = /\n#+[^`]*<.+>[^`]*/g;

/**
 * 使用できない見出しのパターンを使用していないかチェックを行います。
 * */
const checkErrorHeading = (text: string): string[] => {
  // #から始まる見出しの形を抽出
  const headings = text.match(PATTERN_BASE);
  if (!headings) {
    return [];
  }

  return headings.map((heading) => {
    const errorMessages = [];
    if (PATTERN_ERROR_LEVEL.test(heading)) {
      // 連続でエラーが続くと一つ飛ばしにしか表示されないのでmatchさせて回避しています
      heading.match(PATTERN_ERROR_LEVEL);
      errorMessages.push("\n\x1b[31m使用できない見出しレベルです。\x1b[39m");
    }
    if (PATTERN_ERROR_SPACE.test(heading)) {
      heading.match(PATTERN_ERROR_SPACE);
      errorMessages.push("\n\x1b[31m全角スペースが含まれています。\x1b[39m");
    }
    if (PATTERN_ERROR_ZERO_SPACE.test(heading)) {
      heading.match(PATTERN_ERROR_ZERO_SPACE);
      errorMessages.push("\n\x1b[31m#の直後に半角スペースがありません。\x1b[39m");
    }
    if (PATTERN_ERROR_TAG.test(heading)) {
      heading.match(PATTERN_ERROR_TAG);
      errorMessages.push("\n\x1b[31m見出しに素の<>タグは使えません。\x1b[39m");
    }
    // エラー判定の場合のみ該当の見出しを表示する
    const errorHeading = errorMessages.length > 0 ? heading : "";
    return errorMessages.join(",").replace(/,/g, "") + errorHeading;
  }).filter(heading => heading); // 空の文字列を除外する
};

/**
 * 見出しレベルにエラーがないか検証します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleHeadingLevelCheck = (mdFile: string) => {
  printErrorLog(["見出しレベルのチェックを行います。"], checkErrorHeading(mdFile));
};
