import {printErrorLog} from "../../utils/printErrorLog";

/** 見出しの正規表現 */
const PATTERN_BASE = /\n#+.+/g;

/** 正常に表示されない見出しの正規表現（見出しレベルに1,2,6~を設定しているパターン） */
const PATTERN_ERROR_LEVEL = /\n((#{1,2}|#{6,})(\s|\u3000|[^#]).+)/g;

/** 正常に表示されない見出しの正規表現（#の後に全角スペースが続くパターン） */
const PATTERN_ERROR_SPACE = /\n#{3,5}\u3000.+/g;

/** 正常に表示されない見出しの正規表現（#の後にスペースがないパターン） */
const PATTERN_ERROR_ZERO_SPACE = /\n#{3,5}[^#|\s]+/g;


/**
 * 使用できない見出しレベルを使用していないかチェックを行います・
 * (見出しレベル3~5が使用可能)
 * */
const checkErrorHeading = (text: string): string[] => {
  const headings = text.match(PATTERN_BASE);
  if (!headings) {
    return [];
  }

  return headings.map((heading) => {
    if (PATTERN_ERROR_LEVEL.test(heading)) {
      return "使用できない見出しレベルです！\n" + removeNewline(heading);
    } else if (PATTERN_ERROR_SPACE.test(heading)) {
      return "全角スペースが含まれています！\n" + removeNewline(heading);
    } else if (PATTERN_ERROR_ZERO_SPACE.test(heading)) {
      return "#の直後に半角スペースがありません！\n" + removeNewline(heading);
    }
    return "";
  }).filter(heading => heading);
};

/**
 * 文頭の改行コードを取り除きます。
 * */
const removeNewline = (text: string): string => {
  return text.replace(/^\n/, "");
};

/**
 * 見出しレベルにエラーがないか検証します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleHeadingLevelCheck = (mdFile: string) => {
  printErrorLog(["見出しレベルのチェックを行います。"], checkErrorHeading(mdFile));
};
