import { RELATED_ARTICLE_COUNT } from "../../consts/consts";

/** 関連記事の正規表現（マークダウンファイル冒頭のrelated:） */
const PATTERN_RELATED = /---(.|\n)+related:.+\n(.|\n)+---/;

/** 関連記事の行の正規表現 */
const PATTERN_RELATED_LINE = /related:.+\n/;

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
  const stringRelated = lineRelated[0].replace(/^related:|,\s*\n$|\s*\n$/g, "");
  // カンマ区切りで分割（先頭要素の空白のみ除去では重複検出が漏れるため trim する）
  const arrayRelated = stringRelated.split(",").map((s) => s.trim());

  return generateMessages(arrayRelated);
};

/**
 * 関連記事は規定の個数か？
 * */
const isValidLength = (array: string[]): boolean => {
  return array.length === RELATED_ARTICLE_COUNT;
};

/**
 * 関連記事と規定の個数の差分
 * */
const checkDifference = (array: string[]): string => {
  const difference = Math.abs(RELATED_ARTICLE_COUNT - array.length);
  if (array.length > RELATED_ARTICLE_COUNT) {
    return `関連記事が${difference}点多いです。\n`;
  } else if (array.length < RELATED_ARTICLE_COUNT) {
    return `関連記事が${difference}点足りません。\n`;
  } else {
    return "";
  }
};

/**
 * 関連記事は重複しているか？
 * */
const isDuplicated = (array1: string[], array2: string[]) => {
  return array1.length !== array2.length;
};

/**
 * 関連記事の重複
 */
const checkDuplication = (array: string[], arrayWithoutDuplicates: string[]): string => {
  if (isDuplicated(array, arrayWithoutDuplicates)) {
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
  const arrayWithoutDuplicates = [...new Set(array)];
  if (isValidLength(array) && !isDuplicated(array, arrayWithoutDuplicates)) {
    return [];
  }
  return [checkDifference(array) + checkDuplication(array, arrayWithoutDuplicates) + arrayToString(array)];
};

/**
 * 関連記事の個数に応じたメッセージを返します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleRelatedCheck = (mdFile: string) => {
  return countRelated(mdFile);
};
