import {LOG_ERROR, LOG_INFO, LOG_SEPARATOR} from "../consts/consts";

/** 正常に表示される見出しの正規表現 */
const PATTERN_CORRECT = /\n#{3,5} .+/g;

/** 正常に表示されない見出しの正規表現（#の後に全角スペースが続くパターン） */
const PATTERN_ERROR_SPACE = /\n#{3,5}\u3000.+/g;

/** 正常に表示されない見出しの正規表現（#の後に半角/全角スペースが続く/#以外の文字が続くパターン） */
const PATTERN_ERROR_LEVEL = /\n((#{2}|#{6})(\s|\u3000|[^#]).+)/g;

/**
 * 見出しレベルのチェックを行い、正常な見出しをコンソールに出力します
 * */
const countSharp = (text: string) => {
  const correctHeadings = text.match(PATTERN_CORRECT);
  if (!correctHeadings) {
    return;
  }
  correctHeadings.forEach((heading) => {
    // 改行コードを取り除き、出力する
    const removeNewline = heading.replace(/\n/, " ");
    console.log(removeNewline);
  });
};

/**
 * 見出しレベルのチェックを行い、使用できない見出しをコンソールに出力します。
 * (見出しレベル3~5のみ使用可能)
 * */
const checkErrorHeading = (text: string) => {
  const errorHeadings = text.match(PATTERN_ERROR_LEVEL);
  if (!errorHeadings) {
    return;
  }
  errorHeadings.forEach((heading) => {
    // 改行コードを取り除く
    const removeNewline = heading.replace(/^\n/g, " ");
    console.error(removeNewline);
  });
};

/**
 * 見出しレベルの後の全角スペースのチェックを行い、コンソールに出力します
 * */
const checkErrorSpace = (text: string) => {
  const errorDouble = text.match(PATTERN_ERROR_SPACE);
  if (!errorDouble) {
    return;
  }
  errorDouble.forEach((heading) => {
    // 改行コードを取り除く
    const removeNewline = heading.replace(/^\n/g, " ");
    // 全角スペースを■に変換する
    const toSpace = removeNewline.replace(/\u3000/g, "■");
    console.error(toSpace);
  });
};

/**
 * 見出しレベルの検証結果を出力します。
 * */
export const articleHeadingLevelCheck = (mdFile: string) => {
  console.log(`${LOG_SEPARATOR}`);
  console.log("見出しレベルのチェックを行います。");

  console.log(`${LOG_INFO}正常に表示される見出し`);
  countSharp(mdFile);

  // TODO エラーがなかった時の出力の整理
  console.log(`\x1b[31m${LOG_ERROR}使用できない見出しレベルです！`);
  checkErrorHeading(mdFile);

  console.log(`\x1b[31m${LOG_ERROR}全角スペースが含まれています！`);
  checkErrorSpace(mdFile);

  console.info(`\x1b[39m${LOG_INFO}見出しレベルのチェック終了`);
};
