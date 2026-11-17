// Vintage Garment Finder: Cloudflare Worker (free plan). No AI, no database, no libraries.
// Deploy: Workers & Pages > Create Worker > paste this whole file > Deploy.
// Optional secrets (Settings > Variables and Secrets):
//   EBAY_CLIENT_ID, EBAY_CLIENT_SECRET          eBay Browse API (without them eBay falls back to HTML)
//   GRAILED_ALGOLIA_APP_ID, GRAILED_ALGOLIA_KEY Grailed's public Algolia search keys
// Optional plain variables: DISABLED_SITES="depop,grailed"   EBAY_MARKETPLACE="EBAY_US"
const INDEX_HTML = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<meta name=\"robots\" content=\"noindex\">\n<title>Vintage Garment Finder</title>\n<style>\n:root {\n  --bg: #e6e9df; --panel: #f6f7f1; --ink: #161c14; --muted: #5b6655; --line: #c6cdbc;\n  --shell: #3b4d36; --shell-deep: #232e1f; --on-shell: #eef1e6;\n  --lining: #ee6a14; --lining-soft: #fbe3d0; --on-lining: #1f0f03;\n  --brass: #8f7218; --fav: #cfe5bf; --must: #ffd98a; --bad: #a3321c;\n  --display: \"Bahnschrift\", \"DIN Alternate\", \"Avenir Next Condensed\", \"Roboto Condensed\", \"Arial Narrow\", system-ui, sans-serif;\n  --body: system-ui, -apple-system, \"Segoe UI\", \"Hiragino Sans\", \"Yu Gothic UI\", Meiryo, \"Noto Sans JP\", sans-serif;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #131811; --panel: #1b2219; --ink: #e5e9dd; --muted: #98a38f; --line: #344030;\n    --shell: #a7c19b; --shell-deep: #0d120c; --on-shell: #e5e9dd;\n    --lining: #ff7d2e; --lining-soft: #3b2413; --on-lining: #1f0f03;\n    --brass: #d8b655; --fav: #31482a; --must: #6a5310; --bad: #ff9b83;\n  }\n}\n* { box-sizing: border-box; }\nhtml { -webkit-text-size-adjust: 100%; }\nbody { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 var(--body); }\nh1, h2, h3, th, .btn, .langname { font-family: var(--display); font-stretch: 87%; }\nh1 { margin: 0; font-size: clamp(1.7rem, 4.6vw, 2.6rem); font-weight: 600; line-height: 1.05; letter-spacing: .005em; }\nh2 { margin: 0 0 4px; font-size: 1.35rem; font-weight: 600; }\nh3 { margin: 0; font-size: 1.05rem; font-weight: 600; }\na { color: inherit; text-underline-offset: 2px; }\nbutton, input, select, textarea { font: inherit; color: inherit; }\n:focus-visible { outline: 2px solid var(--lining); outline-offset: 2px; }\n[hidden] { display: none !important; }\n\n/* The header is the jacket shell; the orange strip is its lining. */\n.top { background: var(--shell-deep); color: var(--on-shell); border-bottom: 6px solid var(--lining); }\n.top .in { max-width: 1280px; margin: 0 auto; padding: 22px 20px 18px; display: flex; gap: 16px; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; }\n.top p { margin: 6px 0 0; color: #b9c3ae; max-width: 60ch; }\n.top .btn { border-color: #7d8c73; color: var(--on-shell); }\nmain { max-width: 1280px; margin: 0 auto; padding: 18px 20px 60px; display: grid; gap: 16px; }\n.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 18px; }\n.hint { color: var(--muted); font-size: .9rem; margin: 0; }\n\n.fields { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px 16px; }\n.f { grid-column: span 4; min-width: 0; }\n.f.w6 { grid-column: span 6; } .f.w12 { grid-column: span 12; } .f.w3 { grid-column: span 3; }\n.f > label, .f > .lab { display: block; font-weight: 600; margin-bottom: 5px; }\n.f small { font-weight: 400; color: var(--muted); }\ninput[type=text], input[type=search], select, textarea {\n  width: 100%; padding: 8px 10px; background: var(--bg); border: 1px solid var(--line); border-radius: 4px;\n}\ntextarea { font: 12.5px/1.5 ui-monospace, Consolas, Menlo, monospace; min-height: 260px; resize: vertical; white-space: pre; }\n.chips { display: flex; flex-wrap: wrap; gap: 6px; }\n.chip { position: relative; cursor: pointer; }\n.chip input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }\n.chip span { display: block; padding: 5px 11px; border: 1px solid var(--line); border-radius: 3px; background: var(--bg); user-select: none; }\n.chip span i { font-style: normal; color: var(--muted); font-size: .82em; margin-left: 4px; }\n.chip input:checked + span { background: var(--shell); border-color: var(--shell); color: var(--panel); }\n.chip input:checked + span i { color: inherit; opacity: .75; }\n.chip input:focus-visible + span { outline: 2px solid var(--lining); outline-offset: 2px; }\n.chip.term input:not(:checked) + span { text-decoration: line-through; color: var(--muted); }\n.rar { display: flex; align-items: center; gap: 12px; }\n.rar input { flex: 1; accent-color: var(--lining); }\n.stars { color: var(--brass); letter-spacing: 1px; white-space: nowrap; }\n.stars b { font-weight: 400; color: var(--line); }\n\n.actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; }\n.btn { padding: 8px 16px; font-size: 1.02rem; font-weight: 600; border: 1px solid var(--shell); border-radius: 4px; background: transparent; cursor: pointer; }\n.btn:hover { background: color-mix(in srgb, var(--shell) 12%, transparent); }\n.btn.primary { background: var(--lining); border-color: var(--lining); color: var(--on-lining); }\n.btn.primary:hover { filter: brightness(1.06); background: var(--lining); }\n.btn.small { padding: 4px 10px; font-size: .93rem; }\n.btn:disabled { opacity: .45; cursor: not-allowed; }\n.grow { flex: 1; }\n\n#savedList { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }\n.savedItem { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 4px; background: var(--bg); }\n.savedItem button { border: 0; background: none; padding: 6px 10px; cursor: pointer; }\n.savedItem button + button { border-left: 1px solid var(--line); color: var(--muted); }\n.savedItem.on { border-color: var(--lining); }\n\n.groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; margin-top: 12px; }\n.group { border: 1px solid var(--line); border-radius: 4px; padding: 12px; background: var(--bg); }\n.lang { margin-top: 10px; }\n.langname { display: block; color: var(--muted); font-size: .95rem; margin-bottom: 4px; }\n.add { display: flex; gap: 6px; margin-top: 12px; }\n#links { margin-top: 14px; }\n#links ul { margin: 8px 0 0; padding-left: 18px; columns: 2 320px; }\n#links li { break-inside: avoid; }\n#progress { display: grid; gap: 6px; margin-top: 14px; }\n.prow { display: grid; grid-template-columns: 170px 150px 1fr; gap: 12px; align-items: center; font-size: .93rem; }\n.pbar { height: 8px; background: var(--line); border-radius: 4px; overflow: hidden; }\n.pbar i { display: block; height: 100%; width: 0; background: var(--shell); transition: width .25s; }\n.prow.fail .pbar i { background: var(--bad); }\n.prow.fail .msg { color: var(--bad); }\n\n.tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 12px 0; }\n.tools input[type=search] { width: 220px; }\n.tools select { width: auto; }\n#used { margin-bottom: 10px; font-size: .92rem; }\n#used dl { margin: 8px 0 0; display: grid; grid-template-columns: max-content 1fr; gap: 3px 14px; }\n#used dt { font-weight: 600; } #used dd { margin: 0; color: var(--muted); }\n.tablewrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 4px; }\ntable.res { width: 100%; border-collapse: collapse; font-size: .93rem; }\n.res th { position: sticky; top: 0; z-index: 1; text-align: left; font-size: 1rem; font-weight: 600; padding: 9px 10px; background: var(--shell-deep); color: var(--on-shell); white-space: nowrap; cursor: pointer; user-select: none; vertical-align: bottom; }\n.res th small { display: block; font: 400 .72rem/1.2 var(--body); opacity: .75; white-space: normal; max-width: 13ch; }\n.res th[aria-sort]::after { content: \" ▲\"; font-size: .7em; } .res th[aria-sort=descending]::after { content: \" ▼\"; }\n.res td { padding: 8px 10px; border-top: 1px solid var(--line); vertical-align: top; }\n.res tr.t5 td:first-child { box-shadow: inset 4px 0 0 var(--lining); }\n.res tr.target { background: var(--lining-soft); }\n.res tr.below { opacity: .62; }\n.res td.thumb { width: 84px; padding: 6px 6px 6px 10px; }\n.res td.thumb img, .res td.thumb .noimg { display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 3px; background: var(--line); }\n.res td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }\n.res td.aud { font-weight: 600; }\n.res td.ttl { min-width: 260px; max-width: 460px; }\n.res td.ttl a { text-decoration-color: var(--line); }\n.res td.notes { color: var(--muted); min-width: 150px; }\n.res td.site, .res td.type { white-space: nowrap; }\nmark { border-radius: 2px; padding: 0 2px; color: inherit; } mark.fav { background: var(--fav); } mark.must { background: var(--must); }\n.tag { display: inline-block; font-size: .78rem; line-height: 1.5; padding: 0 6px; border: 1px solid var(--muted); border-radius: 3px; margin: 0 4px 2px 0; white-space: nowrap; }\n.tag.new, .tag.target { background: var(--lining); border-color: var(--lining); color: var(--on-lining); font-weight: 600; }\n.tag.possible { border-style: dashed; cursor: pointer; background: none; }\n.tag.confirmed { background: var(--fav); border-color: var(--shell); }\n.sub { font-size: .85rem; color: var(--muted); margin-top: 3px; }\n.empty { padding: 28px 16px; text-align: center; color: var(--muted); }\n\n.shade { position: fixed; inset: 0; background: rgba(10, 14, 8, .5); z-index: 20; }\n.drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(860px, 100vw); background: var(--panel); border-left: 6px solid var(--lining); z-index: 21; transform: translateX(102%); transition: transform .22s ease; display: flex; flex-direction: column; visibility: hidden; }\n.drawer.open { transform: none; visibility: visible; }\n.drawer header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--line); }\n.drawer .body { padding: 16px 18px 40px; overflow-y: auto; display: grid; gap: 14px; align-content: start; }\n.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }\n.card { border: 1px solid var(--line); border-radius: 4px; background: var(--bg); overflow: hidden; display: flex; flex-direction: column; }\n.card img, .card .noimg { width: 100%; aspect-ratio: 1; object-fit: cover; background: var(--line); display: block; }\n.card .txt { padding: 9px 10px; font-size: .9rem; flex: 1; }\n.card .dec { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); }\n.card .dec button { border: 0; background: none; padding: 9px 0; cursor: pointer; font-family: var(--display); font-weight: 600; }\n.card .dec button + button { border-left: 1px solid var(--line); }\n.card .dec button:hover { background: color-mix(in srgb, var(--shell) 14%, transparent); }\n.card .dec .yes { color: var(--shell); } .card .dec .no { color: var(--bad); }\n.card.unsure { opacity: .7; }\n#toast { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); background: var(--shell-deep); color: var(--on-shell); padding: 10px 16px; border-radius: 4px; border-bottom: 3px solid var(--lining); z-index: 40; max-width: min(560px, 92vw); }\nfooter { max-width: 1280px; margin: 0 auto; padding: 0 20px 30px; color: var(--muted); font-size: .88rem; }\n\n@media (max-width: 900px) { .f, .f.w3, .f.w6 { grid-column: span 6; } }\n@media (max-width: 620px) {\n  .f, .f.w3, .f.w6 { grid-column: span 12; } main { padding: 12px 10px 50px; } .panel { padding: 14px 12px; }\n  .prow { grid-template-columns: 1fr 90px; } .prow .msg { grid-column: 1 / -1; }\n  .tools input[type=search], .tools select { width: 100%; } .tools .grow { display: none; } .tools .btn { flex: 1 1 auto; }\n  .res thead { display: none; }\n  .res tr { display: grid; grid-template-columns: 84px 1fr auto; gap: 2px 10px; padding: 10px; border-top: 1px solid var(--line); }\n  .res td { padding: 0; border: 0; min-width: 0 !important; }\n  .res td.thumb { grid-row: 1 / span 5; padding: 0; } .res td.ttl { grid-column: 2 / -1; order: -1; }\n  .res td.site, .res td.notes { grid-column: 2 / -1; } .res td.num { text-align: left; }\n  .res td:empty { display: none; }\n  .res tr.t5 td:first-child { box-shadow: none; } .res tr.t5 { box-shadow: inset 4px 0 0 var(--lining); }\n}\n@media (prefers-reduced-motion: reduce) { .drawer, .pbar i { transition: none; } }\n</style>\n</head>\n<body>\n<header class=\"top\"><div class=\"in\">\n  <div>\n    <h1>Vintage Garment Finder</h1>\n    <p>One search across the Japanese, Western and Chinese resale sites. Fixed rules decide what is rare, so a search costs nothing.</p>\n  </div>\n  <button class=\"btn\" id=\"settingsBtn\" type=\"button\">Settings</button>\n</div></header>\n\n<main>\n  <section class=\"panel\" id=\"saved\" hidden>\n    <h2>Saved searches</h2>\n    <div id=\"savedList\"></div>\n  </section>\n\n  <section class=\"panel\" id=\"form\">\n    <div class=\"fields\">\n      <div class=\"f\"><label for=\"profile\">Brand profile</label>\n        <select id=\"profile\"></select></div>\n      <div class=\"f\"><label for=\"brand\">Brand <small id=\"brandHint\">typed as you would search it</small></label>\n        <input type=\"text\" id=\"brand\" autocomplete=\"off\" placeholder=\"e.g. Issey Sport\"></div>\n      <div class=\"f\"><label for=\"kana\">Katakana spelling <small>optional</small></label>\n        <input type=\"text\" id=\"kana\" autocomplete=\"off\" placeholder=\"e.g. イッセイスポーツ\"></div>\n      <div class=\"f w6\"><span class=\"lab\">Garment type</span><div class=\"chips\" id=\"types\"></div></div>\n      <div class=\"f w3\"><span class=\"lab\">Era</span><div class=\"chips\" id=\"eras\"></div></div>\n      <div class=\"f w3\"><label for=\"colour\">Favourite colour <small>highlighted, not filtered</small></label>\n        <select id=\"colour\"></select></div>\n      <div class=\"f\"><label for=\"sizeText\">Size <small>highlighted when the listing states it</small></label>\n        <div class=\"chips\" id=\"sizes\" style=\"margin-bottom:6px\"></div>\n        <input type=\"text\" id=\"sizeText\" autocomplete=\"off\" placeholder=\"Other sizes, comma separated\"></div>\n      <div class=\"f\"><label for=\"must\">Must-have words <small>comma separated; matches go to the top</small></label>\n        <input type=\"text\" id=\"must\" autocomplete=\"off\" placeholder=\"e.g. back logo, for your information\"></div>\n      <div class=\"f\"><label for=\"exclude\">Exclude words <small>comma separated</small></label>\n        <input type=\"text\" id=\"exclude\" autocomplete=\"off\" placeholder=\"e.g. kids, replica\"></div>\n      <div class=\"f w12\"><span class=\"lab\">Sites</span><div class=\"chips\" id=\"sites\"></div></div>\n      <div class=\"f w6\"><label for=\"minRarity\">Minimum rarity</label>\n        <div class=\"rar\"><input type=\"range\" id=\"minRarity\" min=\"1\" max=\"5\" step=\"1\" value=\"3\"><span id=\"minLabel\"></span></div></div>\n      <div class=\"f w3\"><label for=\"pages\">Result pages per term</label>\n        <select id=\"pages\"><option value=\"1\">1 page (fastest)</option><option value=\"2\">2 pages</option><option value=\"3\">3 pages</option></select></div>\n    </div>\n    <div class=\"actions\"><button class=\"btn primary\" id=\"previewBtn\" type=\"button\">Preview terms</button>\n      <p class=\"hint\">Nothing is sent until you press Open searches or Collect results.</p></div>\n  </section>\n\n  <section class=\"panel\" id=\"plan\" hidden>\n    <h2>Search terms</h2>\n    <p class=\"hint\" id=\"planHint\"></p>\n    <div class=\"groups\" id=\"planGroups\"></div>\n    <div class=\"actions\">\n      <button class=\"btn\" id=\"openBtn\" type=\"button\">Open searches</button>\n      <button class=\"btn primary\" id=\"collectBtn\" type=\"button\">Collect results</button>\n      <span class=\"grow\"></span>\n      <input type=\"text\" id=\"saveName\" placeholder=\"Name this search\" style=\"width:200px\" autocomplete=\"off\">\n      <button class=\"btn\" id=\"saveBtn\" type=\"button\">Save search</button>\n    </div>\n    <p class=\"hint\" id=\"planNote\" style=\"margin-top:8px\"></p>\n    <details id=\"links\"><summary>All search links</summary><ul></ul></details>\n    <div id=\"progress\" aria-live=\"polite\"></div>\n  </section>\n\n  <section class=\"panel\" id=\"results\" hidden>\n    <h2>Results</h2>\n    <p class=\"hint\" id=\"counts\"></p>\n    <div class=\"tools\">\n      <input type=\"search\" id=\"filter\" placeholder=\"Filter titles\" aria-label=\"Filter titles\">\n      <select id=\"sortSel\" aria-label=\"Sort by\">\n        <option value=\"default:1\">Sort: best first</option><option value=\"aud:1\">Price, low to high</option><option value=\"aud:-1\">Price, high to low</option>\n        <option value=\"tier:-1\">Rarity</option><option value=\"site:1\">Site</option><option value=\"type:1\">Type</option><option value=\"title:1\">Title</option>\n      </select>\n      <button class=\"btn small\" id=\"hiddenBtn\" type=\"button\"></button>\n      <button class=\"btn small\" id=\"checkBtn\" type=\"button\"></button>\n      <span class=\"grow\"></span>\n      <button class=\"btn small\" id=\"csvBtn\" type=\"button\">Download CSV</button>\n      <button class=\"btn small\" id=\"copyBtn\" type=\"button\">Copy as table</button>\n    </div>\n    <details id=\"used\"><summary>Terms searched on each site</summary><dl></dl></details>\n    <div class=\"tablewrap\"><table class=\"res\">\n      <thead><tr>\n        <th data-k=\"\">Photo</th><th data-k=\"tier\">Rarity</th>\n        <th data-k=\"aud\">A$ approx.<small>before shipping and proxy fees</small></th>\n        <th data-k=\"price\">Original price</th><th data-k=\"site\">Site</th><th data-k=\"title\">Title</th>\n        <th data-k=\"type\">Type</th><th data-k=\"size\">Size</th><th data-k=\"notes\">Notes</th>\n      </tr></thead>\n      <tbody id=\"rows\"></tbody>\n    </table></div>\n  </section>\n</main>\n<footer id=\"foot\"></footer>\n\n<div class=\"shade\" id=\"shade\" hidden></div>\n<aside class=\"drawer\" id=\"checker\" aria-label=\"Photo checker\">\n  <header><div><h2>Check photos</h2><p class=\"hint\">These titles don't settle it. Open the listing if the thumbnail isn't enough.</p></div>\n    <button class=\"btn small\" data-close type=\"button\">Close</button></header>\n  <div class=\"body\"><div class=\"cards\" id=\"cards\"></div></div>\n</aside>\n<aside class=\"drawer\" id=\"settings\" aria-label=\"Settings\">\n  <header><h2>Settings</h2><button class=\"btn small\" data-close type=\"button\">Close</button></header>\n  <div class=\"body\">\n    <div><h3>Brand profiles</h3>\n      <p class=\"hint\">Each profile holds the brand spellings and the rules: <code>brandPatterns</code>, <code>lineRequired</code>, <code>possiblePatterns</code>, <code>excludePatterns</code>, <code>tiers</code> (5 to 2), <code>capAt</code>, <code>noteRules</code> and <code>confirmBoost</code>. Patterns are case-insensitive regular expressions. The <code>generic</code> profile is used for brands with no profile, and its note rules apply to every brand.</p>\n      <textarea id=\"profilesBox\" spellcheck=\"false\"></textarea></div>\n    <div><h3>Search dictionaries</h3>\n      <p class=\"hint\">Garment, era, colour and detail words in English, Japanese and Chinese. Words under <code>match</code> are only used to recognise the garment type in titles, not to search.</p>\n      <textarea id=\"dictBox\" spellcheck=\"false\"></textarea></div>\n    <p class=\"hint\" id=\"settingsMsg\" role=\"status\"></p>\n    <div class=\"actions\" style=\"margin-top:0\">\n      <button class=\"btn primary\" id=\"saveSettings\" type=\"button\">Save and re-score</button>\n      <button class=\"btn\" id=\"resetSettings\" type=\"button\">Restore built-in rules</button>\n      <button class=\"btn\" id=\"exportSettings\" type=\"button\">Export settings</button>\n      <button class=\"btn\" id=\"importSettings\" type=\"button\">Import settings</button>\n      <button class=\"btn\" id=\"clearChecks\" type=\"button\">Clear photo decisions</button>\n      <input type=\"file\" id=\"importFile\" accept=\".json,application/json\" hidden>\n    </div>\n    <p class=\"hint\">Everything is kept in this browser only. Export settings before clearing browser data, or to copy your rules to another device.</p>\n  </div>\n</aside>\n<div id=\"toast\" role=\"status\" hidden></div>\n\n<script>\n'use strict';\n/*CORE-START*/\n// ---------- data: sites, dictionaries, brand profiles ----------\nconst MAX_TERMS = 15, MAX_REQUESTS = 190, MAX_PER_TERM = 300, CACHE_MS = 15 * 60 * 1000;\nconst TIER_LABEL = { 5: 'Grail', 4: 'Rare', 3: 'Uncommon', 2: 'Common', 1: 'Basic' };\nconst SITES = [\n  { id: 'mercari', name: 'Mercari JP', group: 'jp', layer2: true, url: 'https://jp.mercari.com/search?keyword={q}&status=on_sale' },\n  { id: 'yahoo_auctions', name: 'Yahoo Auctions JP', group: 'jp', layer2: true, url: 'https://auctions.yahoo.co.jp/search/search?p={q}&n=100' },\n  { id: 'yahoo_flea', name: 'Yahoo Flea Market JP', group: 'jp', layer2: true, url: 'https://paypayfleamarket.yahoo.co.jp/search/{q}?open=1' },\n  { id: 'rakuma', name: 'Rakuma JP', group: 'jp', layer2: true, url: 'https://fril.jp/s?query={q}&transaction=selling' },\n  { id: 'second_street', name: '2nd Street JP', group: 'jp', layer2: false, url: 'https://www.2ndstreet.jp/search?keyword={q}' },\n  { id: 'ebay', name: 'eBay', group: 'west', layer2: true, url: 'https://www.ebay.com/sch/i.html?_nkw={q}&_ipg=240' },\n  { id: 'grailed', name: 'Grailed', group: 'west', layer2: true, url: 'https://www.grailed.com/shop?query={q}' },\n  { id: 'depop', name: 'Depop', group: 'west', layer2: true, url: 'https://www.depop.com/search/?q={q}' },\n  { id: 'xianyu', name: 'Xianyu', group: 'cn', layer2: false, url: 'https://www.goofish.com/search?q={q}' },\n  { id: 'taobao', name: 'Taobao', group: 'cn', layer2: false, url: 'https://s.taobao.com/search?q={q}' },\n];\nconst GROUPS = [\n  { id: 'jp', label: 'Japanese sites' },\n  { id: 'west', label: 'Western sites' },\n  { id: 'cn', label: 'Chinese sites' },\n];\nconst LANG_LABEL = { ja: 'Japanese', en: 'English', zh: 'Chinese', own: 'Added by you' };\nconst ERAS = ['70s', '80s', '90s', '00s', 'Y2K'];\nconst SIZE_BOXES = ['S', 'M', 'L', 'XL', 'JP 9'];\n\nconst DEFAULT_DICT = {\n  garments: {\n    tee: { label: 'Tee', en: ['tee', 't-shirt'], ja: ['Tシャツ'], zh: ['T恤'], match: ['半袖'] },\n    longsleeve: { label: 'Long sleeve', en: ['long sleeve'], ja: ['ロンT', '長袖'], zh: ['长袖'], match: ['ロングスリーブ', 'longsleeve'] },\n    hoodie: { label: 'Hoodie', en: ['hoodie'], ja: ['パーカー'], zh: ['卫衣'], match: ['フーディ', 'パーカ', 'hooded'] },\n    sweater: { label: 'Sweater', en: ['sweater', 'sweatshirt'], ja: ['スウェット', 'ニット'], zh: ['毛衣'], match: ['トレーナー', 'セーター', 'crewneck', 'knit'] },\n    bomber: { label: 'Bomber / blouson', en: ['bomber', 'blouson', 'MA-1'], ja: ['ボンバージャケット', 'ブルゾン', 'MA-1', 'スタジャン'], zh: ['飞行员夹克'], match: ['ボンバー', 'フライトジャケット', 'flight jacket', 'varsity'] },\n    jacket: { label: 'Jacket', en: ['jacket'], ja: ['ジャケット'], zh: ['夹克'] },\n    coat: { label: 'Coat', en: ['coat'], ja: ['コート', 'ロングコート'], zh: ['大衣'] },\n  },\n  era: { en: ['80s', '90s', '00s', 'y2k', 'vintage', 'archive'], ja: ['ヴィンテージ', 'ビンテージ', '古着', 'アーカイブ'], zh: ['古着', '中古'] },\n  colours: {\n    green: { en: ['green'], ja: ['グリーン', '深緑', 'カーキ'], zh: ['绿色'] },\n    navy: { en: ['navy'], ja: ['ネイビー', '紺'], zh: ['藏蓝'] },\n    black: { en: ['black'], ja: ['黒'], zh: [] },\n  },\n  details: [\n    { en: 'back logo', ja: 'バックロゴ', zh: '背标' },\n    { en: 'patch', ja: 'ワッペン', zh: '' },\n    { en: 'embroidered', ja: '刺繍', zh: '刺绣' },\n    { en: 'reversible', ja: 'リバーシブル', zh: '' },\n  ],\n};\n\nconst DEFAULT_PROFILES = {\n  generic: {\n    name: 'Generic rules (any brand)',\n    excludePatterns: '(?<!防)風|-style|bootleg|ブートレグ|パロディ|perfume|香水|サングラス|sunglasses',\n    tiers: {\n      '4': 'skull|スカル|ドクロ|reversible|リバーシブル|leather|レザー|back ?logo|バックロゴ|patch|ワッペン',\n      '3': 'camo|迷彩|back ?print|バックプリント|3d|立体|single ?stitch|シングルステッチ|両面',\n      '2': 'logo|ロゴ',\n    },\n    capAt: [],\n    noteRules: [\n      { pattern: '長袖|long ?sleeve|ロンt', note: 'Long sleeve' },\n      { pattern: 'usa製|アメリカ製|made in u\\\\.?s\\\\.?a', note: 'Made in USA' },\n      { pattern: '日本製|made in japan', note: 'Made in Japan' },\n      { pattern: 'デッドストック|dead ?stock|未使用|nwt', note: 'Deadstock or unworn' },\n      { pattern: '難あり|訳あり|ジャンク|ダメージ|damaged|stain|シミ|汚れ', note: 'Flaws mentioned' },\n      { pattern: 'シングルステッチ|single ?stitch', note: 'Single stitch' },\n      { pattern: 'リバーシブル|reversible', note: 'Reversible' },\n    ],\n    confirmBoost: 4,\n  },\n  'oakley-software': {\n    name: 'Oakley Software (vintage tees)',\n    brandNames: ['oakley', 'oakley software', 'オークリー', 'オークリー ソフトウェア'],\n    brandPatterns: 'oakley|オークリー(?!フ)',\n    excludePatterns: 'monster ?dog|juliet|x-?metal|half ?jacket|frogskin|over ?the ?top|サングラス(?!柄)|ゴーグル|キャップ|パンツ|ゴルフ|風|bootleg',\n    tiers: {\n      '5': 'mad ?scientist|マッドサイエンティスト|bob ?head|3d ?skull|3dスカル|flame ?bob|flaming eclipse',\n      '4': 'mad ?science|skull|スカル|ドクロ|propeller|プロペラ|torpedo|魚雷|gun|銃|robot|reflective|sawtooth|flame|フレイム',\n      '3': 'thermonuclear|factory ?pilot|frog|camo|迷彩|3d|立体|surf|サーフ|cyber|バックプリント|両面|single ?stitch',\n      '2': 'logo|ロゴ|センターロゴ|刺繍|software|ソフトウェア',\n    },\n    capAt: [{ pattern: 'piet|ピート', tier: 2 }],\n    confirmBoost: 4,\n  },\n  'issey-sport': {\n    name: 'Issey Miyake I.S. / Issey Sport (bombers, coats)',\n    brandNames: ['I.S.', 'issey sport', 'イッセイスポーツ', 'アイエス イッセイミヤケ', 'ツモリチサト I.S.', 'I.S. chisato tsumori'],\n    brandPatterns: 'issey|イッセイ|miyake|ミヤケ|tsumori|ツモリ',\n    lineRequired: 'i\\\\.\\\\s?s\\\\.|issey ?sports?|イッセイ\\\\s?スポーツ|アイエス|tsumori ?design|chisato ?tsumori|ツモリ\\\\s?チサト',\n    possiblePatterns: '(80s|80年代).*(issey|イッセイ).*(bomber|ボンバー|ブルゾン|コート)',\n    excludePatterns: 'スカート|ワンピ|プリーツ|pleats please|bao ?bao|homme plisse|im men|132|eau|perfume|パータン|テーラード',\n    tiers: {\n      '5': 'bomber|ボンバー|ma-?1|スタジャン|varsity|for your information|バックロゴ.*(コート|ブルゾン)',\n      '4': 'ブルゾン|blouson|レザー|leather|ムートン|リバーシブル|reversible|ワッペン|patch|ロゴ',\n      '3': 'コート|coat|ジャケット|jacket',\n    },\n    capAt: [{ pattern: 'sunao|スナオ|クワハラ', tier: 3 }],\n    confirmBoost: 5,\n  },\n};\n\n// ---------- small helpers ----------\nconst clone = o => JSON.parse(JSON.stringify(o));\nconst list = s => String(s || '').split(/[,、，\\n]/).map(x => x.trim()).filter(Boolean);\nconst norm = s => String(s == null ? '' : s).normalize('NFKC');\nconst hasCJK = s => /[぀-ヿ㐀-鿿]/.test(s);\nconst escRe = s => String(s).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');\nconst looseRe = s => escRe(norm(s).trim()).replace(/\\s+/g, '\\\\s*');\nlet LOOKBEHIND = true;\ntry { new RegExp('(?<![a-z])a'); } catch (e) { LOOKBEHIND = false; }\nconst rxCache = new Map();\nfunction rx(pattern) { // case-insensitive regex from a rule string; empty or broken rules never match\n  if (!pattern) return null;\n  if (!rxCache.has(pattern)) {\n    let r = null;\n    try { r = new RegExp(pattern, 'i'); } catch (e) { r = null; }\n    rxCache.set(pattern, r);\n  }\n  return rxCache.get(pattern);\n}\nfunction wordRe(word) { // dictionary word -> pattern: \"t-shirt\" also finds \"t shirt\" and \"tshirts\", but not \"coating\" for \"coat\"\n  const w = norm(word).trim();\n  if (!w) return '';\n  let p = escRe(w).replace(/[\\s-]+/g, '[\\\\s-]?');\n  if (/^[a-z0-9]/i.test(w)) p = (LOOKBEHIND ? '(?<![a-z])' : '(?:^|[^a-z])') + p;\n  if (/[a-z]$/i.test(w)) p += 's?(?![a-z])';\n  else if (/[0-9]$/.test(w)) p += '(?![0-9])';\n  return p;\n}\nconst SIZE_RES = [\n  ['(?:サイズ|size)\\\\s*[:：]?\\\\s*(XXL|XL|XS|[SML]|F|\\\\d{1,2})(?![a-z0-9])', 'i'],\n  ['(?<![a-z0-9])(XXL|XL|XS|[SML])\\\\s*(?:サイズ|size)', 'i'],\n  ['(?<![a-z0-9])(\\\\d{1,2})号', 'i'],\n  ['(?<![a-z0-9./-])(XXL|XL|XS)(?![a-z0-9./-])', 'i'],\n  [\"(?<![A-Za-z0-9./'’&-])([SML])(?![A-Za-z0-9./'’&-])\", ''],\n].map(([src, flags]) => { try { return new RegExp(src, flags); } catch (e) { return null; } }).filter(Boolean);\nfunction findSize(title) {\n  for (const re of SIZE_RES) { const m = title.match(re); if (m) return m[1].toUpperCase(); }\n  return '';\n}\nfunction toAud(price, currency, fx) {\n  if (!price) return null;\n  if (currency === 'AUD') return Math.round(price);\n  const rate = fx && fx.rates && fx.rates[currency];\n  return rate ? Math.round(price / rate) : null;\n}\n\n// ---------- brand profile in force for a search ----------\nfunction resolveProfile(form, profiles) {\n  const generic = profiles.generic || {};\n  const base = form.profileId && profiles[form.profileId] ? profiles[form.profileId] : null;\n  const typed = [form.brand, form.kana].filter(Boolean);\n  const p = Object.assign({}, generic, base || {});\n  p.noteRules = [...((base && base.noteRules) || []), ...(generic.noteRules || [])];\n  if (base) {\n    const known = (base.brandNames || []).map(n => n.toLowerCase());\n    const extra = typed.filter(t => !known.includes(t.toLowerCase()));\n    p.brandNames = [...(base.brandNames || []), ...extra];\n    p.brandPatterns = [base.brandPatterns, ...extra.map(looseRe)].filter(Boolean).join('|');\n  } else {\n    p.brandNames = typed;\n    p.brandPatterns = typed.map(looseRe).join('|');\n    p.lineRequired = ''; p.possiblePatterns = '';\n  }\n  return p;\n}\n\n// ---------- query builder: brand names x garment words (+ era / detail words), cut to 15 ----------\nfunction buildTerms(form, profile, dict) {\n  const names = profile.brandNames || [];\n  const en = names.filter(n => !hasCJK(n)), ja = names.filter(hasCJK), mixed = [];\n  for (let i = 0; i < Math.max(en.length, ja.length); i++) { if (en[i]) mixed.push(en[i]); if (ja[i]) mixed.push(ja[i]); }\n  const western = en.length ? en : names;\n  const eraPicked = form.eras.map(e => e.toLowerCase());\n  const era = {\n    en: eraPicked,\n    ja: eraPicked.length ? [...eraPicked, (dict.era.ja || [])[0]].filter(Boolean) : [],\n    zh: eraPicked.length ? [(dict.era.zh || [])[0]].filter(Boolean) : [],\n  };\n  const detail = { en: [], ja: [], zh: [] };\n  for (const m of form.must) {\n    const d = (dict.details || []).find(x => [x.en, x.ja, x.zh].some(v => v && v.toLowerCase() === m.toLowerCase()));\n    if (d) { for (const L of ['en', 'ja', 'zh']) if (d[L]) detail[L].push(d[L]); }\n    else if (hasCJK(m)) detail.ja.push(m);\n    else { detail.en.push(m); detail.ja.push(m); }\n  }\n  const make = (brands, lang) => {\n    let words = form.types.flatMap(t => (((dict.garments || {})[t] || {})[lang] || []).map((w, i) => ({ w, i })));\n    if (!words.length) words = [{ w: '', i: 0 }];\n    const out = [];\n    brands.forEach((b, bi) => words.forEach(({ w, i }) => {\n      const plain = [b, w].filter(Boolean).join(' ');\n      out.push({ t: plain, score: bi + i });\n      era[lang].forEach((e, k) => out.push({ t: plain + ' ' + e, score: bi + i + 1.5 + k * 0.5 }));\n      detail[lang].forEach((d, k) => out.push({ t: plain + ' ' + d, score: bi + i + 1 + k * 0.5 }));\n    }));\n    const seen = new Set();\n    return out.map((x, n) => ({ ...x, n })).sort((a, b) => a.score - b.score || a.n - b.n)\n      .filter(x => !seen.has(x.t.toLowerCase()) && seen.add(x.t.toLowerCase())).map(x => ({ t: x.t, lang }));\n  };\n  const jaAll = make(mixed.length ? mixed : names, 'ja'), enAll = make(western, 'en'), zhAll = make(western, 'zh');\n  const jaTake = jaAll.slice(0, Math.max(10, MAX_TERMS - enAll.length));\n  const jaSet = new Set(jaTake.map(x => x.t.toLowerCase()));\n  const enTake = enAll.filter(x => !jaSet.has(x.t.toLowerCase())).slice(0, MAX_TERMS - jaTake.length);\n  return { jp: [...jaTake, ...enTake], west: enAll.slice(0, MAX_TERMS), cn: zhAll.slice(0, MAX_TERMS) };\n}\n\n// ---------- filtering and rarity scoring ----------\nfunction makeCtx(form, profiles, dict, photoChecks, fx, seen) {\n  const profile = resolveProfile(form, profiles);\n  const garments = Object.entries(dict.garments || {}).map(([id, g]) => {\n    const src = [...(g.en || []), ...(g.ja || []), ...(g.zh || []), ...(g.match || [])].map(wordRe).filter(Boolean).sort((a, b) => b.length - a.length).join('|');\n    let re = null;\n    try { re = src ? new RegExp(src, 'gi') : null; } catch (e) { re = null; }\n    return { id, label: g.label || id, re, picked: form.types.includes(id) };\n  });\n  const col = (dict.colours || {})[form.colour];\n  const colourRe = col ? rx([...(col.en || []), ...(col.ja || []), ...(col.zh || [])].map(wordRe).filter(Boolean).join('|')) : null;\n  const mustRes = form.must.map(m => {\n    const d = (dict.details || []).find(x => [x.en, x.ja, x.zh].some(v => v && v.toLowerCase() === m.toLowerCase()));\n    return rx((d ? [d.en, d.ja, d.zh].filter(Boolean) : [m]).map(looseRe).join('|'));\n  }).filter(Boolean);\n  const excludeRe = form.exclude.length ? rx(form.exclude.map(looseRe).join('|')) : null;\n  const sizes = [...form.sizes, ...list(form.sizeText)].map(s => norm(s).toUpperCase().replace(/^JP\\s*/, '')).filter(Boolean);\n  return { form, profile, garments, colourRe, mustRes, excludeRe, sizes, photoChecks: photoChecks || {}, fx, seen: seen || null };\n}\n\nfunction scoreListing(l, c) {\n  const p = c.profile, title = norm(l.title);\n  const text = title + (l.extra && l.extra.brand ? ' ' + norm(l.extra.brand) : '');\n  const hit = pattern => { const r = rx(pattern); return !!r && r.test(text); };\n  // 1. brand check\n  if (p.brandPatterns && !hit(p.brandPatterns)) return { drop: 'brand' };\n  let possible = '';\n  if (p.lineRequired && !hit(p.lineRequired)) {\n    if (hit(p.possiblePatterns)) possible = 'Possible: the line is not named in the title';\n    else return { drop: 'line' };\n  }\n  // 2. exclude\n  if (hit(p.excludePatterns) || (c.excludeRe && c.excludeRe.test(text))) return { drop: 'excluded' };\n  const check = c.photoChecks[l.url];\n  if (check === 'reject') return { drop: 'rejected' };\n  // 3. garment type: the longest dictionary word wins, picked types first\n  let type = '', best = 0, bestPicked = false;\n  for (const g of c.garments) {\n    if (!g.re) continue;\n    let len = 0;\n    for (const m of title.matchAll(g.re)) len = Math.max(len, m[0].length);\n    if (len && ((g.picked && !bestPicked) || (g.picked === bestPicked && len > best))) { type = g.label; best = len; bestPicked = g.picked; }\n  }\n  if (!type && c.form.types.length && !possible) possible = \"Possible: the title doesn't say the garment\";\n  // 4. rarity tier\n  let tier = 1;\n  for (const k of [5, 4, 3, 2]) if (hit((p.tiers || {})[k])) { tier = k; break; }\n  for (const cap of p.capAt || []) if (hit(cap.pattern)) tier = Math.min(tier, cap.tier);\n  const target = c.mustRes.some(r => r.test(text));\n  // 5. notes\n  const notes = [];\n  const confirmed = check === 'confirm';\n  if (confirmed) { tier = Math.max(tier, p.confirmBoost || 4); notes.push('Confirmed from photos'); possible = ''; }\n  if (possible) notes.push(possible);\n  for (const r of p.noteRules || []) if (hit(r.pattern) && !notes.includes(r.note)) notes.push(r.note);\n  if (c.colourRe && c.colourRe.test(text)) notes.push(c.form.colour.charAt(0).toUpperCase() + c.form.colour.slice(1) + ' (favourite)');\n  const x = l.extra || {};\n  if (x.bids) notes.push(x.bids + (x.bids === 1 ? ' bid' : ' bids'));\n  if (x.ends) { const d = new Date(x.ends); if (!isNaN(d)) notes.push('Ends ' + d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })); }\n  const size = l.size ? norm(l.size).toUpperCase() : findSize(title);\n  const sizeHit = !!size && c.sizes.includes(size.replace(/号$/, ''));\n  const site = SITES.find(s => s.id === l.site);\n  return Object.assign({}, l, {\n    key: l.site + ':' + l.id, tier, type, notes, sizeOut: size, sizeHit, siteName: site ? site.name : l.site,\n    aud: toAud(l.price, l.currency, c.fx),\n    flags: { target, possible: !!possible, confirmed, unsure: check === 'unsure', isNew: !!c.seen && !c.seen.has(l.site + ':' + l.id) },\n  });\n}\n\nfunction scoreAll(raw, c) {\n  const rows = [], drops = { brand: 0, line: 0, excluded: 0, rejected: 0, duplicate: 0 }, urls = new Set(), same = new Set();\n  for (const l of raw) {\n    const twin = l.site + '|' + norm(l.title).toLowerCase() + '|' + l.price;\n    if (urls.has(l.url) || same.has(twin)) { drops.duplicate++; continue; }\n    urls.add(l.url); same.add(twin);\n    const r = scoreListing(l, c);\n    if (r.drop) drops[r.drop]++; else rows.push(r);\n  }\n  return { rows, drops };\n}\n\nconst SYMBOL = { JPY: '¥', USD: 'US$', AUD: 'A$', GBP: '£', EUR: '€', CNY: 'CN¥', CAD: 'C$' };\nconst money = (price, cur) => price ? (SYMBOL[cur] || cur + ' ') + Number(price).toLocaleString('en-AU', { maximumFractionDigits: cur === 'JPY' ? 0 : 2 }) : '';\n\nfunction buildCsv(rows, meta) {\n  const q = v => { v = String(v == null ? '' : v); return /[\",\\r\\n]/.test(v) ? '\"' + v.replace(/\"/g, '\"\"') + '\"' : v; };\n  const lines = [\n    ['Search date', meta.date],\n    ['Minimum rarity', meta.min],\n    ['Terms used', ...meta.terms.map(([site, terms]) => site + ': ' + terms.join(' | '))],\n    ['Tier', 'A$ approx. (before shipping and proxy fees)', 'Original price', 'Site', 'Type', 'Size', 'Title', 'URL', 'Notes'],\n    ...rows.map(r => [r.tier, r.aud == null ? '' : r.aud, r.price ? r.price + ' ' + r.currency : '', r.siteName, r.type, r.sizeOut, r.title, r.url, r.notes.join('; ')]),\n  ];\n  return '﻿' + lines.map(l => l.map(q).join(',')).join('\\r\\n');\n}\n/*CORE-END*/\n\n// ---------- page state ----------\nconst $ = (s, root) => (root || document).querySelector(s);\nconst $$ = (s, root) => [...(root || document).querySelectorAll(s)];\nconst h = s => String(s == null ? '' : s).replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\nconst safeUrl = u => (/^https?:\\/\\//i.test(u || '') ? u : '');\nconst sleep = ms => new Promise(r => setTimeout(r, ms));\nconst store = {\n  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },\n  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast('This browser would not save that (storage is full or blocked).'); } },\n};\nconst newPlanState = () => ({ jp: { off: [], custom: [] }, west: { off: [], custom: [] }, cn: { off: [], custom: [] } });\nconst S = {\n  profiles: Object.assign({}, { generic: clone(DEFAULT_PROFILES.generic) }, store.get('vgf.profiles', null) || clone(DEFAULT_PROFILES)),\n  dict: store.get('vgf.dict', null) || clone(DEFAULT_DICT),\n  saved: store.get('vgf.saved', []), photoChecks: store.get('vgf.photoChecks', {}), fx: store.get('vgf.fx', null),\n  api: /^https?:$/.test(location.protocol) ? location.origin : '', siteInfo: null,\n  planState: newPlanState(), raw: [], rows: [], drops: {}, run: null, status: {}, newBase: null, active: null,\n  sort: { key: 'default', dir: 1 }, showHidden: false, busy: false, queue: [], queueSig: '', ctx: null, cache: new Map(), dirty: false,\n};\n\nlet toastTimer;\nfunction toast(msg) {\n  const t = $('#toast'); t.textContent = msg; t.hidden = false;\n  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 5200);\n}\nconst stars = n => `<span class=\"stars\" title=\"${TIER_LABEL[n]}\">${'★'.repeat(n)}<b>${'★'.repeat(5 - n)}</b></span>`;\n\n// ---------- search form ----------\nconst chip = (value, label, checked) => `<label class=\"chip\"><input type=\"checkbox\" value=\"${h(value)}\"${checked ? ' checked' : ''}><span>${label}</span></label>`;\nfunction initForm(keep) {\n  $('#profile').innerHTML = '<option value=\"\">No profile: use the typed brand</option>' +\n    Object.entries(S.profiles).filter(([k]) => k !== 'generic').map(([k, p]) => `<option value=\"${h(k)}\">${h(p.name || k)}</option>`).join('');\n  $('#types').innerHTML = Object.entries(S.dict.garments || {}).map(([k, g]) => chip(k, h(g.label || k))).join('');\n  $('#eras').innerHTML = ERAS.map(e => chip(e, e)).join('');\n  $('#sizes').innerHTML = SIZE_BOXES.map(s => chip(s, s)).join('');\n  $('#colour').innerHTML = '<option value=\"\">None</option>' + Object.keys(S.dict.colours || {}).map(c => `<option value=\"${h(c)}\">${h(c.charAt(0).toUpperCase() + c.slice(1))}</option>`).join('');\n  $('#sites').innerHTML = SITES.map(s => chip(s.id, h(s.name) + (canCollect(s) ? '' : '<i>links only</i>'), true)).join('');\n  if (keep) writeForm(keep);\n  syncForm();\n}\nconst ticked = sel => $$(sel + ' input:checked').map(i => i.value);\nfunction readForm() {\n  return {\n    profileId: $('#profile').value, brand: $('#brand').value.trim(), kana: $('#kana').value.trim(),\n    types: ticked('#types'), eras: ticked('#eras'), sizes: ticked('#sizes'), sizeText: $('#sizeText').value.trim(),\n    colour: $('#colour').value, must: list($('#must').value), exclude: list($('#exclude').value),\n    sites: ticked('#sites'), minRarity: +$('#minRarity').value, pages: +$('#pages').value,\n  };\n}\nfunction writeForm(f) {\n  $('#profile').value = S.profiles[f.profileId] ? f.profileId : '';\n  $('#brand').value = f.brand || ''; $('#kana').value = f.kana || ''; $('#sizeText').value = f.sizeText || '';\n  $('#colour').value = (S.dict.colours || {})[f.colour] ? f.colour : '';\n  $('#must').value = (f.must || []).join(', '); $('#exclude').value = (f.exclude || []).join(', ');\n  $('#minRarity').value = f.minRarity || 3; $('#pages').value = f.pages || 1;\n  for (const [sel, vals] of [['#types', f.types], ['#eras', f.eras], ['#sizes', f.sizes], ['#sites', f.sites]]) {\n    $$(sel + ' input').forEach(i => { i.checked = (vals || []).includes(i.value); });\n  }\n}\nfunction syncForm() {\n  const min = +$('#minRarity').value;\n  $('#minLabel').innerHTML = stars(min) + ' ' + TIER_LABEL[min] + (min < 5 ? ' and rarer' : ' only');\n  const hasProfile = !!$('#profile').value;\n  $('#brandHint').textContent = hasProfile ? 'optional extra spelling' : 'typed as you would search it';\n  $('#brand').placeholder = hasProfile ? 'The profile already has its spellings' : 'e.g. Issey Sport';\n}\nfunction matchProfile() { // typing a brand that has a saved profile switches to that profile\n  const typed = $('#brand').value.trim().toLowerCase();\n  if (!typed || $('#profile').value) return;\n  const found = Object.entries(S.profiles).find(([k, p]) => k !== 'generic' && (k.replace(/-/g, ' ') === typed || (p.brandNames || []).some(n => n.toLowerCase() === typed)));\n  if (!found) return;\n  $('#profile').value = found[0]; $('#brand').value = '';\n  toast(`Using your saved profile: ${found[1].name || found[0]}`);\n}\nfunction canCollect(site) {\n  return site.layer2 && (!S.siteInfo || !S.siteInfo[site.id] || S.siteInfo[site.id].enabled);\n}\n\n// ---------- terms preview ----------\nfunction planTerms() {\n  const f = readForm(), p = resolveProfile(f, S.profiles);\n  if (!p.brandNames.length) return null;\n  const base = buildTerms(f, p, S.dict), out = {};\n  for (const g of GROUPS) {\n    const st = S.planState[g.id];\n    const own = st.custom.filter(t => !base[g.id].some(x => x.t === t)).map(t => ({ t, lang: 'own' }));\n    out[g.id] = [...base[g.id], ...own].map(x => ({ ...x, on: !st.off.includes(x.t) }));\n  }\n  return out;\n}\nfunction termsBySite() {\n  const plan = planTerms(), f = readForm(), out = {};\n  if (!plan) return out;\n  for (const s of SITES) {\n    if (!f.sites.includes(s.id)) continue;\n    const terms = plan[s.group].filter(x => x.on).map(x => x.t);\n    if (terms.length) out[s.id] = terms;\n  }\n  return out;\n}\nconst linkFor = (site, term) => site.url.replace('{q}', encodeURIComponent(term));\nfunction buildLinks() {\n  const by = termsBySite();\n  return SITES.filter(s => by[s.id]).flatMap(s => by[s.id].map(t => ({ site: s, term: t, url: linkFor(s, t) })));\n}\nfunction renderPlan() {\n  if ($('#plan').hidden) return;\n  const plan = planTerms(), f = readForm();\n  if (!plan) {\n    $('#planHint').textContent = 'Pick a brand profile or type a brand to see the search terms.';\n    $('#planGroups').innerHTML = ''; $('#links').hidden = true; $('#openBtn').disabled = $('#collectBtn').disabled = true;\n    return;\n  }\n  $('#planHint').textContent = 'These exact terms go to each site. Untick any you do not want, or add your own.';\n  $('#planGroups').innerHTML = GROUPS.map(g => {\n    const sites = SITES.filter(s => s.group === g.id && f.sites.includes(s.id));\n    if (!sites.length) return '';\n    const langs = [...new Set(plan[g.id].map(x => x.lang))];\n    return `<div class=\"group\"><h3>${g.label}</h3><p class=\"hint\">${sites.map(s => h(s.name)).join(', ')}</p>` +\n      langs.map(L => `<div class=\"lang\"><span class=\"langname\">${LANG_LABEL[L]}</span><div class=\"chips\">` +\n        plan[g.id].filter(x => x.lang === L).map(x => `<label class=\"chip term\"><input type=\"checkbox\" data-g=\"${g.id}\" value=\"${h(x.t)}\"${x.on ? ' checked' : ''}><span>${h(x.t)}</span></label>`).join('') +\n        '</div></div>').join('') +\n      `<form class=\"add\" data-g=\"${g.id}\"><input type=\"text\" placeholder=\"Add your own term\" aria-label=\"Add your own term for ${g.label}\"><button class=\"btn small\">Add</button></form></div>`;\n  }).join('');\n  const links = buildLinks(), collectable = SITES.filter(s => termsBySite()[s.id] && canCollect(s));\n  const requests = collectable.reduce((n, s) => n + termsBySite()[s.id].length, 0);\n  $('#links').hidden = !links.length;\n  $('#links summary').textContent = `All search links (${links.length})`;\n  $('#links ul').innerHTML = links.map(x => `<li><a href=\"${h(x.url)}\" target=\"_blank\" rel=\"noopener noreferrer\">${h(x.site.name)}: ${h(x.term)}</a></li>`).join('');\n  $('#openBtn').disabled = !links.length;\n  $('#collectBtn').disabled = !S.api || !collectable.length || S.busy;\n  $('#planNote').textContent = !S.api\n    ? 'Collect results needs the Worker. Open this app from your workers.dev address to use it. Open searches works anywhere.'\n    : `Collect results will make about ${requests} requests to ${collectable.length} sites, one per second per site, cached for 15 minutes.`;\n  updateOpenBtn();\n}\nfunction updateOpenBtn() {\n  const total = buildLinks().length, sig = JSON.stringify(termsBySite());\n  const left = sig === S.queueSig ? S.queue.length : 0;\n  $('#openBtn').textContent = left ? `Open next ${Math.min(10, left)} (${left} left)` : `Open searches (${total} tabs, 10 at a time)`;\n}\nfunction openSearches() { // Layer 1: plain links, no Worker\n  const sig = JSON.stringify(termsBySite());\n  if (sig !== S.queueSig || !S.queue.length) { S.queue = buildLinks().map(x => x.url); S.queueSig = sig; }\n  for (let n = 0; n < 10 && S.queue.length; n++) {\n    const w = window.open(S.queue[0], '_blank');\n    if (!w) { toast('The browser blocked the new tabs. Allow pop-ups for this page, then press the button again. The links are also listed below.'); $('#links').open = true; break; }\n    try { w.opener = null; } catch (e) { /* cross-origin tab */ }\n    S.queue.shift();\n  }\n  updateOpenBtn();\n}\n\n// ---------- Layer 2: collect results through the Worker ----------\nfunction renderProgress() {\n  const by = S.run ? S.run.terms : {};\n  $('#progress').innerHTML = Object.entries(S.status).map(([id, st]) => {\n    const site = SITES.find(s => s.id === id), first = (by[id] || [])[0];\n    const open = first ? ` <a href=\"${h(linkFor(site, first))}\" target=\"_blank\" rel=\"noopener noreferrer\">Open search on ${h(site.name)}</a>` : '';\n    let msg = st.state === 'wait' ? 'Waiting' : `${st.count} listings`;\n    if (st.state === 'links') msg = 'Links only.' + open;\n    else if (st.state === 'fail') msg = `${h(site.name)} unavailable (${h(st.error)}).` + open;\n    else if (st.state === 'done' && !st.count) msg = 'No listings found.' + open;\n    else if (st.error) msg += `. ${st.errors} of ${st.total} terms failed (${h(st.error)}).` + open;\n    const pct = st.state === 'links' ? 0 : Math.round(100 * st.done / Math.max(1, st.total));\n    return `<div class=\"prow${st.state === 'fail' ? ' fail' : ''}\"><span>${h(site.name)}</span><span class=\"pbar\"><i style=\"width:${st.state === 'fail' ? 100 : pct}%\"></i></span><span class=\"msg\">${msg}</span></div>`;\n  }).join('');\n}\nfunction fromBrowserCache(url) { // the 15-minute cache: a response that cost no network transfer\n  try { const e = performance.getEntriesByName(url).pop(); return !!e && e.transferSize === 0 && e.decodedBodySize > 0; } catch (e) { return false; }\n}\nasync function runSite(site, terms, budget, pages) {\n  const st = S.status[site.id];\n  let last = 0, fails = 0;\n  for (const term of terms) {\n    let page = '1', got = 0, done = 0;\n    while (page && done < pages && got < MAX_PER_TERM && budget.left > 0) {\n      const key = site.id + '|' + term + '|' + page, held = S.cache.get(key);\n      let res;\n      st.state = 'run';\n      if (held && Date.now() - held.at < CACHE_MS) res = held.res; // collected in the last 15 minutes\n      else {\n        const wait = last + 1000 - Date.now(); // at most one page per site per second\n        if (wait > 0) await sleep(wait);\n        last = Date.now(); budget.left--; budget.used++;\n        try {\n          const url = `${S.api}/api/search?site=${site.id}&term=${encodeURIComponent(term)}&page=${encodeURIComponent(page)}`;\n          const r = await fetch(url);\n          res = await r.json();\n          if (r.headers.get('x-vgf-cache') === 'HIT' || fromBrowserCache(url)) { last = 0; budget.left++; budget.used--; } // cached: no site was contacted\n          if (!res.error) S.cache.set(key, { at: Date.now(), res });\n        } catch (e) { res = { listings: [], next: null, error: 'No answer from the Worker' }; }\n      }\n      if (res.error) { fails++; st.errors++; st.error = res.error; break; }\n      fails = 0;\n      const fresh = (res.listings || []).slice(0, MAX_PER_TERM - got);\n      S.raw.push(...fresh); got += fresh.length; st.count += fresh.length;\n      page = res.next == null ? '' : String(res.next); done++;\n      S.dirty = true;\n    }\n    st.done++;\n    if (fails >= 2) break; // two failures in a row: treat the site as unavailable\n    renderProgress();\n  }\n  st.state = st.errors && !st.count ? 'fail' : 'done';\n  st.done = st.total;\n  renderProgress();\n}\nasync function collect() {\n  if (S.busy) return;\n  const terms = termsBySite(), f = readForm();\n  const sites = SITES.filter(s => terms[s.id] && canCollect(s));\n  if (!S.api || !sites.length) return toast('Tick at least one site that can be collected, and open the app from your Worker address.');\n  S.busy = true; S.raw = []; S.rows = []; S.showHidden = false;\n  S.run = { date: new Date(), terms, form: f };\n  S.newBase = S.active && S.active.lastRun ? new Set(S.active.seen) : null;\n  S.status = {};\n  for (const s of SITES) if (terms[s.id]) S.status[s.id] = canCollect(s) ? { state: 'wait', total: terms[s.id].length, done: 0, count: 0, errors: 0, error: '' } : { state: 'links' };\n  const budget = { left: MAX_REQUESTS, used: 0 }, started = Date.now();\n  try { performance.clearResourceTimings(); } catch (e) { /* older browsers */ }\n  $('#results').hidden = false; renderPlan(); renderProgress(); rescore();\n  const timer = setInterval(() => { if (S.dirty) { S.dirty = false; rescore(); } }, 1500);\n  await Promise.all(sites.map(s => runSite(s, terms[s.id], budget, f.pages)));\n  clearInterval(timer); S.busy = false; S.dirty = false;\n  rescore(); renderPlan();\n  if (S.active) {\n    S.active.seen = [...new Set([...S.raw.map(l => l.site + ':' + l.id), ...(S.active.seen || [])])].slice(0, 4000);\n    S.active.lastRun = Date.now(); store.set('vgf.saved', S.saved); renderSaved();\n  }\n  toast(`Collected ${S.raw.length} listings in ${Math.round((Date.now() - started) / 1000)} s using ${budget.used} new requests.` + (budget.left <= 0 ? ' Stopped at the request limit.' : ''));\n}\n\n// ---------- results ----------\nfunction rescore() {\n  const f = readForm();\n  S.ctx = makeCtx(f, S.profiles, S.dict, S.photoChecks, S.fx, S.newBase);\n  const out = scoreAll(S.raw, S.ctx);\n  S.rows = out.rows; S.drops = out.drops;\n  renderResults();\n  if ($('#checker').classList.contains('open')) renderChecker();\n}\nfunction markTitle(text, c) {\n  const spans = [];\n  const add = (re, cls) => { if (re) for (const m of text.matchAll(new RegExp(re.source, 'gi'))) if (m[0]) spans.push([m.index, m.index + m[0].length, cls]); };\n  c.mustRes.forEach(r => add(r, 'must')); add(c.colourRe, 'fav');\n  spans.sort((a, b) => a[0] - b[0]);\n  let out = '', pos = 0;\n  for (const [s, e, cls] of spans) { if (s < pos) continue; out += h(text.slice(pos, s)) + `<mark class=\"${cls}\">${h(text.slice(s, e))}</mark>`; pos = e; }\n  return out + h(text.slice(pos));\n}\nfunction sortedRows() {\n  const min = +$('#minRarity').value, q = norm($('#filter').value).toLowerCase().trim();\n  let rows = S.rows.filter(r => (S.showHidden || r.tier >= min) && (!q || norm(r.title + ' ' + r.siteName + ' ' + r.notes.join(' ')).toLowerCase().includes(q)));\n  const { key, dir } = S.sort;\n  const val = { tier: r => r.tier, aud: r => (r.aud == null ? Infinity : r.aud), price: r => (r.aud == null ? Infinity : r.aud), site: r => r.siteName, title: r => norm(r.title).toLowerCase(), type: r => r.type || '￿', size: r => r.sizeOut || '￿', notes: r => r.notes.join(' ') }[key];\n  const best = (a, b) => (b.flags.target - a.flags.target) || (b.tier - a.tier) || ((a.aud == null ? Infinity : a.aud) - (b.aud == null ? Infinity : b.aud));\n  rows = rows.slice().sort(val ? (a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * dir || best(a, b); } : best);\n  return rows;\n}\nfunction renderResults() {\n  if ($('#results').hidden) return;\n  const min = +$('#minRarity').value, rows = sortedRows();\n  const hidden = S.rows.filter(r => r.tier < min).length, toCheck = S.rows.filter(r => r.flags.possible).length;\n  const d = S.drops, ruled = (d.brand || 0) + (d.line || 0) + (d.excluded || 0) + (d.rejected || 0);\n  $('#counts').textContent = S.raw.length\n    ? `${S.rows.length - hidden} at ${TIER_LABEL[min]} or rarer, ${hidden} hidden below that. ${ruled} removed by your rules (${(d.brand || 0) + (d.line || 0)} wrong brand or line, ${d.excluded || 0} excluded, ${d.rejected || 0} rejected from photos) and ${d.duplicate || 0} duplicates.`\n    : (S.busy ? 'Collecting listings…' : 'No listings collected yet.');\n  $('#hiddenBtn').textContent = S.showHidden ? `Hide the ${hidden} below minimum` : `Show hidden (${hidden})`;\n  $('#hiddenBtn').disabled = !hidden;\n  $('#checkBtn').textContent = `Check photos (${toCheck})`;\n  $('#checkBtn').disabled = !toCheck;\n  $('#csvBtn').disabled = $('#copyBtn').disabled = !rows.length;\n  $$('.res th').forEach(th => { if (th.dataset.k && th.dataset.k === S.sort.key) th.setAttribute('aria-sort', S.sort.dir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort'); });\n  if (S.run) $('#used dl').innerHTML = Object.entries(S.run.terms).map(([id, ts]) => `<dt>${h(SITES.find(s => s.id === id).name)}</dt><dd>${ts.map(h).join(' &nbsp;|&nbsp; ')}</dd>`).join('');\n  const shown = rows.slice(0, 1500);\n  $('#rows').innerHTML = shown.length ? shown.map(r => {\n    const url = safeUrl(r.url), img = safeUrl(r.image), fl = r.flags;\n    const tags = (fl.isNew ? '<span class=\"tag new\">New</span>' : '') + (fl.target ? '<span class=\"tag target\">Must-have</span>' : '') +\n      (fl.confirmed ? '<span class=\"tag confirmed\">Confirmed</span>' : '') + (fl.possible ? `<button type=\"button\" class=\"tag possible\" data-check>${fl.unsure ? 'Unsure' : 'Possible'}: check photo</button>` : '');\n    const proxy = r.extra && safeUrl(r.extra.proxy) ? `<div class=\"sub\"><a href=\"${h(r.extra.proxy)}\" target=\"_blank\" rel=\"noopener noreferrer\">Buy through Buyee</a></div>` : '';\n    return `<tr class=\"t${r.tier}${fl.target ? ' target' : ''}${r.tier < min ? ' below' : ''}\">` +\n      `<td class=\"thumb\">${img ? `<a href=\"${h(url)}\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"${h(img)}\" alt=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer\"></a>` : '<span class=\"noimg\"></span>'}</td>` +\n      `<td>${stars(r.tier)}<div class=\"sub\">${TIER_LABEL[r.tier]}</div></td>` +\n      `<td class=\"num aud\">${r.aud == null ? '' : 'A$' + r.aud.toLocaleString('en-AU')}</td><td class=\"num\">${h(money(r.price, r.currency))}</td>` +\n      `<td class=\"site\">${h(r.siteName)}</td>` +\n      `<td class=\"ttl\">${tags}<a href=\"${h(url)}\" target=\"_blank\" rel=\"noopener noreferrer\">${markTitle(norm(r.title), S.ctx)}</a>${proxy}</td>` +\n      `<td class=\"type\">${h(r.type)}</td><td>${r.sizeHit ? `<mark class=\"fav\">${h(r.sizeOut)}</mark>` : h(r.sizeOut)}</td><td class=\"notes\">${h(r.notes.join('. '))}</td></tr>`;\n  }).join('') + (rows.length > shown.length ? `<tr><td colspan=\"9\" class=\"empty\">Showing the first ${shown.length} of ${rows.length}. Filter or raise the minimum rarity to narrow it.</td></tr>` : '')\n    : `<tr><td colspan=\"9\" class=\"empty\">${S.busy ? 'Collecting listings…' : S.rows.length ? 'Nothing matches at this rarity or filter. Lower the minimum rarity or press Show hidden.' : S.raw.length ? 'Every listing was removed by the brand and exclude rules. Loosen them in Settings.' : 'No listings came back. Try fewer or broader terms, or use Open searches.'}</td></tr>`;\n}\nfunction exportMeta() {\n  return {\n    date: (S.run ? S.run.date : new Date()).toLocaleString('en-AU'), min: +$('#minRarity').value + ' (' + TIER_LABEL[+$('#minRarity').value] + ' and rarer)',\n    terms: Object.entries(S.run ? S.run.terms : {}).map(([id, ts]) => [SITES.find(s => s.id === id).name, ts]),\n  };\n}\nfunction download(name, text, type) {\n  const a = document.createElement('a');\n  a.href = URL.createObjectURL(new Blob([text], { type }));\n  a.download = name; document.body.appendChild(a); a.click(); a.remove();\n  setTimeout(() => URL.revokeObjectURL(a.href), 2000);\n}\nasync function copyTable() {\n  const m = exportMeta(), clean = v => String(v == null ? '' : v).replace(/[\\t\\r\\n]+/g, ' ');\n  const text = [['Tier', 'A$ approx.', 'Original price', 'Site', 'Type', 'Size', 'Title', 'URL', 'Notes'],\n    ...sortedRows().map(r => [r.tier, r.aud == null ? '' : r.aud, r.price ? r.price + ' ' + r.currency : '', r.siteName, r.type, r.sizeOut, r.title, r.url, r.notes.join('; ')])]\n    .map(l => l.map(clean).join('\\t')).join('\\n') + '\\n\\nTerms used\\t' + m.terms.map(([s, ts]) => s + ': ' + ts.join(' | ')).join('\\t');\n  try { await navigator.clipboard.writeText(text); }\n  catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }\n  toast('Copied. Paste it into a spreadsheet or a doc.');\n}\n\n// ---------- photo checker ----------\nfunction openDrawer(id) { $('#' + id).classList.add('open'); $('#shade').hidden = false; }\nfunction closeDrawers() { $$('.drawer').forEach(d => d.classList.remove('open')); $('#shade').hidden = true; }\nfunction renderChecker() {\n  const rows = S.rows.filter(r => r.flags.possible).sort((a, b) => a.flags.unsure - b.flags.unsure || b.tier - a.tier);\n  $('#cards').innerHTML = rows.length ? rows.map(r => {\n    const img = safeUrl(r.image), url = safeUrl(r.url);\n    return `<div class=\"card${r.flags.unsure ? ' unsure' : ''}\" data-url=\"${h(r.url)}\">` +\n      `<a href=\"${h(url)}\" target=\"_blank\" rel=\"noopener noreferrer\">${img ? `<img src=\"${h(img)}\" alt=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer\">` : '<span class=\"noimg\"></span>'}</a>` +\n      `<div class=\"txt\"><a href=\"${h(url)}\" target=\"_blank\" rel=\"noopener noreferrer\">${h(norm(r.title))}</a><div class=\"sub\">${h(r.siteName)}${r.aud == null ? '' : ', A$' + r.aud}${r.flags.unsure ? ', marked unsure' : ''}</div><div class=\"sub\">${h(r.notes[0] || '')}</div></div>` +\n      '<div class=\"dec\"><button type=\"button\" class=\"yes\" data-d=\"confirm\">Confirm</button><button type=\"button\" class=\"no\" data-d=\"reject\">Reject</button><button type=\"button\" data-d=\"unsure\">Unsure</button></div></div>';\n  }).join('') : '<p class=\"hint\">Nothing left to check.</p>';\n}\nfunction decide(url, decision) {\n  S.photoChecks[url] = decision; store.set('vgf.photoChecks', S.photoChecks);\n  rescore();\n}\n\n// ---------- saved searches ----------\nfunction renderSaved() {\n  $('#saved').hidden = !S.saved.length;\n  $('#savedList').innerHTML = S.saved.map(s => `<div class=\"savedItem${S.active === s ? ' on' : ''}\"><button type=\"button\" data-run=\"${h(s.id)}\" title=\"${s.lastRun ? 'Last run ' + new Date(s.lastRun).toLocaleString('en-AU') : 'Not run yet'}\">${h(s.name)}</button><button type=\"button\" data-del=\"${h(s.id)}\" aria-label=\"Delete ${h(s.name)}\">Delete</button></div>`).join('');\n}\nfunction saveSearch() {\n  const f = readForm(), p = resolveProfile(f, S.profiles);\n  if (!p.brandNames.length) return toast('Pick a brand first.');\n  const name = $('#saveName').value.trim() || [f.profileId ? (S.profiles[f.profileId].name || '').split('(')[0].trim() : f.brand, f.types.map(t => (S.dict.garments[t] || {}).label || t).join(' + '), f.eras.join(' ')].filter(Boolean).join(', ');\n  const s = { id: Date.now().toString(36), name, form: f, plan: clone(S.planState), seen: S.raw.map(l => l.site + ':' + l.id).slice(0, 4000), lastRun: S.raw.length ? Date.now() : 0 };\n  S.saved.push(s); S.active = s; store.set('vgf.saved', S.saved);\n  $('#saveName').value = ''; renderSaved(); toast(`Saved: ${name}`);\n}\nfunction runSaved(id) {\n  const s = S.saved.find(x => x.id === id);\n  if (!s || S.busy) return;\n  S.active = s; writeForm(s.form); syncForm();\n  S.planState = Object.assign(newPlanState(), clone(s.plan || {}));\n  $('#plan').hidden = false; renderPlan(); renderSaved();\n  if (S.api) collect();\n  else { toast('Loaded. Press Open searches, or open the app from your Worker address to collect results.'); $('#plan').scrollIntoView({ behavior: 'smooth', block: 'start' }); }\n}\n\n// ---------- settings ----------\nfunction openSettings() {\n  $('#profilesBox').value = JSON.stringify(S.profiles, null, 2);\n  $('#dictBox').value = JSON.stringify(S.dict, null, 2);\n  $('#settingsMsg').textContent = '';\n  openDrawer('settings');\n}\nfunction checkProfiles(profiles) {\n  for (const [id, p] of Object.entries(profiles)) {\n    const pats = [['brandPatterns', p.brandPatterns], ['lineRequired', p.lineRequired], ['possiblePatterns', p.possiblePatterns], ['excludePatterns', p.excludePatterns],\n      ...Object.entries(p.tiers || {}).map(([k, v]) => ['tier ' + k, v]), ...(p.capAt || []).map(c => ['capAt', c.pattern]), ...(p.noteRules || []).map(r => ['noteRules', r.pattern])];\n    for (const [field, pat] of pats) if (pat) { try { new RegExp(pat, 'i'); } catch (e) { return `Profile \"${id}\", ${field}: ${e.message}`; } }\n  }\n  return '';\n}\nfunction saveSettings() {\n  let profiles, dict;\n  try { profiles = JSON.parse($('#profilesBox').value); } catch (e) { return void ($('#settingsMsg').textContent = 'Brand profiles are not valid JSON: ' + e.message); }\n  try { dict = JSON.parse($('#dictBox').value); } catch (e) { return void ($('#settingsMsg').textContent = 'Dictionaries are not valid JSON: ' + e.message); }\n  const bad = checkProfiles(profiles) || (!dict.garments || !dict.era ? 'Dictionaries need at least \"garments\" and \"era\".' : '');\n  if (bad) return void ($('#settingsMsg').textContent = bad);\n  applySettings(profiles, dict);\n  $('#settingsMsg').textContent = S.raw.length ? 'Saved. The current results were re-scored with the new rules.' : 'Saved.';\n}\nfunction applySettings(profiles, dict) {\n  const keep = readForm();\n  S.profiles = Object.assign({ generic: clone(DEFAULT_PROFILES.generic) }, profiles); S.dict = dict;\n  store.set('vgf.profiles', S.profiles); store.set('vgf.dict', S.dict);\n  rxCache.clear(); initForm(keep); renderPlan();\n  if (S.raw.length) rescore();\n}\nfunction exportSettings() {\n  const out = {};\n  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('vgf.')) out[k] = store.get(k, null); }\n  out['vgf.profiles'] = S.profiles; out['vgf.dict'] = S.dict;\n  download('vgf-settings.json', JSON.stringify(out, null, 2), 'application/json');\n}\nasync function importSettings(file) {\n  try {\n    const data = JSON.parse(await file.text());\n    const keys = Object.keys(data).filter(k => k.startsWith('vgf.'));\n    if (!keys.length) throw new Error('no settings in that file');\n    keys.forEach(k => store.set(k, data[k]));\n    S.saved = store.get('vgf.saved', []); S.photoChecks = store.get('vgf.photoChecks', {}); S.fx = store.get('vgf.fx', null); S.active = null;\n    applySettings(store.get('vgf.profiles', clone(DEFAULT_PROFILES)), store.get('vgf.dict', clone(DEFAULT_DICT)));\n    renderSaved(); openSettings(); $('#settingsMsg').textContent = `Imported ${keys.length} settings.`;\n  } catch (e) { $('#settingsMsg').textContent = 'That file could not be imported: ' + e.message; }\n}\n\n// ---------- exchange rates (once a day) and Worker status ----------\nfunction renderFoot() {\n  const r = S.fx && S.fx.rates;\n  $('#foot').textContent = (r ? `Exchange rates from Frankfurter, ${S.fx.date}: A$1 = ¥${r.JPY}, US$${r.USD}, £${r.GBP}, €${r.EUR}, CN¥${r.CNY}. ` : 'Exchange rates are not loaded, so A$ prices are blank. ') +\n    'A$ prices are approximate and exclude shipping and proxy fees. Settings, saved searches and photo decisions stay in this browser.';\n}\nasync function loadFx() {\n  const today = new Date().toISOString().slice(0, 10);\n  if (!(S.fx && S.fx.fetched === today)) {\n    for (const u of ['https://api.frankfurter.app/latest?from=AUD&to=JPY,USD,GBP,EUR,CNY', 'https://api.frankfurter.dev/v1/latest?base=AUD&symbols=JPY,USD,GBP,EUR,CNY']) {\n      try {\n        const d = await (await fetch(u)).json();\n        if (d && d.rates && d.rates.JPY) { S.fx = { fetched: today, date: d.date, rates: d.rates }; store.set('vgf.fx', S.fx); if (S.raw.length) rescore(); break; }\n      } catch (e) { /* try the next address, or keep yesterday's rates */ }\n    }\n  }\n  renderFoot();\n}\nasync function loadSites() {\n  if (!S.api) return;\n  try { S.siteInfo = (await (await fetch(S.api + '/api/sites')).json()).sites || null; } catch (e) { S.siteInfo = null; }\n  initForm(readForm()); renderPlan();\n}\n\n// ---------- wiring ----------\nlet formTimer;\nfunction onFormChange() {\n  syncForm();\n  clearTimeout(formTimer);\n  formTimer = setTimeout(() => { renderPlan(); if (S.raw.length) rescore(); }, 180);\n}\n$('#form').addEventListener('input', onFormChange);\n$('#form').addEventListener('change', onFormChange);\n$('#brand').addEventListener('change', matchProfile);\n$('#form').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); $('#previewBtn').click(); } });\n$('#previewBtn').addEventListener('click', () => {\n  matchProfile(); syncForm();\n  if (!resolveProfile(readForm(), S.profiles).brandNames.length) { toast('Pick a brand profile or type a brand first.'); $('#brand').focus(); return; }\n  S.active = null; renderSaved();\n  $('#plan').hidden = false; renderPlan();\n  $('#plan').scrollIntoView({ behavior: 'smooth', block: 'start' });\n});\n$('#planGroups').addEventListener('change', e => {\n  const g = e.target.dataset.g; if (!g) return;\n  const off = S.planState[g].off, t = e.target.value;\n  if (e.target.checked) S.planState[g].off = off.filter(x => x !== t); else if (!off.includes(t)) off.push(t);\n  renderPlan();\n});\n$('#planGroups').addEventListener('submit', e => {\n  e.preventDefault();\n  const input = $('input', e.target), t = input.value.trim(), st = S.planState[e.target.dataset.g];\n  if (t && !st.custom.includes(t)) st.custom.push(t);\n  renderPlan();\n});\n$('#openBtn').addEventListener('click', openSearches);\n$('#collectBtn').addEventListener('click', collect);\n$('#saveBtn').addEventListener('click', saveSearch);\n$('#savedList').addEventListener('click', e => {\n  const b = e.target.closest('button'); if (!b) return;\n  if (b.dataset.run) runSaved(b.dataset.run);\n  if (b.dataset.del) { const s = S.saved.find(x => x.id === b.dataset.del); if (S.active === s) S.active = null; S.saved = S.saved.filter(x => x !== s); store.set('vgf.saved', S.saved); renderSaved(); }\n});\n$('#filter').addEventListener('input', renderResults);\n$('#sortSel').addEventListener('change', e => { const [key, dir] = e.target.value.split(':'); S.sort = { key, dir: +dir }; renderResults(); });\n$('.res thead').addEventListener('click', e => {\n  const th = e.target.closest('th'); if (!th || !th.dataset.k) return;\n  const key = th.dataset.k;\n  S.sort = { key, dir: S.sort.key === key ? -S.sort.dir : (key === 'tier' ? -1 : 1) };\n  renderResults();\n});\n$('#hiddenBtn').addEventListener('click', () => { S.showHidden = !S.showHidden; renderResults(); });\n$('#checkBtn').addEventListener('click', () => { renderChecker(); openDrawer('checker'); });\n$('#rows').addEventListener('click', e => { if (e.target.closest('[data-check]')) { renderChecker(); openDrawer('checker'); } });\n$('#cards').addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (b) decide(b.closest('.card').dataset.url, b.dataset.d); });\n$('#csvBtn').addEventListener('click', () => download('vintage-garments-' + new Date().toISOString().slice(0, 10) + '.csv', buildCsv(sortedRows(), exportMeta()), 'text/csv;charset=utf-8'));\n$('#copyBtn').addEventListener('click', copyTable);\n$('#settingsBtn').addEventListener('click', openSettings);\n$('#saveSettings').addEventListener('click', saveSettings);\n$('#resetSettings').addEventListener('click', () => { $('#profilesBox').value = JSON.stringify(DEFAULT_PROFILES, null, 2); $('#dictBox').value = JSON.stringify(DEFAULT_DICT, null, 2); $('#settingsMsg').textContent = 'Built-in rules loaded into the boxes. Press Save and re-score to keep them.'; });\n$('#exportSettings').addEventListener('click', exportSettings);\n$('#importSettings').addEventListener('click', () => $('#importFile').click());\n$('#importFile').addEventListener('change', e => { if (e.target.files[0]) importSettings(e.target.files[0]); e.target.value = ''; });\n$('#clearChecks').addEventListener('click', () => { S.photoChecks = {}; store.set('vgf.photoChecks', {}); if (S.raw.length) rescore(); $('#settingsMsg').textContent = 'Photo decisions cleared.'; });\n$('#shade').addEventListener('click', closeDrawers);\n$$('[data-close]').forEach(b => b.addEventListener('click', closeDrawers));\ndocument.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });\n\ninitForm(); renderSaved(); renderFoot(); loadFx(); loadSites();\n</script>\n</body>\n</html>\n";

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const CACHE_SECONDS = 900;   // 15 minutes
const TIMEOUT_MS = 10000;    // per upstream fetch
const MAX_LISTINGS = 300;    // per site per term
const enc = encodeURIComponent;
const health = {};           // last result per site, per Worker instance

