import {LOG_ERROR, LOG_INFO, LOG_SEPARATOR} from "../consts/consts";

export const expiredLinkCheck = (html: string[]) => {
  // TODO リンクのチェックを行う
  console.log(html);
  console.log(`${LOG_SEPARATOR}`);
  console.log("リンク切れのチェックを行います。");
  console.warn(`${LOG_ERROR}リンクが切れています！ エラー位置：xxxxxx`);
  console.info(`${LOG_INFO}終了`);
};
