import { parse } from "node-html-parser";
import { notNull } from "../../utils/notNull";

type LinkCheckResult = {
  link: string;
  resUrl: string;
};

class LinkCheckError extends Error {
  constructor(
    readonly link: string,
    message: string,
  ) {
    super(message);
    this.name = "LinkCheckError";
  }
}

const defaultFetchHeaders = (): Record<string, string> => ({
  // 最小限の UA だけだと CDN に弾かれやすい
  "User-Agent":
    "Mozilla/5.0 (compatible; icsmedia-article-check/1.0; +https://ics.media)",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
});

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

  const requests = links.map((link) => fetchLink(link));

  // 並列で処理を行う
  const results = await Promise.allSettled(requests);
  // リクエストが失敗したもの or リクエストのurlとレスポンスのurlが違うものを抽出
  const expired = results.filter(res => res.status === "rejected" || !isSameUrl(res.value.link, res.value.resUrl));

  // エラーメッセージを構築
  const messages = expired.map((ex) => {
    if (ex.status === "rejected") {
      return formatRejectedReason(ex.reason);
    }
    return `リクエストとレスポンスのurlが異なっています。\nrequest:\n${ex.value.link}\nresponse:\n${ex.value.resUrl}`;
  });
  return messages;
};

const formatRejectedReason = (reason: unknown): string => {
  if (reason instanceof LinkCheckError) {
    return `${reason.message}\nlink:\n${reason.link}`;
  }
  return `${String(reason)}\nlink:\n（不明）`;
};

const fetchLink = async (link: string): Promise<LinkCheckResult> => {
  try {
    const res = await fetch(link, {
      method: "GET",
      redirect: "follow",
      headers: defaultFetchHeaders(),
    });
    if (!res.ok) {
      const detail = res.statusText ? ` ${res.statusText}` : "";
      throw new LinkCheckError(link, `HTTP ${res.status}${detail}`);
    }
    return { link, resUrl: res.url };
  } catch (e) {
    if (e instanceof LinkCheckError) {
      throw e;
    }
    const message = e instanceof Error ? e.message : String(e);
    throw new LinkCheckError(link, message);
  }
};

const isSameUrl = (url1: string, url2: string) => {
  const urlObj1 = new URL(url1);
  const urlObj2 = new URL(url2);
  // urlのoriginが一緒 かつ トレイリングスラッシュを除いたpathnameが一緒なら同じURLとする
  return urlObj1.origin === urlObj2.origin && withoutTrailingSlash(urlObj1.pathname) === withoutTrailingSlash(urlObj2.pathname);
};

// 最後が/(スラッシュ)でおわる文字列の正規表現
const REG_LAST_SLASH = /\/$/;

const withoutTrailingSlash = (str: string) =>
  REG_LAST_SLASH.test(str) ? str.slice(0, -1) : str;
