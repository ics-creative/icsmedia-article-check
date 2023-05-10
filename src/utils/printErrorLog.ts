import { LOG_ERROR } from "../consts/consts";
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
 * 記事に問題がなかった場合にログを出力します。
 * */
export const printNoProblemLog = () => {
  console.log("✨ この記事に問題はありませんでした。");
};
