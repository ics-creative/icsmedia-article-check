import {printErrorLog} from "../../utils/printErrorLog";

/** 公開日の日付の正規表現 */
const PATTERN_PUBLISHED = /published_date:.*/;

/** 更新日の日付の正規表現 */
const PATTERN_MODIFIED = /modified_date:.*/;

/**
 * 記事の公開日|更新日に続く数字の部分を取得します。
 * */
const getDate = (textArray: string[], pattern: RegExp) => {
  // 行を抽出
  const lineDate = textArray.find((text) => pattern.test(text));
  return lineDate?.replace(/(published|modified)_date:\s*/, "") ?? null;
};

/**
 * 公開日と更新日の日付に不整合がある場合はエラーにします。
 * */
const checkDate = (text: string[]) => {
  // 日付の数字を抽出
  const stringPublished = getDate(text, PATTERN_PUBLISHED);
  const stringModified = getDate(text, PATTERN_MODIFIED);
  return generateMessages(stringPublished, stringModified);
};

/**
 * 公開日｜更新日の抜けをチェック
 */
const checkMissingDate = (stringPublished: string | null, stringModified: string | null) => {
  const missingArray = [];
  if (!stringPublished) {
    missingArray.push("published_date");
  }
  if (!stringModified) {
    missingArray.push("modified_date");
  }
  return missingArray;
};

/**
 * エラーメッセージを生成します。
 */
const generateMessages = (stringPublished: string | null, stringModified: string | null): string[] => {
  if (!stringPublished || !stringModified) {
    return [`${checkMissingDate(stringPublished, stringModified)}が抜けています。`];
  }

  const today = dateToString(new Date());

  const messages = [];
  if (stringPublished > stringModified) {
    messages.push(`公開日と更新日が不整合です。更新日より公開日の方が新しくなっています。\npublished_date: ${stringPublished}\nmodified_date: ${stringModified}`);
  }
  if (stringPublished > today) {
    messages.push(`公開日に未来の日付が登録されています。\n今日の日付：${today}\npublished_date: ${stringPublished}`);
  }
  if (stringModified > today) {
    messages.push(`更新日に未来の日付が登録されています。\n今日の日付：${today}\nmodified_date: ${stringModified}`);
  }
  return messages;
};

/**
 * 日付をハイフン区切りで表します。
 */
const dateToString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * 記事公開日と更新日の日付に不整合がないか検証します。
 * @param html マークダウン形式の記事
 * */
export const articleDateCheck = (html: string[]) => {
  printErrorLog(["記事公開日と更新日の整合性のチェックを行います。"], checkDate(html));
};
