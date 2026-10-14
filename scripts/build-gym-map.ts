/**
 * Build-time gym map. Run with `npm run build:map`, then commit src/data/gym-map.json.
 *
 * 1. Reads the gym database (xlsx, sheet "gyms").
 * 2. Geocodes each gym to its ZIP centroid (US Census ZCTA Gazetteer). Rows without a usable
 *    ZIP fall back to the city + state centroid (US Census Places Gazetteer).
 * 3. Projects points with d3-geo geoAlbersUsa (contiguous US only for the visual).
 * 4. Builds a regular dot grid clipped to the contiguous US outline (us-atlas).
 * 5. Bins gyms into grid cells and writes only {x, y, count} per cell plus totals.
 *
 * No names, phones, emails, or addresses ever leave this script.
 */
import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { unzipSync, strFromU8 } from "fflate";
import { geoAlbersUsa, geoContains } from "d3-geo";
import { feature, merge } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, MultiPolygon, FeatureCollection, Geometry } from "geojson";

const GYM_XLSX =
  process.env.GYM_XLSX ?? "C:/Users/willc/Desktop/Kanvas USA Gym Database/usa_combat_gyms_master.xlsx";
const ROOT = path.resolve(__dirname, "..");
const CACHE = path.join(ROOT, "scripts/.cache");
const OUT = path.join(ROOT, "src/data/gym-map.json");

const GAZ_YEAR = "2024";
const ZCTA_URL = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${GAZ_YEAR}_Gazetteer/${GAZ_YEAR}_Gaz_zcta_national.zip`;
const PLACE_URL = `https://www2.census.gov/geo/docs/maps-data/data/gazetteer/${GAZ_YEAR}_Gazetteer/${GAZ_YEAR}_Gaz_place_national.zip`;

// Visual canvas (SVG viewBox units) and grid spacing.
const WIDTH = 1000;
const HEIGHT = 620;
const STEP = 10;

const NON_CONTIGUOUS = new Set(["02", "15", "60", "66", "69", "72", "78"]); // AK, HI, territories
const NON_CONTIGUOUS_USPS = new Set(["AK", "HI", "PR", "GU", "VI", "AS", "MP"]);

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.", FL: "Florida", GA: "Georgia", HI: "Hawaii",
  ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

