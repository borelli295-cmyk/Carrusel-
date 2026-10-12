// Genera docs/index.html (versión pública para GitHub Pages) a partir de contador/index.html.
// Las tarjetas de redes leen docs/data.json en lugar de los conectores de Claude.
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../contador/index.html", import.meta.url), "utf8");
const cut = src.indexOf("</style>") + "</style>".length;
let head = src.slice(0, cut);
let body = src.slice(cut);

function must(text, from, to) {
  if (!text.includes(from)) throw new Error("No se encontró: " + from.slice(0, 50));
  return text.split(from).join(to);
}

body = must(body, "Se refresca solo cada 5 minutos.", "Se actualiza cada hora.");
body = must(
  body,
  "  render();\n  initIg();\n",
  `  function initStatic(){
    IG_MSG.nodata="Todavía no hay datos de esta red. Se cargan cada hora.";
    function paint(){renderIg();renderFb();renderWeb();renderCompare()}
    fetch("data.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("sin datos");return r.json()}).then(function(d){
      var st=d.updatedAt?new Date(d.updatedAt):new Date();
      if(d.instagram&&d.instagram.length){igRows=d.instagram;igStatus="ok";igStamp=st}else{igStatus="nodata"}
      if(d.facebook&&d.facebook.length){fbRows=d.facebook;fbStatus="ok";fbStamp=st}else{fbStatus="nodata"}
      if(d.web&&d.web.timeSeries&&d.web.timeSeries.visitors){webData=d.web;webStatus="ok";webStamp=st}else{webStatus="nodata"}
      paint();
    }).catch(function(){igStatus="nodata";fbStatus="nodata";webStatus="nodata";paint()});
  }
  render();
  initStatic();
`
);

head = head.replace("<title>Contador de Entradas</title>", "");
const doc = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Contador de Entradas</title>
<meta name="description" content="Entradas, Instagram, Facebook y web de Radio Total San Luis 103.5.">
<meta name="theme-color" content="#1d1b22">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
${head}
</head>
<body>
${body}
<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}</script>
</body>
</html>
`;
writeFileSync(new URL("../docs/index.html", import.meta.url), doc);
console.log("docs/index.html generado");
