// Actualiza docs/data.json con datos de Instagram y Facebook desde Windsor.ai.
// Necesita la variable WINDSOR_API_KEY (se guarda como "secret" en GitHub, nunca en el código).
// Si algo falla, deja el archivo como estaba.
import { readFileSync, writeFileSync } from "node:fs";

const KEY = process.env.WINDSOR_API_KEY;
const FILE = new URL("../docs/data.json", import.meta.url);
if (!KEY) {
  console.log("Falta WINDSOR_API_KEY: no se actualiza nada.");
  process.exit(0);
}

const data = JSON.parse(readFileSync(FILE, "utf8"));

async function windsor(connector, fields) {
  const url = new URL(`https://connectors.windsor.ai/${connector}`);
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("date_preset", "last_7d");
  url.searchParams.set("fields", fields.join(","));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${connector}: HTTP ${res.status}`);
  const json = await res.json();
  const rows = Array.isArray(json) ? json : json.data;
  if (!Array.isArray(rows)) throw new Error(`${connector}: respuesta inesperada`);
  return rows;
}

let changed = false;
try {
  const rows = await windsor("instagram", ["date", "reach", "follower_count_1d", "accounts_engaged"]);
  if (rows.length) { data.instagram = rows; changed = true; }
} catch (e) { console.error(String(e.message)); }

try {
  const rows = await windsor("facebook_organic", ["date", "page_views_total", "page_impressions_unique", "page_daily_follows_unique"]);
  if (rows.length) { data.facebook = rows; changed = true; }
} catch (e) { console.error(String(e.message)); }

if (changed) {
  data.updatedAt = new Date().toISOString();
  delete data.note;
  writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
  console.log("data.json actualizado");
} else {
  console.log("Sin cambios.");
}
