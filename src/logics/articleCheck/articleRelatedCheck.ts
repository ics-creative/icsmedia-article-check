import {printErrorLog} from "../../utils/printErrorLog";

/** 関連記事の正規表現（マークダウンファイル冒頭のrelated:） */
const PATTERN_RELATED = /---(.|\n)+related:.+\n(.|\n)+---/;

/** 関連記事の行の正規表現 */
const PATTERN_RELATED_LINE = /related:.+\n/;

/** カンマ区切りの「英数字と-_」の単語の正規表現 */
const PATTERN_COMMAS = /[\w-]+(?:\s*,\s*[\w-]+)*/g;

/**
 * 関連記事の個数を検証します。
 * */
const countRelated = (text: string): string[] => {
  // 記事冒頭のrelated:を抽出
  const headRelated = text.match(PATTERN_RELATED);
  if (!headRelated) {
    return ["関連記事が存在しません。"];
  }
  // 関連記事の行を抽出
  const lineRelated = headRelated[0].match(PATTERN_RELATED_LINE);
  if (!lineRelated) {
    return [];
  }
  // 関連記事を抽出
  const related = lineRelated[0].replace(/related:/, "").match(PATTERN_COMMAS);
  if (!related) {
    return [];
  }
  // 文字列にまとめる
  const stringRelated = arrayToString(related);
  // カンマ区切りで分割し、余分なスペースを取り除いて返す
  const arrayRelated = stringRelated.split(",").map(value => value.trim());

  return generateMessages(arrayRelated);
};

/** 関連記事の規定の数 */
const PRESCRIBED_NUMBER = 8;

/**
 * 関連記事は規定の個数か？
 * */
const isValidLength = (array: string[]): boolean => {
  return array.length === PRESCRIBED_NUMBER;
};

/**
 * 関連記事と所定の個数の差分
 * */
const checkDifference = (array: string[]): string => {
  // 所定の関連記事の本数との差分
  const difference = Math.abs(PRESCRIBED_NUMBER - array.length);
  if (array.length > PRESCRIBED_NUMBER) {
    return `関連記事が${difference}点多いです。\n`;
  } else if (array.length < PRESCRIBED_NUMBER) {
    return `関連記事が${difference}点足りません。\n`;
  } else {
    return "";
  }
};

/**
 * 関連記事の重複
 */
const checkDuplication = (array: string[]): string => {
  const arrayWithoutDuplicates = [...new Set(array)];
  if (array.length !== arrayWithoutDuplicates.length) {
    return "関連記事が重複しています。\n";
  } else {
    return "";
  }
};

/**
 * エラーメッセージの表示用に配列を文字列に結合します。
 * */
const arrayToString = (array: string[]): string => {
  return array.join(",");
};

/**
 * エラーメッセージを生成します。
 * */
const generateMessages = (array: string[]): string[] => {
  if (isValidLength(array)) {
    return [];
  } else {
    return [checkDifference(array) + checkDuplication(array) + arrayToString(array)];
  }
};

/**
 * 関連記事の個数に応じたメッセージを返します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleRelatedCheck = (mdFile: string) => {
  const errorMessages = countRelated(mdFile);
  printErrorLog(["関連記事の個数チェックを行います。"], errorMessages);
};
