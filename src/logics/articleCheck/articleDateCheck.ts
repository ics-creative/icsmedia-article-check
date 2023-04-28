import {printErrorLog} from "../../utils/printErrorLog";

const PATTERN_PUBLISHED = /published_date:.*/;
const PATTERN_MODIFIED = /modified_date:.*/;

/**
 * 記事の公開日か更新日を取得します。
 * */
const getDate = (text: string, pattern: RegExp): string => {
  const dateLine = text.match(pattern);
  if (!dateLine) {
    return "";
  }
  return dateLine[0].replace(/[a-z]+_date:\s*/, "");
};

/**
 * 記事公開日と更新日の日付に不整合がある場合はエラーにします。
 * */
const checkDate = (text: string): string[] => {
  const publishedDate = getDate(text, PATTERN_PUBLISHED);
  const modifiedDate = getDate(text, PATTERN_MODIFIED);
  const publishedDateNumber = Number(publishedDate.replace(/-/g, ""));
  const modifiedDateNumber = Number(modifiedDate.replace(/-/g, ""));
  if (publishedDateNumber > modifiedDateNumber) {
    return [`公開日と更新日が不整合です。更新日より公開日の方が新しくなっています。\n公開日：${publishedDate}\n更新日：${modifiedDate}`];
  } else {
    return [];
  }
};

/**
 * 記事公開日と更新日の日付に不整合がないか検証します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleDateCheck = (mdFile: string) => {
  printErrorLog(["記事公開日と更新日の整合性のチェックを行います。"], checkDate(mdFile));
};
