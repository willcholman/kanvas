/**
 * Build-time brand asset pipeline. Run once with `npm run build:brand`, then commit the output.
 *
 * Reads the source PNGs from the Kanvas Website Assets folder and writes:
 *   src/components/brand/logo-data.ts   traced SVG path data (recolorable with currentColor)
 *   src/app/icon.svg                     favicon (vector)
 *   src/app/favicon.ico                  16/32/48 favicon
 *   src/app/apple-icon.png               180x180 apple-touch-icon
 *   src/app/opengraph-image.png          1200x630 share image
 *   src/app/twitter-image.png            same, for Twitter/X
 *   public/brand/*.png                   optimized 2x PNG fallbacks
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
// potrace ships without types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const potrace = require("potrace") as {
  trace: (
    file: Buffer,
    opts: Record<string, unknown>,
    cb: (err: Error | null, svg: string) => void,
  ) => void;
};

const SRC = process.env.KANVAS_ASSETS ?? "C:/Users/willc/Desktop/Kanvas Website Assets";
const ROOT = path.resolve(__dirname, "..");
const out = (...p: string[]) => path.join(ROOT, ...p);

const NEON = "#beeb3b";

async function prepBitmap(file: string, width: number): Promise<{ buf: Buffer; w: number; h: number }> {
  // Downscale, flatten onto white, soften the stair-stepped source edges, then threshold
  // so potrace sees a clean, smooth silhouette.
  const img = sharp(path.join(SRC, file))
    .flatten({ background: "#ffffff" })
    .resize({ width })
    .greyscale()
    .blur(1.2)
    .threshold(128);
  const buf = await img.png().toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width!, h: meta.height! };
}

function trace(buf: Buffer): Promise<string> {
  return new Promise((resolve, reject) =>
    potrace.trace(
      buf,
      { turdSize: 20, alphaMax: 1.1, optCurve: true, optTolerance: 0.4, threshold: 128, color: "#000" },
      (err, svg) => (err ? reject(err) : resolve(svg)),
    ),
  );
}

function pathD(svg: string): string {
  const m = svg.match(/ d="([^"]+)"/);
  if (!m) throw new Error("No path found in traced SVG");
  return m[1].trim();
}

/** Split a potrace path into subpaths (each begins with M). */
function subpaths(d: string): string[] {
  return d
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function firstX(sub: string): number {
  const m = sub.match(/^M\s*([\d.\-]+)[ ,]([\d.\-]+)/);
  return m ? parseFloat(m[1]) : 0;
}

/** Round coordinates to 1 decimal to keep the payload small. */
function compact(d: string): string {
  return d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(parseFloat(n) * 10) / 10)).replace(/\s+/g, " ");
}

/** Bounding box of a path's absolute coordinates (potrace emits absolute M/C/L). */
function bbox(d: string) {
  const nums = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i]); maxX = Math.max(maxX, nums[i]);
    minY = Math.min(minY, nums[i + 1]); maxY = Math.max(maxY, nums[i + 1]);
  }
  return { minX, minY, maxX, maxY };
}

