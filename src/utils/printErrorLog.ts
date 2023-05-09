import { LOG_ERROR } from "../consts/consts";
import * as console from "console";

/** エラーをカウントするための変数*/
let numberOfErrors = 0;

/**
 * エラーログを出力します。<br>
 * 例)<br>
 * [Error]: Request failed with status code 404 link:xxxxxxxxx<br>
 * [Error]: Request failed with status code 404 link:xxxxxxxxx<br>
 *
 * @param errorMessages エラーメッセージ
 */
export const printErrorLog = (errorMessages: string[]) => {
  // エラーがあった場合のみメッセージを出力
  if (errorMessages.length > 0) {
    numberOfErrors++;
    errorMessages.forEach((message) => console.warn(`${LOG_ERROR}${message}`));
  }
};

/**
 * 記事に問題がなかった場合にログを出力します。<br>
 * <strong>※リンク切れをチェックする関数内で実行します。</strong>
 * */
export const printNoProblemLog = () => {
  if (numberOfErrors === 0) {
    console.log("✨ この記事に問題はありませんでした。");
  }
};
