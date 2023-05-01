import {printErrorLog} from "../../utils/printErrorLog";

/** マークダウンファイル冒頭の公開日|更新日の正規表現 */
const PATTERN_HEAD_DATE = /---(.|\n)+[a-z]+_date:.+\n(.|\n)+---/;

/** 公開日の日付の正規表現 */
const PATTERN_PUBLISHED = /published_date:.*/;

/** 更新日の日付の正規表現 */
const PATTERN_MODIFIED = /modified_date:.*/;

/**
 * 記事の公開日|更新日に続く数字の部分を取得します。
 * */
const getDate = (text: string, pattern: typeof PATTERN_PUBLISHED | typeof PATTERN_MODIFIED): string[] => {
  // 記事冒頭の公開日|更新日を抽出
  const headRelated = text.match(PATTERN_HEAD_DATE);
  if (!headRelated) {
    return [];
  }
  // 行を抽出
  const lineDate = text.match(pattern);
  if (!lineDate) {
    return [];
  }
  return [lineDate[0].replace(/(published|modified)+_date:\s*/, "")];
};

/**
 * 公開日と更新日の日付に不整合がある場合はエラーにします。
 * */
const checkDate = (text: string): string[] => {
  // 日付部分を抽出
  const stringPublished = getDate(text, PATTERN_PUBLISHED);
  const stringModified = getDate(text, PATTERN_MODIFIED);
  const today = new Date();
  return generateMessages(stringPublished, stringModified, today);
};

/**
 * 無効な配列か？
 */
const isInvalidLength = (date: string[]) => {
  return date.length !== 1;
};

/**
 * エラーメッセージを生成します。
 */
const generateMessages = (stringPublished: string[], stringModified: string[], today: Date): string[] => {
  if (isInvalidLength(stringPublished) || isInvalidLength(stringModified)) {
    return ["記事の日付が抜けています。"];
  }
  // Date型に変換した日付
  const datePublished = stringToDate(stringPublished[0]);
  const dateModified = stringToDate(stringModified[0]);

  const messages = [];
  if (datePublished > dateModified) {
    messages.push(`公開日と更新日が不整合です。更新日より公開日の方が新しくなっています。\npublished_date: ${stringPublished}\nmodified_date: ${stringModified}`);
  }
  if (datePublished > today) {
    messages.push(`公開日に未来の日付が登録されています。\n今日の日付：${dateToString(today)}\npublished_date: ${stringPublished}`);
  }
  if (datePublished > today) {
    messages.push(`更新日に未来の日付が登録されています。\n今日の日付：${dateToString(today)}\nmodified_date: ${stringModified}`);
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
 * 文字列の日付をハイフン区切りのDate型にして返します。
 */
const stringToDate = (stringDate: string): Date => {
  return new Date(stringDate.replace(/-/g, "/"));
};

/**
 * 記事公開日と更新日の日付に不整合がないか検証します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleDateCheck = (mdFile: string) => {
  printErrorLog(["記事公開日と更新日の整合性のチェックを行います。"], checkDate(mdFile));
};
