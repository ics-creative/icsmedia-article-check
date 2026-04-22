import { parse } from "node-html-parser";
import { notNull } from "../../utils/notNull";

type LinkCheckResult = {
  link: string;
  resUrl: string;
  /** npm 公開サイトのボット対策で 403 のみ。切れリンクとは断定できない */
  uncertainDueToNpmForbidden?: true;
};

export type ExpiredLinkCheckOutcome = {
  errors: string[];
  warnings: string[];
};

/** リンク検証失敗時に付与するリンク URL を保持するエラー */
class LinkCheckError extends Error {
  constructor(
    readonly link: string,
    message: string,
  ) {
    super(message);
    this.name = "LinkCheckError";
  }
}

/**
 * 同一文書内アンカー（`#見出し`）など、HTTP GET で検証できない href は true。
 * 相対パスは対象外（別途ベース URL が必要なため未対応）。
 */
export const shouldSkipLinkCheck = (href: string): boolean => {
  const t = href.trim();
  if (t === "" || t === "#") {
    return true;
  }
  return t.startsWith("#");
};

/** npm の Web 公開サイトはボット対策で 403 になりやすい */
const NPMJS_PUBLIC_HOSTS = new Set(["www.npmjs.com", "npmjs.com"]);

const isNpmJsPublicUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return (
      (u.protocol === "https:" || u.protocol === "http:") &&
      NPMJS_PUBLIC_HOSTS.has(u.hostname)
    );
  } catch {
    return false;
  }
};

/**
 * `https://www.npmjs.com/package/...` からパッケージ名を取り出します（`/v/` 以降のバージョン付き URL も名前のみに正規化）。
 * `/package/` 以外（トップや検索など）では null。
 */
const parseNpmPackageNameFromWebUrl = (href: string): string | null => {
  try {
    const u = new URL(href);
    if (!NPMJS_PUBLIC_HOSTS.has(u.hostname)) {
      return null;
    }
    const path = u.pathname.replace(/\/$/, "");
    const m = path.match(/^\/package\/(.+)$/);
    if (!m) {
      return null;
    }
    let rest = m[1];
    const vSep = rest.indexOf("/v/");
    if (vSep !== -1) {
      rest = rest.slice(0, vSep);
    }
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
};

/** www.npmjs.com は 403 になりやすいが、レジストリ API は通常到達できる */
const verifyNpmPackageViaRegistry = async (
  packageName: string,
  originalLink: string,
): Promise<LinkCheckResult> => {
  const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  const res = await fetch(registryUrl, {
    method: "HEAD",
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; icsmedia-article-check/1.0; +https://ics.media)",
    },
  });
  if (res.ok) {
    return { link: originalLink, resUrl: originalLink };
  }
  if (res.status === 404) {
    throw new LinkCheckError(
      originalLink,
      "npm レジストリにパッケージが存在しません（HTTP 404）。",
    );
  }
  const detail = res.statusText ? ` ${res.statusText}` : "";
  throw new LinkCheckError(
    originalLink,
    `npm レジストリの確認に失敗しました（HTTP ${res.status}${detail}）。`,
  );
};

/** リンク検証用 fetch のヘッダー（CDN等によるブロックを避けるためUA等を付与） */
const defaultFetchHeaders = (): Record<string, string> => ({
  // 最小限のUAだけだとCDNに弾かれやすい
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
export const expiredLinkCheck = async (
  html: string,
): Promise<ExpiredLinkCheckOutcome> => {
  const parsed = parse(html);
  // リンクを抽出
  const links = parsed.querySelectorAll("a")
    .map((l) => l.getAttribute("href"))
    .filter(notNull)
    .filter((href) => !shouldSkipLinkCheck(href));

  const requests = links.map((link) => fetchLink(link));

  // 並列で処理を行う
  const results = await Promise.allSettled(requests);

  const warnings = results
    .filter(
      (res): res is PromiseFulfilledResult<LinkCheckResult> =>
        res.status === "fulfilled" && res.value.uncertainDueToNpmForbidden === true,
    )
    .map(
      (res) =>
        `npm の公開サイトが自動アクセスを制限しているため（HTTP 403）、リンク切れかどうかは判定できません。ブラウザで確認してください。\nlink:\n${res.value.link}`,
    );

  // リクエストが失敗したもの or リクエストのurlとレスポンスのurlが違うものを抽出
  const expired = results.filter(
    (res) =>
      res.status === "rejected" ||
      (res.status === "fulfilled" &&
        !res.value.uncertainDueToNpmForbidden &&
        !isSameUrl(res.value.link, res.value.resUrl)),
  );

  // エラーメッセージを構築
  const errors = expired.map((ex) => {
    if (ex.status === "rejected") {
      return formatRejectedReason(ex.reason);
    }
    return `リクエストとレスポンスのurlが異なっています。\nrequest:\n${ex.value.link}\nresponse:\n${ex.value.resUrl}`;
  });
  return { errors, warnings };
};

/**
 * Promiseが rejectした理由をユーザー向けのエラー文に整形します。
 * @param reason rejectの値（LinkCheckErrorならメッセージとURLを含める）
 */
const formatRejectedReason = (reason: unknown): string => {
  if (reason instanceof LinkCheckError) {
    return `${reason.message}\nlink:\n${reason.link}`;
  }
  return `${String(reason)}\nlink:\n（不明）`;
};

/**
 * 1件のURLにGETし、最終的なレスポンスURLを返します。失敗時はLinkCheckErrorを投げます。
 * @param link 検証する絶対 URL
 */
const fetchLink = async (link: string): Promise<LinkCheckResult> => {
  try {
    if (isNpmJsPublicUrl(link)) {
      const packageName = parseNpmPackageNameFromWebUrl(link);
      if (packageName) {
        return await verifyNpmPackageViaRegistry(packageName, link);
      }
    }

    const res = await fetch(link, {
      method: "GET",
      redirect: "follow",
      headers: defaultFetchHeaders(),
    });
    // /package/ 以外の npm ページは www へ GET。403 のときは切れとは断定できないので警告のみ
    if (res.status === 403 && isNpmJsPublicUrl(link)) {
      return {
        link,
        resUrl: res.url,
        uncertainDueToNpmForbidden: true,
      };
    }
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

/**
 * リダイレクト後も「同一ページ」とみなせるか比較します（originとpathname、末尾スラッシュを正規化）。
 * @param url1 リクエストURL
 * @param url2 レスポンスの最終URL
 */
const isSameUrl = (url1: string, url2: string) => {
  const urlObj1 = new URL(url1);
  const urlObj2 = new URL(url2);
  // urlのoriginが一緒 かつ トレイリングスラッシュを除いたpathnameが一緒なら同じURLとする
  return urlObj1.origin === urlObj2.origin && withoutTrailingSlash(urlObj1.pathname) === withoutTrailingSlash(urlObj2.pathname);
};

// 最後が/(スラッシュ)でおわる文字列の正規表現
const REG_LAST_SLASH = /\/$/;

/** pathname末尾の `/` を除いて比較用に正規化します */
const withoutTrailingSlash = (str: string) =>
  REG_LAST_SLASH.test(str) ? str.slice(0, -1) : str;
