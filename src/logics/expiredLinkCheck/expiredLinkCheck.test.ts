import { afterEach, describe, expect, it, vi } from "vitest";
import { expiredLinkCheck, shouldSkipLinkCheck } from "./expiredLinkCheck";

describe("shouldSkipLinkCheck", () => {
  it("フラグメントのみはスキップ", () => {
    expect(shouldSkipLinkCheck("#foo")).toBe(true);
    expect(shouldSkipLinkCheck("#")).toBe(true);
    expect(shouldSkipLinkCheck("")).toBe(true);
    expect(shouldSkipLinkCheck("  #x ")).toBe(true);
  });

  it("http(s) はスキップしない", () => {
    expect(shouldSkipLinkCheck("https://example.com")).toBe(false);
    expect(shouldSkipLinkCheck("http://example.com/a")).toBe(false);
  });
});

describe("expiredLinkCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("フラグメントのみのリンクでは fetch しない", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const msgs = await expiredLinkCheck('<p><a href="#x">t</a></p>');
    expect(msgs).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("絶対URLが 200 で同一 pathname ならエラーなし", async () => {
    const requestUrl = (input: RequestInfo | URL): string => {
      if (typeof input === "string") {
        return input;
      }
      if (input instanceof URL) {
        return input.href;
      }
      return input.url;
    };
    vi.spyOn(globalThis, "fetch").mockImplementation((input) =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        url: requestUrl(input).split("#")[0],
      } as Response),
    );
    const msgs = await expiredLinkCheck(
      '<p><a href="https://example.com/page#h">t</a></p>',
    );
    expect(msgs).toEqual([]);
  });
});
