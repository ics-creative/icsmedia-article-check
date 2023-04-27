import MarkdownIt from "markdown-it";

/** HTMLのセパレーター(改行コード) */
const SEPARATOR = /\n/g;

/**
 * 引数で受け取ったマークダウンファイルをHtml形式に変換します。
 * @param mdContent マークダウンファイル
 */
export const toHtml = (mdContent: string) => {
  const md = new MarkdownIt();
  return md.render(mdContent).split(SEPARATOR);
};
