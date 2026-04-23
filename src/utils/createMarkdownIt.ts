import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

/**
 * ics.media 記事の同一文書リンク（#fragment）と整合しやすいスラッグ。
 * markdown-it-anchor 既定の encodeURIComponent 方式だとフラグメントと一致しないため差し替える。
 */
const headingSlugify = (value: string): string =>
  String(value).trim().toLowerCase().replace(/\s+/g, "-");

/** 記事チェックと同一の Markdown → HTML 変換用インスタンスを生成する */
export const createMarkdownIt = (): MarkdownIt => {
  const md = new MarkdownIt({ html: true });
  md.use(markdownItAnchor, {
    slugify: headingSlugify,
    tabIndex: false,
  });
  return md;
};
