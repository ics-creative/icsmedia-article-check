import axios, { AxiosResponse } from "axios";
import { printErrorLog } from "../../utils/printErrorLog";
import { parse } from "node-html-parser";
import { notNull } from "../../utils/notNull";

/**
 * htmlに変換した記事からアンカーリンクを抽出し、リンク切れになっていないかを検証します。
 * @param html html形式の記事
 */
export const expiredLinkCheck = async (html: string) => {
  const parsed = parse(html);
  // リンクを抽出
  const links = parsed.querySelectorAll("a")
    .map((l) => l.getAttribute("href"))
    .filter(notNull);

  // axiosでリクエストを送信する
  const requests = links.map(link => {
    return new Promise<Response>((resolve, reject) => {
      axios.get(link)
        .then((res: AxiosResponse) => {
          const request = res.request as {res: {responseUrl: string}};
          resolve({ link, resUrl: request.res.responseUrl });
        })
        .catch((err: Error) => reject({ link: link, message: err.message }));
    });
  });

  // 並列で処理を行う
  const results = await Promise.allSettled(requests);
  // リクエストが失敗したもの or リクエストのurlとレスポンスのurlが違うものを抽出
  const expired = results.filter(res => res.status === "rejected" || res.value.resUrl !== res.value.link);
  // エラーメッセージを構築
  const messages = expired.map((ex) => {
    return ex.status === "rejected" ?
    // Promiseのrejected.reasonのany型を解決できなかったのでeslintを一時的にdisable
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `${ex.reason.message as string} link:${ex.reason.link as string}` :
      `リクエストとレスポンスのurlが異なっています。\nrequest:\n${ex.value.link}\nresponse:\n${ex.value.resUrl}`;
  });
  // ログ出力
  printErrorLog(["リンク切れのチェックを行います。"], messages);
};

type Response = {
  link: string,
  resUrl: string
}
