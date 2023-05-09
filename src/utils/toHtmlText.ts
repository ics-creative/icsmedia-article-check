import MarkdownIt from "markdown-it";

/**
 * 引数で受け取ったマークダウンファイルをHtml形式に変換します。
 * @param mdContent マークダウンファイル
 */
export const toHtmlText = (mdContent: string): string => {
  const md = new MarkdownIt();
  return md.render(mdContent);
};
