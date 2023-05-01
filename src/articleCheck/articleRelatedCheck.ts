import {printErrorLog} from "../utils/printErrorLog";

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
  const related = text.match(PATTERN_RELATED);
  if (!related) {
    return ["関連記事が存在しません。"];
  }
  // 関連記事の行を抽出
  const relatedLine = related[0].match(PATTERN_RELATED_LINE);
  if (!relatedLine) {
    return [];
  }
  // 「related:〜」以降の関連記事を抽出
  const relatedArticles = relatedLine[0].replace(/related:/, "").match(PATTERN_COMMAS);
  if (!relatedArticles) {
    return [];
  }
  // 文字列にまとめる
  const relatedArticlesString = arrayToString(relatedArticles);
  // カンマ区切りで分割し、余分なスペースを取り除いて返す
  const extractedRelatedArticles = relatedArticlesString.split(",").map(value => value.trim());

  return generateMessage(extractedRelatedArticles);
};

/**
 * 関連記事の個数は所定の個数か？
 * */
const isValidLength = (relatedArray: string[]): boolean => {
  return relatedArray.length === 8;
};

/**
 * 関連記事と所定の個数の差分
 * */
const checkDifference = (relatedArray: string[]): string => {
  // 所定の関連記事の本数との差分
  const difference = Math.abs(8 - relatedArray.length);
  if (relatedArray.length > 8) {
    return `関連記事が${difference}点多いです。\n`;
  } else if (relatedArray.length < 8) {
    return `関連記事が${difference}点足りません。\n`;
  } else {
    return "";
  }
};

/**
 * 関連記事の重複
 */
const checkDuplication = (relatedArray: string[]): string => {
  const noDuplicationArray = [...new Set(relatedArray)];
  if (relatedArray.length !== noDuplicationArray.length) {
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
const generateMessage = (relatedArray: string[]): string[] => {
  if (isValidLength(relatedArray)) {
    return [];
  } else {
    return [checkDifference(relatedArray) + checkDuplication(relatedArray) + arrayToString(relatedArray)];
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
