import fs from "node:fs";
import { IMAGE_DIR, MD_NAME } from "../../consts/consts";
import { readDirectory } from "../../utils/readDirectory";
import { printErrorLog } from "../../utils/printErrorLog";

/**
 * 引数で渡されたパス配下のファイルの容量を検証します。<br>
 * 10MBを超えていた場合はエラーログを出力します。
 * @param path 検証するパス
 */
export const fileCapacityCheck = (path: string) => {
  let totalByte = 0;

  // マークダウンファイルの容量を取得
  totalByte += getFileSize(`${path}/${MD_NAME}`);

  // images配下のファイルの容量を取得
  const images = readDirectory(`${path}${IMAGE_DIR}`);
  images.forEach((image) => {
    totalByte += getFileSize(`${path}${IMAGE_DIR}/${image.name}`);
  });

  // MBに変換
  const totalMb = totalByte / (1024*1024);

  // ログ出力
  const message = totalMb > 10 ? [`容量が10MBを超えています。size: ${Math.round(totalMb)}MB `] : [];
  printErrorLog(["記事と画像の容量チェックを行います。"], message);
};

const getFileSize = (filePath: string) => {
  const stat = fs.statSync(filePath);
  return stat.size;
};


