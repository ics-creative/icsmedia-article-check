import {printErrorLog} from "../utils/printErrorLog";

/** 関連記事の行の正規表現（文字列内で一番最初のrelated:のみ） */
const PATTERN_RELATED = /related:.+\n/;

/** カンマ区切りの数字と英語の単語の正規表現（数字|「tutorial-」から始まる文字以外はエラー） */
const PATTERN_COMMAS = /(\d+|tutorial-\w+)(?:\s*,\s*(\d+|tutorial-\w+))*/g;

/**
 * 関連記事の個数を検証します。
 * */
const countRelated = (text: string): string => {
  // 関連記事の行を抽出
  const relatedLine = text.match(PATTERN_RELATED);
  if (!relatedLine) {
    return "";
  }

  // 関連記事が正しく表記されているか検証（数字|「tutorial-」から始まる文字以外はエラー）
  const relatedArticles = relatedLine[0].match(PATTERN_COMMAS);
  if (!relatedArticles) {
    return "";
  }
  // エラーパターンを除いてまとめる
  const extractedRelatedArticles = relatedArticles.join(",");
  // カンマ区切りで分割し、余分なスペースを取り除いて返す
  const relatedArticlesArray = extractedRelatedArticles.split(",").map(value => value.trim());

  return generateMessage(relatedArticlesArray);
};

/**
 * 関連記事の個数をチェックします。
 * */
const checkRelatedLength = (relatedArray: string[]): string => {
  // 関連記事の所定の本数
  const PREDETERMINED_RELATED_NUMBER = 8;
  // 所定の関連記事の本数との差分
  const difference = Math.abs(PREDETERMINED_RELATED_NUMBER - relatedArray.length);
  if (relatedArray.length > 8) {
    return `関連記事が${difference}点多いです。\n`;
  } else if (relatedArray.length < 8) {
    return `関連記事が${difference}点足りません。\n`;
  } else {
    return "";
  }
};

/**
 * 関連記事の重複をチェックします。
 */
const checkDuplication = (relatedArray: string[]): string => {
  const result = [...new Set(relatedArray)];
  if (relatedArray.length !== result.length) {
    return "関連記事が重複しています。\n";
  } else {
    return "";
  }
};

/**
 * エラーメッセージ用に配列を文字列に結合します。
 * */
const toStringForErrorMessage = (relatedArray: string[]) => {
  // 配列を文字列に連結
  return relatedArray.join(",");
};

/**
 * エラーメッセージを生成します。
 * */
const generateMessage = (relatedArray: string[]) => {
  if (checkRelatedLength(relatedArray) || checkDuplication(relatedArray)) {
    return checkRelatedLength(relatedArray) + checkDuplication(relatedArray) + toStringForErrorMessage(relatedArray);
  } else {
    return "";
  }
};

/**
 * 関連記事の個数に応じたメッセージを返します。
 * @param mdFile マークダウン形式の記事
 * */
export const articleRelatedCheck = (mdFile: string) => {
  const errorMessages = countRelated(mdFile).length > 0 ? [countRelated(mdFile)] : [];

  printErrorLog(["関連記事の個数チェックを行います。"], errorMessages);
};
