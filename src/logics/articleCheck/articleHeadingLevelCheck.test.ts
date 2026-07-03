import { describe, expect, it } from "vitest";
import { toHtmlText } from "../../utils/toHtmlText";
import { articleHeadingLevelCheck } from "./articleHeadingLevelCheck";

describe("articleHeadingLevelCheck", () => {
  it("h3 と h4 はエラーにならない", () => {
    const html = toHtmlText("### 見出し3\n\n#### 見出し4\n");
    expect(articleHeadingLevelCheck(html)).toEqual([]);
  });

  it("markdown の h2 見出しを検出する", () => {
    const html = toHtmlText("## 使えない見出し\n");
    const errors = articleHeadingLevelCheck(html);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/使用できない見出しレベル/);
  });

  it("id などの属性付き h タグ（生 HTML）も検出する", () => {
    const html = '<h2 id="foo" class="bar">使えない見出し</h2>\n';
    const errors = articleHeadingLevelCheck(html);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/使用できない見出しレベル/);
  });

  it("属性なしの h1/h5 タグも従来どおり検出する", () => {
    const html = "<h1>見出し1</h1>\n<h5>見出し5</h5>\n";
    const errors = articleHeadingLevelCheck(html);
    expect(errors.length).toBe(2);
  });

  it("# の直後に半角スペースがなく p タグに変換されたものを検出する", () => {
    const html = toHtmlText("本文\n\n###見出しのつもり\n");
    const errors = articleHeadingLevelCheck(html);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/半角スペースがない/);
  });

  it("# の直後に全角スペースが続き p タグに変換されたものを検出する", () => {
    const html = toHtmlText("本文\n\n###\u3000見出しのつもり\n");
    const errors = articleHeadingLevelCheck(html);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/全角スペース/);
  });
});
