import { readDirectory } from "../../utils/readDirectory";
import { IMAGE_DIR } from "../../consts/consts";
import sizeOf from "image-size";
import { promisify } from "util";
import { printErrorLog } from "../../utils/printErrorLog";

const sizeOfSync = promisify(sizeOf);

const VALID_FILE_TYPE = ["jpg", "png"];

/**
 * アイキャッチ画像を検証します。
 * <ul>
 *   <li>画像は "引数で渡されたパス/images" ディレクトリの中にある前提です。</li>
 *   <li>画像の形式はjpg、pngのみです。</li>
 *   <li>画像のサイズが 縦512px、横1280px でない場合はエラーになります。</li>
 * </ul>
 * @param path 検証するパス
 */
export const eyecatchCheck = async (path: string) => {
  // "eyecatch"が含まれるファイルを取得
  const eyecatchDir = readDirectory(`${path}${IMAGE_DIR}`).filter((dir) => dir.name.startsWith("eyecatch"));

  if (eyecatchDir.length === 0) {
    printErrorLog(["アイキャッチ画像が存在しません。"]);
    return;
  }

  // 画像を検証
  const messages = await validate(`${path}${IMAGE_DIR}/${eyecatchDir.at(0)?.name}`);

  // ログ出力
  printErrorLog(messages);
};

const validate = async (path: string) => {
  // 画像情報を取得
  const result = await sizeOfSync(path);
  const messages: string[] = [];

  if(!result) {
    messages.push("アイキャッチ画像が不正です。");
    return messages;
  }

  if (!result.type || !VALID_FILE_TYPE.includes(result.type)) {
    messages.push(`アイキャッチ画像の形式はjpgかpngのみ有効です。type:${result.type}`);
  }

  if(result.width !== 1280) {
    messages.push(`アイキャッチ画像の横幅は1280pxである必要があります。width:${result.width}`);
  }

  if(result.height !== 512) {
    messages.push(`アイキャッチ画像の縦幅は512pxである必要があります。height:${result.height}`);
  }

  return messages;
};
