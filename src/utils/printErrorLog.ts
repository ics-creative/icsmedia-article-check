import { LOG_ERROR, LOG_INFO, LOG_SEPARATOR } from "../consts/consts";
import * as console from "console";

/** エラーをカウントするための変数*/
let numberOfErrors = 0;

/**
 * エラーログを出力します。<br>
 * 例)<br>
 * -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-<br>
 * リンク切れのチェックを行います。<br>
 * [Error]: Request failed with status code 404 link:xxxxxxxxx<br>
 * [Error]: Request failed with status code 404 link:xxxxxxxxx<br>
 * [INFO]:終了
 *
 * @param startMessages ログの最初に出力するメッセージ (ex: ◯◯のチェックを行います。)
 * @param errorMessages エラーメッセージ
 */
export const printErrorLog = (startMessages: string[], errorMessages: string[]) => {
  // エラーがあった場合のみメッセージを出力
  if (errorMessages.length > 0) {
    numberOfErrors++;
    console.log(`${LOG_SEPARATOR}`);
    startMessages.forEach((message) => console.log(message));
    errorMessages.forEach((message) => console.warn(`${LOG_ERROR}${message}`));
    console.log(`${LOG_INFO}終了`);
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
