import { describe, expect, it } from "vitest";
import { RELATED_ARTICLE_COUNT } from "../../consts/consts";
import { articleRelatedCheck } from "./articleRelatedCheck";

const nineIds = "1,2,3,4,5,6,7,8,9";
const eightIds = "1,2,3,4,5,6,7,8";
const tenIds = "1,2,3,4,5,6,7,8,9,10";

/** 先頭の `---` 〜 `related:` 〜 閉じ `---` までに、`related` 行と閉じの間に1行以上必要（正規表現の都合） */
const mdWithRelated = (relatedLine: string) =>
  `---
title: test
${relatedLine}
dummy: x
---

# 本文
`;

describe("articleRelatedCheck", () => {
  it(`related が ${RELATED_ARTICLE_COUNT} 件ならエラーなし`, () => {
    expect(articleRelatedCheck(mdWithRelated(`related: ${nineIds}`))).toEqual([]);
  });

  it("1件少ないとメッセージあり", () => {
    const r = articleRelatedCheck(mdWithRelated(`related: ${eightIds}`));
    expect(r.length).toBe(1);
    expect(r[0]).toContain("足りません");
  });

  it("1件多いとメッセージあり", () => {
    const r = articleRelatedCheck(mdWithRelated(`related: ${tenIds}`));
    expect(r.length).toBe(1);
    expect(r[0]).toContain("多い");
  });

  it("重複があるとメッセージあり", () => {
    const r = articleRelatedCheck(
      mdWithRelated("related: 1,1,2,3,4,5,6,7,8"),
    );
    expect(r.length).toBe(1);
    expect(r[0]).toContain("重複");
  });
});
