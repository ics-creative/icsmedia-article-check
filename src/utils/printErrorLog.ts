import { LOG_ERROR, LOG_WARN } from "../consts/consts";
import * as console from "console";

/**
 * エラーログを出力します。<br>
 * 例)<br>
 * [Error]: Request failed with status code 404 link:xxxxxxxxx<br>
 * [Error]: Request failed with status code 404 link:xxxxxxxxx<br>
 *
 * @param errorMessages エラーメッセージ
 */
export const printErrorLog = (errorMessages: string[]) => {
  errorMessages.forEach((message) => console.warn(`${LOG_ERROR}${message}`));
};

/**
 * 警告ログを出力します（リンク検証で確定できないケースなど）。
 *
 * @param warnMessages 警告メッセージ
 */
export const printWarnLog = (warnMessages: string[]) => {
  warnMessages.forEach((message) => console.warn(`${LOG_WARN}${message}`));
};

/**
 * 記事に問題がなかった場合にログを出力します。
 * */
export const printNoProblemLog = () => {
  console.log("✨ この記事に問題はありませんでした。");
};
