import { printErrorLog } from "../../utils/printErrorLog";

/** 見出しの正規表現 */
const PATTERN_BASE = /(?<!(```|~~~).+)\n#+.+(?!(```|~~~))/g;

/** 見出しレベルにh3とh4以外を設定しているパターンの正規表現 */
const PATTERN_ERROR_LEVEL = /\n(#{1,2}|#{5,})(\s|\u3000|[^#]).+/g;

/** #の直後に全角スペースが続くパターンの正規表現 */
const PATTERN_ERROR_SPACE = /\n#+\u3000.+/g;

/** #の直後に半角スペースがないパターンの正規表現 */
const PATTERN_ERROR_ZERO_SPACE = /\n#+[^#|\s]+/g;

/**
 * 使用できない見出しのパターンを使用していないかチェックを行います。
 * */
const checkErrorHeadings = (text: string): string[] => {
  // #から始まる見出しの形を抽出
  const headings = text.match(PATTERN_BASE);
  if (!headings) {
    return [];
  }

  const errorHeadings: string[] = [];
  headings.forEach((heading) => {
    const errorMessages = [];
    if (PATTERN_ERROR_LEVEL.test(heading)) {
      // 連続でエラーが続くと一つ飛ばしにしか表示されないのでmatchさせて回避
      heading.match(PATTERN_ERROR_LEVEL);
      errorMessages.push("使用できない見出しレベルです。h3とh4が使用できます。");
    }
    if (PATTERN_ERROR_SPACE.test(heading)) {
      heading.match(PATTERN_ERROR_SPACE);
      errorMessages.push("全角スペースが含まれています。");
    }
    if (PATTERN_ERROR_ZERO_SPACE.test(heading)) {
      heading.match(PATTERN_ERROR_ZERO_SPACE);
      errorMessages.push("#の直後に半角スペースがありません。");
    }

    // エラー判定があった場合のみ配列に追加
    if (errorMessages.length > 0) {
      const result = errorMessages.join(",").replace(/,/g, "\n") + heading;
      errorHeadings.push(result);
    }
  });
  return errorHeadings;
};

/**
 * 見出しレベルにエラーがないか検証します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleHeadingLevelCheck = (mdFile: string) => {
  printErrorLog(["見出しレベルのチェックを行います。"], checkErrorHeadings(mdFile));
};
