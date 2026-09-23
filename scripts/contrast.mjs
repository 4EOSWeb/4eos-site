const pairs = [
  ["bone on ink", [232, 228, 216], [5, 7, 10]],
  ["gold on ink", [245, 183, 0], [5, 7, 10]],
  ["ink on bone", [5, 7, 10], [232, 228, 216]],
  ["gold on bone", [245, 183, 0], [232, 228, 216]],
  ["muted on ink", [144, 141, 134], [5, 7, 10]],
  ["muted on navy", [144, 141, 134], [10, 31, 51]],
  ["bone on navy", [232, 228, 216], [10, 31, 51]],
  ["faint on ink", [88, 87, 82], [5, 7, 10]],
];

function srgb(c) {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}
function lum([r, g, b]) {
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

for (const [name, fg, bg] of pairs) {
  const r = ratio(fg, bg);
  const aa = r >= 4.5 ? "AA" : r >= 3 ? "AA-large" : "FAIL";
  console.log(`${name.padEnd(18)} ${r.toFixed(2)}  ${aa}`);
}
