/** 使用できない見出しを抽出するための正規表現（markdown-it-anchor の id など属性付きタグも対象） */
const PATTERN_ERROR = /(<h[1256](?:\s[^>]*)?>(?<!title:).+<\/h[1256]>)|(\n<p>#{2,}.+)/g;

/** 使用できないレベルのhタグの正規表現（属性付きタグも対象） */
const PATTERN_H_ERROR_LEVEL = /<h[1256](?:\s[^>]*)?>(?<!title:).+<\/h[1256]>/;

/** #の直後に全角スペースが続いてpタグに変換されたパターン */
const PATTERN_P_ERROR_SPACE = /<p>#{2,}\u3000.+/;

/** #の直後に半角スペースがなかったためpタグに変換されたパターン */
const PATTERN_P_ERROR_ZERO_SPACE = /<p>#{2,}[^#|\s]+/;

/** pタグに変換された後、h3とh4以外を設定しようとしていたパターン */
const PATTERN_P_ERROR_LEVEL = /<p>(#{2}|#{5,})(\s|\u3000|[^#]).+/;

/**
 * 使用できない見出しのパターンを使用していないかチェックを行います。
 * */
const checkErrorHeadings = (text: string): string[] => {
  // 使用できない見出しを抽出
  const errors = text.match(PATTERN_ERROR);

  const errorHeadings: string[] = [];
  errors?.forEach((heading) => {
    const errorMessages = [];
    // 使用できない見出しレベルを抽出
    if(PATTERN_H_ERROR_LEVEL.test(heading)){
      errorMessages.push("使用できない見出しレベルです。h3とh4が使用できます。\n");
    }

    // 見出しタグに変換できてないが文頭に#が連続で使われていて、見出しにする予定だったと思われる場合を抽出
    if (PATTERN_P_ERROR_SPACE.test(heading)) {
      errorMessages.push("全角スペースが含まれているためpタグに変換されています。");
    }
    if (PATTERN_P_ERROR_ZERO_SPACE.test(heading)) {
      errorMessages.push("#の直後に半角スペースがないためpタグに変換されています。");
    }
    if (PATTERN_P_ERROR_LEVEL.test(heading)) {
      errorMessages.push("使用できない見出しレベルです。h3とh4が使用できます。");
    }

    // エラー判定があった場合のみ配列に追加
    if (errorMessages.length > 0) {
      const result = errorMessages.join(",").replace(/,/g, "\n") + heading;
      errorHeadings.push(result);
    }
  });

  return errorHeadings;
};

/**
 * 見出しレベルにエラーがないか検証します。
 * @param html html形式の記事
 * */
export const articleHeadingLevelCheck = (html: string) => {
  return checkErrorHeadings(html);
};
