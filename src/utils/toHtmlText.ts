import { createMarkdownIt } from "./createMarkdownIt";

/**
 * 引数で受け取ったマークダウンファイルをHtml形式に変換します。
 * @param mdContent マークダウンファイル
 */
export const toHtmlText = (mdContent: string): string => {
  const md = createMarkdownIt();
  return md.render(mdContent);
};
