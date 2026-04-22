import { afterEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import {
  getPath,
  normalizeArticleId,
  parseArticleIdFromArgv,
} from "./getPath";
import { ENTRY_DIR } from "../consts/consts";

describe("normalizeArticleId", () => {
  it("trim と ics.media entry URL の正規化", () => {
    expect(normalizeArticleId(" 200317 ")).toBe("200317");
    expect(
      normalizeArticleId("https://ics.media/entry/200317/"),
    ).toBe("200317");
  });
});

describe("parseArticleIdFromArgv", () => {
  it("- で始まると例外", () => {
    expect(() => parseArticleIdFromArgv(["--help"])).toThrow(/記事ID/);
  });
});

describe("getPath", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("開発・パス入力なら path.resolve する", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const rel = path.join("test", "fixtures", "pass");
    const expected = path.resolve(process.cwd(), rel);
    await expect(getPath({ articleId: rel })).resolves.toBe(expected);
    await expect(getPath({ articleId: `./${rel}` })).resolves.toBe(expected);
  });

  it("開発・記事 ID のみなら ENTRY_DIR 配下", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(getPath({ articleId: "260410" })).resolves.toBe(
      `${process.cwd()}${ENTRY_DIR}/260410`,
    );
  });

  it("本番・パス風文字列でも ENTRY_DIR 配下（開発専用の緩和はしない）", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(getPath({ articleId: "./foo/bar" })).resolves.toBe(
      `${process.cwd()}${ENTRY_DIR}/./foo/bar`,
    );
  });
});