async function fetchGazetteer(url: string): Promise<string> {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, path.basename(url));
  if (!fs.existsSync(file)) {
    console.log(`Downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const files = unzipSync(new Uint8Array(fs.readFileSync(file)));
  const txt = Object.keys(files).find((n) => n.endsWith(".txt"));
  if (!txt) throw new Error(`No .txt inside ${file}`);
  return strFromU8(files[txt]);
}

function parseTsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const head = lines[0].split("\t").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    const row: Record<string, string> = {};
    head.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

const PLACE_SUFFIX =
  /\s+(city and borough|consolidated government|unified government|metropolitan government|metro government|urban county|city|town|village|borough|CDP|municipality|plantation|comunidad|zona urbana)(\s*\(.*\))?$/i;

function normCity(s: string): string {
  return s
    .toLowerCase()
    .replace(PLACE_SUFFIX, "")
    .replace(/\(.*\)/g, "")
    .replace(/^st\.?\s/, "saint ")
    .replace(/^ft\.?\s/, "fort ")
    .replace(/^mt\.?\s/, "mount ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  // --- Gazetteers -----------------------------------------------------------
  const zcta = new Map<string, [number, number]>();
  for (const r of parseTsv(await fetchGazetteer(ZCTA_URL))) {
    zcta.set(r.GEOID, [parseFloat(r.INTPTLONG), parseFloat(r.INTPTLAT)]);
  }
  const places = new Map<string, [number, number]>();
  for (const r of parseTsv(await fetchGazetteer(PLACE_URL))) {
    const key = `${normCity(r.NAME)}|${r.USPS}`;
    if (!places.has(key)) places.set(key, [parseFloat(r.INTPTLONG), parseFloat(r.INTPTLAT)]);
  }
  console.log(`Gazetteers: ${zcta.size} ZCTAs, ${places.size} places`);

  // --- Gyms -----------------------------------------------------------------
  const wb = XLSX.readFile(GYM_XLSX);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["gyms"], { defval: "" });
  const total = rows.length;

  type Pt = { lon: number; lat: number; state: string };
  const points: Pt[] = [];
  let byZip = 0, byCity = 0, skipped = 0;
  const stateCounts: Record<string, number> = {};

  for (const row of rows) {
    const state = String(row.state ?? "").trim().toUpperCase();
    if (state) stateCounts[state] = (stateCounts[state] ?? 0) + 1;

    const zipRaw = String(row.zip ?? "").trim();
    const zip = zipRaw.match(/^\d{3,5}/)?.[0]?.padStart(5, "0");
    let ll = zip ? zcta.get(zip) : undefined;
    if (ll) byZip++;
    else {
      const city = normCity(String(row.city ?? ""));
      ll = city && state ? places.get(`${city}|${state}`) : undefined;
      if (ll) byCity++;
    }
    if (!ll) {
      skipped++;
      continue;
    }
    points.push({ lon: ll[0], lat: ll[1], state });
  }
  console.log(`Geocoded: ${byZip} by ZIP, ${byCity} by city+state, ${skipped} skipped (of ${total})`);

  // --- Outline + projection --------------------------------------------------
  const topo = JSON.parse(
    fs.readFileSync(path.join(ROOT, "node_modules/us-atlas/states-10m.json"), "utf8"),
  ) as Topology<{ states: GeometryCollection }>;
  const contiguousGeoms = topo.objects.states.geometries.filter(
    (g) => !NON_CONTIGUOUS.has(String(g.id).padStart(2, "0")),
  );
  const lower48 = merge(topo, contiguousGeoms as never) as MultiPolygon;
  const lower48Feature: Feature<MultiPolygon> = { type: "Feature", properties: {}, geometry: lower48 };
  const fc: FeatureCollection<Geometry> = { type: "FeatureCollection", features: [lower48Feature] };

  const projection = geoAlbersUsa().fitExtent(
    [
      [STEP, STEP],
      [WIDTH - STEP, HEIGHT - STEP],
    ],
    fc,
  );

  // --- Dot grid clipped to the outline -----------------------------------------
  const cols = Math.floor(WIDTH / STEP);
  const rowsN = Math.floor(HEIGHT / STEP);
  const land = new Set<string>();
  const cellKey = (c: number, r: number) => `${c},${r}`;
  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * STEP + STEP / 2;
      const y = r * STEP + STEP / 2;
      const ll = projection.invert?.([x, y]);
      if (ll && geoContains(lower48Feature, ll)) land.add(cellKey(c, r));
    }
  }
  console.log(`Grid: ${land.size} land dots (${cols}x${rowsN})`);

  // --- Bin gyms into cells -----------------------------------------------------
  const counts = new Map<string, number>();
  let offGrid = 0, nonContiguous = 0;
  for (const p of points) {
    if (NON_CONTIGUOUS_USPS.has(p.state)) {
      nonContiguous++;
      continue;
    }
    const xy = projection([p.lon, p.lat]);
    if (!xy) {
      offGrid++;
      continue;
    }
    let c = Math.floor(xy[0] / STEP);
    let r = Math.floor(xy[1] / STEP);
    if (!land.has(cellKey(c, r))) {
      // Coastal points can land just outside the clipped grid. Snap to the nearest land cell.
      let best: [number, number] | null = null;
      let bestD = Infinity;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++) {
          if (!land.has(cellKey(c + dc, r + dr))) continue;
          const d = dc * dc + dr * dr;
          if (d < bestD) (bestD = d), (best = [c + dc, r + dr]);
        }
      if (!best) {
        offGrid++;
        continue;
      }
      [c, r] = best;
    }
    const k = cellKey(c, r);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  console.log(`Binned: ${points.length - offGrid - nonContiguous} on map, ${nonContiguous} AK/HI (count toward total only), ${offGrid} off grid`);

  // --- Output ----------------------------------------------------------------
  // Compact tuples: [x, y, count]. Sorted west to east so the entrance stagger is cheap.
  const cells: [number, number, number][] = [...land]
    .map((k) => {
      const [c, r] = k.split(",").map(Number);
      return [c * STEP + STEP / 2, r * STEP + STEP / 2, counts.get(k) ?? 0] as [number, number, number];
    })
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => STATE_NAMES[s] ?? s);

  const data = {
    width: WIDTH,
    height: HEIGHT,
    step: STEP,
    total,
    /** Rounded down to the nearest thousand for the headline ("11,000+"). */
    headline: Math.floor(total / 1000) * 1000,
    topStates,
    cells,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data));
  const maxCount = Math.max(...cells.map((c) => c[2]));
  console.log(`Wrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB). Max cell count ${maxCount}. Top states: ${topStates.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
