import { notNull } from "../../utils/notNull";
import axios from "axios";
import { printErrorLog, printNoProblemLog } from "../../utils/printErrorLog";

/**
 * htmlに変換した記事からアンカーリンクを抽出し、リンク切れになっていないかを検証します。
 * @param html html形式の記事
 */
export const expiredLinkCheck = async (html: string[]) => {
  // htmlからリンクを抽出
  const links = html
    .flatMap(content => content.split(/["']/)) // クオーテーションで分割する
    .filter(notNull)
    .filter(content => content.startsWith("http")); // httpで始まるもの = リンク本体 だけを抜き出す

  // axiosでリクエストを送信する
  const requests = links.map(link => {
    return new Promise<Response>((resolve, reject) => {
      axios.get(link)
        .then((res: AxiosResult) => resolve({ link: link, statusCode: res.status, statusText: res.statusText }))
        .catch((err: Error) => reject({ link: link, message: err.message }));
    });
  });

  // 並列で処理を行う
  const results = await Promise.allSettled(requests);
  // status=200以外のものを抽出
  const expired = results.filter(res => res.status === "rejected" || res.value.statusCode !== 200);

  // エラーメッセージを構築
  const messages = expired.map((ex) => {
    return ex.status === "rejected" ?
    // Promiseのrejected.reasonのany型を解決できなかったのでeslintを一時的にdisable
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `${ex.reason.message as string}\nlink: ${ex.reason.link as string}` :
      `${ex.value.statusCode.toString()} ${ex.value.statusText}\nlink: ${ex.value.link}`;
  });

  // ログ出力
  printErrorLog(messages);
  printNoProblemLog();
};

type AxiosResult = {
  status: number,
  statusText: string,
}

type Response = {
  link: string,
  statusCode: number,
  statusText: string
}