// The on/off switch for each connector. Set enabled:false (or use DISABLED_SITES) to turn one off.
const SITES = {
  yahoo_auctions: { name: 'Yahoo Auctions JP', enabled: true, search: yahooAuctions },
  yahoo_flea: { name: 'Yahoo Flea Market JP', enabled: true, search: yahooFlea },
  rakuma: { name: 'Rakuma JP', enabled: true, search: rakuma },
  ebay: { name: 'eBay', enabled: true, search: ebay },
  grailed: { name: 'Grailed', enabled: true, search: grailed },
  depop: { name: 'Depop', enabled: true, search: depop },
  mercari: { name: 'Mercari JP', enabled: true, search: mercari },
  second_street: { name: '2nd Street JP', enabled: false, reason: 'Blocked outside Japan. Link only.' },
  xianyu: { name: 'Xianyu', enabled: false, reason: 'Needs a signed-in account. Link only.' },
  taobao: { name: 'Taobao', enabled: false, reason: 'Needs a signed-in account. Link only.' },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(url) });
    if (request.method !== 'GET') return json({ error: 'GET only' }, url, 0, 405);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(INDEX_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-robots-tag': 'noindex' } });
    }
    if (url.pathname === '/api/sites') return json(siteStatus(env), url, 0);
    if (url.pathname === '/api/search') return apiSearch(url, env || {}, ctx);
    return new Response('Not found', { status: 404 });
  },
};

