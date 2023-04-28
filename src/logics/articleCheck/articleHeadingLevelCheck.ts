import {printErrorLog} from "../../utils/printErrorLog";

/** 見出しの正規表現 */
const PATTERN_BASE = /\n#+.+/g;

/** 正常に表示されない見出しの正規表現（見出しレベルに1,2,5~を設定しているパターン） */
const PATTERN_ERROR_LEVEL = /\n(#{1,2}|#{5,})(\s|\u3000|[^#]).+/g;

/** 正常に表示されない見出しの正規表現（#の後に全角スペースが続くパターン） */
const PATTERN_ERROR_SPACE = /\n#{3,4}\u3000.+/g;

/** 正常に表示されない見出しの正規表現（#の後にスペースがないパターン） */
const PATTERN_ERROR_ZERO_SPACE = /\n#{3,4}[^#|\s]+/g;

/** 正常に表示されない見出しの正規表現（タグが入るパターン） */
const PATTERN_ERROR_TAG = /\n#{3,4}[^`]*<.+>[^`]*/g;

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
    switch (true) {
      case PATTERN_ERROR_LEVEL.test(heading):
        // 連続でエラーが続くと一つ飛ばしにしか表示されないのでmatchさせて回避しています
        heading.match(PATTERN_ERROR_LEVEL);
        return "使用できない見出しレベルです。\n" + removeNewline(heading);

      case PATTERN_ERROR_SPACE.test(heading):
        heading.match(PATTERN_ERROR_SPACE);
        return "全角スペースが含まれています。\n" + removeNewline(heading);

      case PATTERN_ERROR_ZERO_SPACE.test(heading):
        heading.match(PATTERN_ERROR_ZERO_SPACE);
        return "#の直後に半角スペースがありません。\n" + removeNewline(heading);

      case PATTERN_ERROR_TAG.test(heading):
        heading.match(PATTERN_ERROR_TAG);
        return "見出しに素の<>タグは使えません。\n" + removeNewline(heading);

      default:
        return "";
    }
  }).filter(heading => heading);
};

/**
 * 改行コードを取り除きます。
 * */
const removeNewline = (text: string): string => {
  return text.replace(/\n/g, "");
};

/**
 * 見出しレベルにエラーがないか検証します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleHeadingLevelCheck = (mdFile: string) => {
  printErrorLog(["見出しレベルのチェックを行います。"], checkErrorHeading(mdFile));
};
