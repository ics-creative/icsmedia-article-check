import {LOG_ERROR, LOG_INFO, LOG_SEPARATOR} from "../consts/consts";

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
  console.log(`${LOG_SEPARATOR}`);
  startMessages.forEach((message) => console.log(message));
  errorMessages.forEach((message) => console.warn(`${LOG_ERROR}${message}`));
  console.log(`${LOG_INFO}終了`);
};
