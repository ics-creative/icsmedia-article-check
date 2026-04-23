import { afterEach, describe, expect, it, vi } from "vitest";
import { toHtmlText } from "../../utils/toHtmlText";
import { expiredLinkCheck, shouldSkipLinkCheck } from "./expiredLinkCheck";

describe("shouldSkipLinkCheck", () => {
  it("空と # のみスキップ（#foo は同一文書検証の対象）", () => {
    expect(shouldSkipLinkCheck("#foo")).toBe(false);
    expect(shouldSkipLinkCheck("#")).toBe(true);
    expect(shouldSkipLinkCheck("")).toBe(true);
    expect(shouldSkipLinkCheck("  #  ")).toBe(true);
  });

  it("http(s) はスキップしない", () => {
    expect(shouldSkipLinkCheck("https://example.com")).toBe(false);
    expect(shouldSkipLinkCheck("http://example.com/a")).toBe(false);
    expect(shouldSkipLinkCheck("https://www.npmjs.com/package/react")).toBe(
      false,
    );
  });
});

const requestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
};

describe("expiredLinkCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("同一文書の # リンクは id があれば OK で fetch しない", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { errors, warnings } = await expiredLinkCheck(
      '<h2 id="x">X</h2><p><a href="#x">t</a></p>',
    );
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("同一文書にアンカー先が無い # リンクはエラー（fetch しない）", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="#missing">t</a></p>',
    );
    expect(warnings).toEqual([]);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/アンカー先/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("a[name] もアンカー先として認める", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { errors, warnings } = await expiredLinkCheck(
      '<a name="legacy"></a><p><a href="#legacy">t</a></p>',
    );
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("markdown-it 見出しに付与された id と #fragment が一致すれば OK（fetch しない）", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const md = "### マルチページ対応\n\n[同一文書へ](#マルチページ対応)\n";
    const { errors, warnings } = await expiredLinkCheck(toHtmlText(md));
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("npm のパッケージページはレジストリ HEAD で存在確認する", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      (input, init) => {
        const url = requestUrl(input);
        expect(url).toMatch(/^https:\/\/registry\.npmjs\.org\//);
        expect(init?.method).toBe("HEAD");
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          url,
        } as Response);
      },
    );
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="https://www.npmjs.com/package/react">npm</a></p>',
    );
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("npm パッケージがレジストリに無いときはエラー", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = requestUrl(input);
      expect(url).toContain("registry.npmjs.org");
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url,
      } as Response);
    });
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="https://www.npmjs.com/package/this-package-is-missing-xyz">npm</a></p>',
    );
    expect(warnings).toEqual([]);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/レジストリにパッケージが存在しません/);
  });

  it("npm の /package/ 以外は www へ GET し 403 なら警告だけ", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      (input) => {
        const url = requestUrl(input);
        expect(url).toContain("www.npmjs.com");
        return Promise.resolve({
          ok: false,
          status: 403,
          statusText: "Forbidden",
          url,
        } as Response);
      },
    );
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="https://www.npmjs.com/search?q=react">s</a></p>',
    );
    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/HTTP 403/);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("npm 以外が HTTP 403 なら報告する", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        url: "https://example.com/forbidden",
      } as Response),
    );
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="https://example.com/forbidden">x</a></p>',
    );
    expect(warnings).toEqual([]);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/HTTP 403/);
  });

  it("HTTP 403 以外のエラーは報告する", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: "https://example.com/missing",
      } as Response),
    );
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="https://example.com/missing">x</a></p>',
    );
    expect(warnings).toEqual([]);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/HTTP 404/);
  });

  it("絶対URLが 200 で同一 pathname ならエラーなし", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        url: requestUrl(input).split("#")[0],
      } as Response),
    );
    const { errors, warnings } = await expiredLinkCheck(
      '<p><a href="https://example.com/page#h">t</a></p>',
    );
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });
});
