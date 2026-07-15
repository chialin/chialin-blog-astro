import path from "node:path";
import sharp from "sharp";

const dimensionCache = new Map();

function collectImages(node, out) {
  if (node.tagName === "img") out.push(node);
  for (const child of node.children ?? []) collectImages(child, out);
}

async function getDimensions(src) {
  const file = path.join(process.cwd(), "public", decodeURI(src));
  if (dimensionCache.has(file)) return dimensionCache.get(file);

  let dim = null;
  try {
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height) {
      // EXIF 方向 5-8 是旋轉 90 度，寬高要對調
      const swapped = (meta.orientation ?? 1) >= 5;
      dim = {
        width: swapped ? meta.height : meta.width,
        height: swapped ? meta.width : meta.height,
      };
    }
  } catch {
    // 檔案不存在或非圖片格式：只補 lazy，不補尺寸
  }
  dimensionCache.set(file, dim);
  return dim;
}

/**
 * 內文 Markdown 圖片最佳化：
 * - 補 loading="lazy" + decoding="async"（內文圖都在折疊線以下）
 * - 對 public/ 內的本地圖片補 width/height，避免載入時版面跳動（CLS）
 */
export default function rehypeLazyImages() {
  return async (tree) => {
    const images = [];
    collectImages(tree, images);

    await Promise.all(
      images.map(async (node) => {
        const props = node.properties ?? (node.properties = {});
        props.loading ??= "lazy";
        props.decoding ??= "async";

        const src = props.src;
        const isLocal = typeof src === "string" && src.startsWith("/");
        if (isLocal && !props.width && !props.height) {
          const dim = await getDimensions(src);
          if (dim) {
            props.width = dim.width;
            props.height = dim.height;
          }
        }
      }),
    );
  };
}