// ---------- API ----------

function cors(url) {
  return { 'access-control-allow-origin': url.origin, 'access-control-allow-methods': 'GET, OPTIONS', vary: 'Origin' };
}

function json(body, url, maxAge, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': maxAge ? `public, max-age=${maxAge}` : 'no-store', ...cors(url) },
  });
}

function disabledSet(env) {
  return new Set(String((env && env.DISABLED_SITES) || '').split(',').map(s => s.trim()).filter(Boolean));
}

function siteStatus(env) {
  env = env || {};
  const off = disabledSet(env), sites = {};
  for (const [id, s] of Object.entries(SITES)) {
    const enabled = !!s.search && s.enabled && !off.has(id);
    sites[id] = { name: s.name, enabled, working: health[id] ? health[id].ok : null };
    if (!enabled) sites[id].note = s.reason || 'Switched off';
    else if (health[id] && !health[id].ok) sites[id].note = health[id].error;
  }
  sites.ebay.mode = env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET ? 'api' : 'html';
  return { sites, cacheSeconds: CACHE_SECONDS };
}

async function apiSearch(url, env, ctx) {
  const site = url.searchParams.get('site') || '';
  const term = (url.searchParams.get('term') || '').trim().slice(0, 120);
  const page = (url.searchParams.get('page') || '1').slice(0, 200);
  const def = SITES[site];
  const fail = (error, status = 200) => json({ listings: [], next: null, error }, url, 0, status);
  if (!def) return fail('Unknown site', 400);
  if (!term) return fail('No search term', 400);
  if (!def.search || !def.enabled || disabledSet(env).has(site)) return fail(def.reason || 'Connector switched off');

  // 15-minute cache. The Cache API does nothing on *.workers.dev addresses, so the
  // response also carries max-age=900 and the browser's own cache does the same job there.
  const cacheKey = new Request(`${url.origin}/api/search?site=${enc(site)}&term=${enc(term)}&page=${enc(page)}`);
  let cache = null;
  try { cache = caches.default; } catch (e) { cache = null; }
  if (cache) {
    const hit = await cache.match(cacheKey).catch(() => null);
    if (hit) {
      const res = new Response(hit.body, hit);
      res.headers.set('x-vgf-cache', 'HIT');
      return res;
    }
  }
  try {
    const out = await def.search(term, page, env);
    health[site] = { ok: true, at: Date.now() };
    const seen = new Set();
    const listings = out.listings
      .filter(l => l.id && l.title && !seen.has(l.id) && seen.add(l.id))
      .slice(0, MAX_LISTINGS)
      .map(l => ({ site, id: l.id, url: l.url, title: l.title, price: l.price, currency: l.currency, image: l.image || '', size: l.size || '', extra: l.extra || {}, term }));
    const res = json({ listings, next: out.next == null ? null : out.next }, url, CACHE_SECONDS);
    if (cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cacheKey, res.clone()).catch(() => {}));
    return res;
  } catch (e) {
    const error = String((e && e.message) || e).slice(0, 200);
    health[site] = { ok: false, at: Date.now(), error };
    return fail(error);
  }
}

