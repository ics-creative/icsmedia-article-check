import path from "path";

/** 開発環境で使用したい記事が格納されているパス。適宜修正してください。 */
export const DEV_PATH = "/Users/ics-kitagawa/Documents/git/ics-articles/entry/230413";

/** 本番環境で使用する記事が格納されているパス。 */
export const PROD_PATH = path.resolve(__dirname);