function ico(pngs: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function main() {
  fs.mkdirSync(out("src/components/brand"), { recursive: true });
  fs.mkdirSync(out("public/brand"), { recursive: true });

  // 1. Wordmark: trace, then split the K strokes from the "anvas" letters so the nav can tuck.
  const word = await prepBitmap("kanvaslogoblack.png", 2400);
  const wordD = pathD(await trace(word.buf));
  const subs = subpaths(wordD);
  // The K occupies roughly the left 26% of the wordmark.
  const kCut = word.w * 0.265;
  const kSubs = subs.filter((s) => firstX(s) < kCut);
  const restSubs = subs.filter((s) => firstX(s) >= kCut);
  const kD = compact(kSubs.join(" "));
  const anvasD = compact(restSubs.join(" "));
  const kBox = bbox(kD);
  const allBox = bbox(compact(wordD));

  // 2. Standalone K mark (square artwork).
  const mark = await prepBitmap("kanvaslogomarkblack.png", 1200);
  const markD = compact(pathD(await trace(mark.buf)));
  const markBox = bbox(markD);

  // 2b. Wordmark with the ™ (footer).
  const wordTm = await prepBitmap("kanvaslogoblacktm.png", 2400);
  const wordTmD = compact(pathD(await trace(wordTm.buf)));
  const tmBox = bbox(wordTmD);

  // Tight viewBoxes with a hair of padding.
  const pad = 2;
  const wordVB = [allBox.minX - pad, allBox.minY - pad, allBox.maxX - allBox.minX + pad * 2, allBox.maxY - allBox.minY + pad * 2].map((n) => Math.round(n));
  const markVB = [markBox.minX - pad, markBox.minY - pad, markBox.maxX - markBox.minX + pad * 2, markBox.maxY - markBox.minY + pad * 2].map((n) => Math.round(n));
  const tmVB = [tmBox.minX - pad, tmBox.minY - pad, tmBox.maxX - tmBox.minX + pad * 2, tmBox.maxY - tmBox.minY + pad * 2].map((n) => Math.round(n));
  const kWidth = Math.round(kBox.maxX - wordVB[0] + pad);

  const ts = `// Generated by scripts/build-brand-assets.ts. Do not edit by hand.
export const WORDMARK = {
  viewBox: "${wordVB.join(" ")}",
  width: ${wordVB[2]},
  height: ${wordVB[3]},
  /** Width of the K portion, in viewBox units, measured from the left edge. */
  kWidth: ${kWidth},
  k: "${kD}",
  anvas: "${anvasD}",
} as const;

export const WORDMARK_TM = {
  viewBox: "${tmVB.join(" ")}",
  width: ${tmVB[2]},
  height: ${tmVB[3]},
  d: "${wordTmD}",
} as const;

export const MARK = {
  viewBox: "${markVB.join(" ")}",
  width: ${markVB[2]},
  height: ${markVB[3]},
  d: "${markD}",
} as const;
`;
  fs.writeFileSync(out("src/components/brand/logo-data.ts"), ts);

  const svgOf = (vb: number[], d: string, fill: string, extra = "") =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}"${extra}><path fill="${fill}" fill-rule="evenodd" d="${d}"/></svg>`;

  // 3. Favicon SVG: black K, flips to white in dark browser chrome.
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${markVB.join(" ")}"><style>path{fill:#0a0a0a}@media (prefers-color-scheme:dark){path{fill:#ffffff}}</style><path fill-rule="evenodd" d="${markD}"/></svg>`;
  fs.writeFileSync(out("src/app/icon.svg"), iconSvg);

  // Square tile renderer: K mark centered on a background with padding.
  const tile = async (size: number, bg: string, fg: string, padRatio: number) => {
    const inner = Math.round(size * (1 - padRatio * 2));
    const markPng = await sharp(Buffer.from(svgOf(markVB, markD, fg))).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
      .composite([{ input: markPng, gravity: "center" }])
      .png()
      .toBuffer();
  };

  const icoPngs = await Promise.all([16, 32, 48].map(async (s) => ({ size: s, data: await tile(s, "#ffffff", "#0a0a0a", 0.08) })));
  fs.writeFileSync(out("src/app/favicon.ico"), ico(icoPngs));
  fs.writeFileSync(out("src/app/apple-icon.png"), await tile(180, "#ffffff", "#0a0a0a", 0.18));

  // 4. OG image: black, white wordmark, neon accent line.
  const W = 1200, H = 630;
  const logoW = 640;
  const logoH = Math.round((logoW * wordVB[3]) / wordVB[2]);
  const logoX = (W - logoW) / 2;
  const logoY = (H - logoH) / 2 - 24;
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="100%" r="70%">
      <stop offset="0" stop-color="${NEON}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${NEON}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0a0a0a"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <svg x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" viewBox="${wordVB.join(" ")}"><path fill="#ffffff" fill-rule="evenodd" d="${kD} ${anvasD}"/></svg>
  <rect x="${(W - 120) / 2}" y="${logoY + logoH + 56}" width="120" height="6" rx="3" fill="${NEON}"/>
</svg>`;
  const ogPng = await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(out("src/app/opengraph-image.png"), ogPng);
  fs.writeFileSync(out("src/app/twitter-image.png"), ogPng);

  // 5. Optimized PNG fallbacks for email and anywhere SVG isn't welcome (2x of display size).
  await sharp(Buffer.from(svgOf(markVB, markD, "#0a0a0a"))).resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out("public/brand/kanvas-mark-black-96.png"));
  await sharp(Buffer.from(svgOf(wordVB, `${kD} ${anvasD}`, "#0a0a0a"))).resize({ width: 320 }).png().toFile(out("public/brand/kanvas-wordmark-black-320.png"));

  console.log("Wordmark viewBox", wordVB.join(" "), "kWidth", kWidth, `subpaths K=${kSubs.length} anvas=${restSubs.length}`);
  console.log("Mark viewBox", markVB.join(" "));
  console.log("Bytes: logo-data.ts", fs.statSync(out("src/components/brand/logo-data.ts")).size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