// ---------- shared helpers ----------

// One polite fetch: browser User-Agent, no cookies, 10 s timeout, one retry.
async function get(url, opt = {}, as = 'text', tries = 2) {
  let err;
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: opt.method || 'GET',
        body: opt.body,
        signal: ac.signal,
        headers: {
          'user-agent': UA,
          'accept-language': 'ja,en-US;q=0.9,en;q=0.8',
          accept: as === 'json' ? 'application/json' : 'text/html,application/xhtml+xml',
          ...(opt.headers || {}),
        },
      });
      if (!res.ok) throw new Error(res.status === 403 || res.status === 429 ? `Blocked (HTTP ${res.status})` : `HTTP ${res.status}`);
      return as === 'json' ? await res.json() : await res.text();
    } catch (e) {
      err = e && e.name === 'AbortError' ? new Error('Timed out after 10 s') : e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw err;
}

const pageNum = (p, max) => Math.min(Math.max(parseInt(p, 10) || 1, 1), max);
const num = v => {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object') v = v.value ?? v.amount ?? v.price ?? '';
  const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  return isFinite(n) ? n : 0;
};
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const unesc = s => String(s || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] !== '#') return ENT[e.toLowerCase()] ?? m;
  const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
  return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
});
const strip = s => unesc(String(s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const dig = (o, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);

// The JSON that Next.js sites embed in <script id="__NEXT_DATA__">.
function nextData(html) {
  const i = html.indexOf('id="__NEXT_DATA__"');
  if (i < 0) throw new Error('Page layout changed (no embedded data)');
  const start = html.indexOf('>', i) + 1;
  return JSON.parse(html.slice(start, html.indexOf('</script>', start)));
}

// Breadth-first walk for the first array whose objects carry all of `keys`.
function findArray(root, keys) {
  const queue = [root];
  for (let i = 0; i < queue.length && i < 40000; i++) {
    const v = queue[i];
    if (Array.isArray(v)) {
      const first = v[0];
      if (first && typeof first === 'object' && keys.every(k => k in first)) return v;
      for (let j = 0; j < v.length && j < 3; j++) if (v[j] && typeof v[j] === 'object') queue.push(v[j]);
    } else if (v && typeof v === 'object') {
      for (const k in v) if (v[k] && typeof v[k] === 'object') queue.push(v[k]);
    }
  }
  return null;
}

function pickImage(it) {
  for (const k of ['thumbnailImageUrl', 'imageUrl', 'thumbnailUrl', 'thumbnail', 'image', 'img', 'images', 'thumbnails']) {
    let v = it[k];
    if (Array.isArray(v)) v = v[0];
    if (v && typeof v === 'object') v = v.url || v.imageUrl || v.src;
    if (typeof v === 'string' && v) return v;
  }
  for (const k in it) if (typeof it[k] === 'string' && /^https?:\/\/\S+\.(jpe?g|png|webp)/i.test(it[k])) return it[k];
  return '';
}

function parseMoney(text) {
  const t = String(text || '');
  const m = t.match(/[\d][\d,]*(?:\.\d+)?/);
  const currency = /AU\s*\$|AUD/.test(t) ? 'AUD' : /C\s*\$|CAD/.test(t) ? 'CAD' : /£|GBP/.test(t) ? 'GBP' : /€|EUR/.test(t) ? 'EUR' : /¥|JPY|円/.test(t) ? 'JPY' : 'USD';
  return { price: m ? parseFloat(m[0].replace(/,/g, '')) : 0, currency };
}

// ---------- Yahoo Auctions JP ----------

async function yahooAuctions(term, page) {
  const p = pageNum(page, 3);
  const html = await get(`https://auctions.yahoo.co.jp/search/search/${enc(term)}/0?fixed=0&n=100&b=${(p - 1) * 100 + 1}`);
  const data = nextData(html);
  let items = dig(data, 'props.pageProps.initialState.search.items.listing.items');
  if (!Array.isArray(items)) items = findArray(data, ['auctionId', 'title']) || [];
  const listings = items.map(it => ({
    id: String(it.auctionId || ''),
    url: `https://auctions.yahoo.co.jp/jp/auction/${it.auctionId}`,
    title: strip(it.title),
    price: num(it.price),
    currency: 'JPY',
    image: it.imageUrl || pickImage(it),
    extra: { bids: num(it.bidCount), ends: it.endTime || '', buyNow: num(it.buyNowPrice) || undefined, proxy: `https://buyee.jp/item/yahoo/auction/${it.auctionId}` },
  }));
  return { listings, next: items.length >= 100 && p < 3 ? p + 1 : null };
}

// ---------- Yahoo Flea Market (PayPay) JP ----------

async function yahooFlea(term, page) {
  const p = pageNum(page, 3);
  const html = await get(`https://paypayfleamarket.yahoo.co.jp/search/${enc(term)}?open=1&page=${p}`);
  const items = findArray(nextData(html), ['id', 'title', 'price']) || [];
  const listings = items.map(it => ({
    id: String(it.id),
    url: `https://paypayfleamarket.yahoo.co.jp/item/${it.id}`,
    title: strip(it.title),
    price: num(it.price),
    currency: 'JPY',
    image: pickImage(it),
  }));
  return { listings, next: items.length && p < 3 ? p + 1 : null };
}

// ---------- Rakuma JP (server-rendered HTML) ----------

// The whole <a ...> tag around position idx, honouring quoted attribute values.
function tagAround(html, idx) {
  const start = html.lastIndexOf('<a', idx);
  let quote = '', i = start;
  for (; i < html.length; i++) {
    const c = html[i];
    if (quote) { if (c === quote) quote = ''; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === '>') break;
  }
  return { tag: html.slice(start, i + 1), end: i + 1 };
}

function attr(tag, name) {
  const m = tag.match(new RegExp('[\\s"\']' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i'));
  return m ? unesc(m[1] ?? m[2]) : '';
}

// One field out of the dataLayer JSON in an onclick, whichever quote style it uses.
function jsField(src, key) {
  const m = src.match(new RegExp('["\']?' + key + '["\']?\\s*:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|\'((?:[^\'\\\\]|\\\\.)*)\'|([\\d.]+))'));
  if (!m) return '';
  if (m[3] != null) return m[3];
  const raw = m[1] != null ? m[1] : m[2].replace(/\\'/g, "'").replace(/"/g, '\\"');
  try { return JSON.parse('"' + raw + '"'); } catch (e) { return raw; }
}

async function rakuma(term, page) {
  const p = pageNum(page, 3);
  const html = await get(`https://fril.jp/s?query=${enc(term)}&transaction=selling&page=${p}`);
  const marks = [];
  for (let i = html.indexOf('link_search_image'); i >= 0; i = html.indexOf('link_search_image', i + 1)) marks.push(i);
  const listings = [];
  marks.forEach((mark, k) => {
    const { tag, end } = tagAround(html, mark);
    const href = attr(tag, 'href');
    if (!tag.startsWith('<a') || !href) return;
    const inner = html.slice(end, Math.min(marks[k + 1] || html.length, end + 4000));
    const onclick = attr(tag, 'onclick');
    const id = (href.split(/[?#]/)[0].match(/([^/]+)\/?$/) || [])[1] || '';
    const title = jsField(onclick, 'item_name') || unesc((inner.match(/<img[^>]+alt=["']([^"']*)/i) || [])[1]);
    const price = num(jsField(onclick, 'price')) || num((inner.match(/[¥￥]\s*([\d,]+)/) || [])[1]);
    listings.push({
      id,
      url: href.startsWith('http') ? href : 'https://fril.jp' + href,
      title: strip(title),
      price,
      currency: 'JPY',
      image: unesc((inner.match(/data-original=["']([^"']+)/i) || inner.match(/<img[^>]+src=["']([^"']+)/i) || [])[1]),
      extra: { brand: jsField(onclick, 'brand_name') || undefined },
    });
  });
  return { listings, next: listings.length >= 40 && p < 3 ? p + 1 : null };
}

// ---------- eBay (official Browse API, HTML as the fallback) ----------

let ebayToken = null;

async function ebayAuth(env) {
  if (ebayToken && ebayToken.exp > Date.now() + 60000) return ebayToken.token;
  const d = await get('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: { authorization: 'Basic ' + btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`), 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=' + enc('https://api.ebay.com/oauth/api_scope'),
  }, 'json');
  if (!d.access_token) throw new Error('eBay key rejected');
  ebayToken = { token: d.access_token, exp: Date.now() + (d.expires_in || 7200) * 1000 };
  return ebayToken.token;
}

async function ebayApi(term, p, env) {
  const d = await get(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${enc(term)}&limit=200&offset=${(p - 1) * 200}`, {
    headers: { authorization: 'Bearer ' + (await ebayAuth(env)), 'x-ebay-c-marketplace-id': env.EBAY_MARKETPLACE || 'EBAY_US' },
  }, 'json');
  const items = d.itemSummaries || [];
  const listings = items.map(it => {
    const money = it.price || it.currentBidPrice || {};
    const id = it.legacyItemId || String(it.itemId || '').split('|')[1] || String(it.itemId || '');
    return {
      id,
      url: it.itemWebUrl || `https://www.ebay.com/itm/${id}`,
      title: strip(it.title),
      price: num(money.value),
      currency: money.currency || 'USD',
      image: (it.image && it.image.imageUrl) || (it.thumbnailImages && it.thumbnailImages[0] && it.thumbnailImages[0].imageUrl) || '',
      extra: { condition: it.condition || undefined, country: (it.itemLocation && it.itemLocation.country) || undefined },
    };
  });
  return { listings, next: d.next && p < 2 ? p + 1 : null };
}

async function ebayHtml(term, p) {
  const html = await get(`https://www.ebay.com/sch/i.html?_nkw=${enc(term)}&_ipg=240&_pgn=${p}`);
  const parts = html.split('data-listingid=');
  const listings = [];
  const textAt = (body, cls) => {
    const i = body.indexOf(cls);
    if (i < 0) return '';
    const start = body.indexOf('>', i) + 1;
    return strip(body.slice(start, start + 600).split('</div>')[0]).replace(/^new listing\s*/i, '').replace(/\s*opens in a new window or tab\s*$/i, '');
  };
  for (let k = 1; k < parts.length; k++) {
    const body = parts[k].slice(0, 8000);
    const id = (body.match(/^["']?(\d{9,})/) || [])[1];
    const title = textAt(body, 's-card__title');
    if (!id || !title || /^shop on ebay/i.test(title)) continue; // ghost rows
    const money = parseMoney(textAt(body, 's-card__price'));
    listings.push({
      id,
      url: `https://www.ebay.com/itm/${id}`,
      title,
      price: money.price,
      currency: money.currency,
      image: unesc((body.match(/<img[^>]+(?:data-src|src)=["'](https?:[^"']+)/i) || [])[1]),
    });
  }
  if (!listings.length && /captcha|pardon our interruption/i.test(html)) throw new Error('Blocked (eBay asked for a captcha)');
  return { listings, next: listings.length >= 200 && p < 2 ? p + 1 : null };
}

async function ebay(term, page, env) {
  const p = pageNum(page, 2);
  if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) return ebayHtml(term, p);
  try {
    return await ebayApi(term, p, env);
  } catch (apiErr) {
    try { return await ebayHtml(term, p); } catch (e) { throw new Error(`eBay API: ${apiErr.message}. HTML fallback: ${e.message}`); }
  }
}

// ---------- Grailed (Algolia) ----------

let grailedKeys = null;

async function grailedCreds(env) {
  if (env.GRAILED_ALGOLIA_APP_ID && env.GRAILED_ALGOLIA_KEY) return { app: env.GRAILED_ALGOLIA_APP_ID, key: env.GRAILED_ALGOLIA_KEY };
  if (grailedKeys) return grailedKeys;
  // Not set as Worker variables: try once to read the public keys from Grailed's page source.
  const html = await get('https://www.grailed.com/shop');
  const app = (html.match(/app(?:lication)?_?id\\?["']?\s*[:=]\s*\\?["']([A-Z0-9]{10})\\?["']/i) || [])[1];
  const key = (html.match(/(?:search_?(?:only_?)?(?:api_?)?key|api_?key)\\?["']?\s*[:=]\s*\\?["']([a-f0-9]{32})\\?["']/i) || [])[1];
  if (!app || !key) throw new Error('Grailed keys not set. Add GRAILED_ALGOLIA_APP_ID and GRAILED_ALGOLIA_KEY in the Worker settings.');
  return (grailedKeys = { app, key });
}

async function grailed(term, page, env) {
  const p = pageNum(page, 3);
  const { app, key } = await grailedCreds(env);
  const index = env.GRAILED_INDEX || 'Listing_by_heat_production';
  const d = await get(`https://${app.toLowerCase()}-dsn.algolia.net/1/indexes/${enc(index)}/query`, {
    method: 'POST',
    headers: { 'x-algolia-application-id': app, 'x-algolia-api-key': key, 'content-type': 'application/json', origin: 'https://www.grailed.com', referer: 'https://www.grailed.com/' },
    body: JSON.stringify({ query: term, hitsPerPage: 100, page: p - 1 }),
  }, 'json');
  const listings = (d.hits || []).map(it => ({
    id: String(it.id),
    url: `https://www.grailed.com/listings/${it.id}`,
    title: strip(it.title),
    price: num(it.price),
    currency: 'USD',
    image: (it.cover_photo && it.cover_photo.url) || '',
    size: it.size ? String(it.size).toUpperCase() : '',
    extra: { brand: (it.designers || []).map(x => x.name).filter(Boolean).join(' ') || it.designer_names || undefined },
  }));
  return { listings, next: p < Math.min(d.nbPages || 1, 3) ? p + 1 : null };
}

// ---------- Depop ----------

async function depop(term, page) {
  const cursor = page && page !== '1' ? `&cursor=${enc(page)}` : '';
  const d = await get(`https://webapi.depop.com/api/v2/search/products/?what=${enc(term)}&items_per_page=24&country=au&currency=AUD${cursor}`, {
    headers: { origin: 'https://www.depop.com', referer: 'https://www.depop.com/' },
  }, 'json');
  const listings = (d.products || d.objects || []).map(it => {
    const pr = it.price || it.pricing || {};
    const preview = it.preview || {};
    return {
      id: String(it.id || it.slug),
      url: `https://www.depop.com/products/${it.slug}/`,
      title: strip(it.title || it.description || String(it.slug || '').replace(/-/g, ' ')),
      price: num(pr.priceAmount ?? pr.price_amount ?? pr.discountedPriceAmount ?? (pr.original_price && pr.original_price.total_price) ?? pr),
      currency: pr.currencyName || pr.currency_name || pr.currency || 'AUD',
      image: typeof preview === 'string' ? preview : preview['320'] || preview['480'] || preview['640'] || Object.values(preview)[0] || '',
      size: Array.isArray(it.sizes) ? it.sizes.join('/') : '',
      extra: { brand: it.brandName || it.brand_name || undefined },
    };
  });
  const meta = d.meta || {};
  return { listings, next: (meta.hasMore ?? meta.has_more) && meta.cursor ? String(meta.cursor) : null };
}

// ---------- Mercari JP (private search API, signed with a DPoP header) ----------
// Ported from the open-source `mercapi` Python library. Most likely connector to break.

let mercariKey = null;
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function dpop(url, method) {
  if (!mercariKey) {
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    mercariKey = { key: pair.privateKey, jwk: { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }, uuid: crypto.randomUUID() };
  }
  const part = o => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const head = part({ typ: 'dpop+jwt', alg: 'ES256', jwk: mercariKey.jwk });
  const body = part({ iat: Math.floor(Date.now() / 1000), jti: crypto.randomUUID(), htu: url, htm: method, uuid: mercariKey.uuid });
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, mercariKey.key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(new Uint8Array(sig))}`;
}

async function mercari(term, page) {
  const p = pageNum(page, 3);
  const api = 'https://api.mercari.jp/v2/entities:search';
  const payload = JSON.stringify({
    userId: '',
    pageSize: 120,
    pageToken: p > 1 ? `v1:${p - 1}` : '',
    searchSessionId: crypto.randomUUID().replace(/-/g, ''),
    indexRouting: 'INDEX_ROUTING_UNSPECIFIED',
    thumbnailTypes: [],
    searchCondition: {
      keyword: term, excludeKeyword: '', sort: 'SORT_SCORE', order: 'ORDER_DESC', status: ['STATUS_ON_SALE'],
      sizeId: [], categoryId: [], brandId: [], sellerId: [], priceMin: 0, priceMax: 0, itemConditionId: [],
      shippingPayerId: [], shippingFromArea: [], shippingMethod: [], colorId: [], hasCoupon: false, attributes: [], itemTypes: [], skuIds: [],
    },
    defaultDatasets: ['DATASET_TYPE_MERCARI', 'DATASET_TYPE_BEYOND'],
    serviceFrom: 'suruga',
    withItemBrand: true, withItemSize: false, withItemPromotions: true, withItemSizes: true, withShopname: false,
  });
  let d, err;
  for (let i = 0; i < 2 && !d; i++) { // a fresh signature for each try
    try {
      d = await get(api, { method: 'POST', body: payload, headers: { dpop: await dpop(api, 'POST'), 'x-platform': 'web', 'content-type': 'application/json; charset=utf-8', origin: 'https://jp.mercari.com', referer: 'https://jp.mercari.com/' } }, 'json', 1);
    } catch (e) { err = e; }
  }
  if (!d) throw err;
  const items = d.items || [];
  const listings = items.map(it => {
    const shop = it.itemType === 'ITEM_TYPE_BEYOND' || !/^m\d+$/.test(String(it.id));
    return {
      id: String(it.id),
      url: shop ? `https://jp.mercari.com/shops/product/${it.id}` : `https://jp.mercari.com/item/${it.id}`,
      title: strip(it.name),
      price: num(it.price),
      currency: 'JPY',
      image: (it.thumbnails && it.thumbnails[0]) || '',
      size: (it.itemSizes && it.itemSizes[0] && it.itemSizes[0].name) || (it.itemSize && it.itemSize.name) || '',
      extra: { brand: (it.itemBrand && [it.itemBrand.name, it.itemBrand.subName].filter(Boolean).join(' ')) || undefined, proxy: shop ? undefined : `https://buyee.jp/mercari/item/${it.id}` },
    };
  });
  return { listings, next: d.meta && d.meta.nextPageToken && items.length && p < 3 ? p + 1 : null };
}
