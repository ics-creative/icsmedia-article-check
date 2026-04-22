import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

/** リポジトリルート（本ファイルは src 直下） */
const projectRoot = path.resolve(__dirname, "..");

const runArticleCheck = async (fixtureSubdir: string) => {
  const fixture = path.join(projectRoot, "test/fixtures", fixtureSubdir);
  const tsNode = path.join(
    projectRoot,
    "node_modules/ts-node/register/transpile-only.js",
  );
  return execFileAsync(
    process.execPath,
    ["-r", tsNode, path.join(projectRoot, "src/index.ts")],
    {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_ENV: "development",
        ARTICLE_CHECK_BASE_PATH: fixture,
      },
    },
  );
};

describe("CLI（記事フィクスチャ結合）", () => {
  it(
    "有効な記事フィクスチャでチェックが通る",
    async () => {
      const { stdout, stderr } = await runArticleCheck("pass");
      const out = stderr + stdout;
      expect(out).toContain("✨ この記事に問題はありませんでした。");
      expect(out).not.toContain("[Error]:");
    },
    60_000,
  );

  it(
    "同一文書内アンカーが無いとエラーログが出る",
    async () => {
      const { stdout, stderr } = await runArticleCheck("bad-anchor");
      const out = stderr + stdout;
      expect(out).toContain("[Error]:");
      expect(out).toMatch(/アンカー先/);
      expect(out).toMatch(/#missing-anchor/);
      expect(out).not.toContain("✨ この記事に問題はありませんでした。");
    },
    60_000,
  );

  it(
    "関連記事が規定本数に足りないとエラーログが出る",
    async () => {
      const { stdout, stderr } = await runArticleCheck("bad-related");
      const out = stderr + stdout;
      expect(out).toContain("[Error]:");
      expect(out).toMatch(/関連記事が1点足りません/);
      expect(out).not.toContain("✨ この記事に問題はありませんでした。");
    },
    60_000,
  );

  it(
    "公開日が更新日より新しいとエラーログが出る",
    async () => {
      const { stdout, stderr } = await runArticleCheck("bad-dates-order");
      const out = stderr + stdout;
      expect(out).toContain("[Error]:");
      expect(out).toMatch(/公開日と更新日が不整合/);
      expect(out).toMatch(/published_date: 2026-04-20/);
      expect(out).toMatch(/modified_date: 2026-01-10/);
      expect(out).not.toContain("✨ この記事に問題はありませんでした。");
    },
    60_000,
  );
});
