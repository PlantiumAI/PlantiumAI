// Construtores das opções dos 8 gráficos ECharts — portados de
// dashboard-local.html (renderAllCharts). Importado só pelo dashboard.
import * as echarts from "echarts";
import { genData, score, type GenData, type Period, type Reading, type ThemeColors } from "./plantium-demo";

const hexA = (h: string, a: number) => {
  h = h.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export function readThemeColors(): ThemeColors {
  const cs = getComputedStyle(document.documentElement);
  const g = (n: string, f: string) => { const v = cs.getPropertyValue(n).trim(); return v || f; };
  return { text: g("--pl-text-muted", "#5b6b61"), base: g("--pl-text-base", "#152a1f"), grid: g("--pl-border-subtle", "rgba(0,0,0,.08)"), surf: g("--pl-surface-solid", "#fff") };
}

const area = (col: string) => ({ color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: hexA(col, 0.28) }, { offset: 1, color: hexA(col, 0) }]) });
const ser = (name: string, data: number[], col: string, fill: boolean, extra?: object) => Object.assign({ name, type: "line", smooth: true, showSymbol: false, lineStyle: { width: 2.4, color: col }, itemStyle: { color: col }, areaStyle: fill ? area(col) : null, data }, extra || {});

function baseOpt(d: GenData, c: ThemeColors, series: object[], yExtra?: object, extra?: object) {
  return Object.assign({
    grid: { left: 6, right: 14, top: 30, bottom: 6, containLabel: true },
    legend: { top: 0, right: 0, icon: "circle", itemWidth: 8, itemHeight: 8, textStyle: { color: c.text, fontSize: 11 } },
    tooltip: { trigger: "axis", backgroundColor: c.surf, borderWidth: 1, borderColor: c.grid, textStyle: { color: c.base, fontSize: 12 }, padding: 10, axisPointer: { type: "line", snap: true, lineStyle: { color: hexA("#22c55e", 0.55), width: 1 }, label: { show: true, backgroundColor: "#22c55e", color: "#fff", fontSize: 11, fontWeight: 600 } } },
    xAxis: { type: "category", data: d.labels, boundaryGap: false, axisLine: { lineStyle: { color: c.grid } }, axisTick: { show: false }, axisLabel: { color: c.text, fontSize: 11, hideOverlap: true } },
    yAxis: Object.assign({ type: "value", scale: true, splitLine: { lineStyle: { color: c.grid } }, axisLabel: { color: c.text, fontSize: 11 } }, yExtra || {}),
    series,
  }, extra || {});
}

/** Constrói as opções dos 8 gráficos (trend, temp, hum, co2, ph, radar, compare, heat). */
export function buildChartOptions(period: Period, r: Reading, c: ThemeColors): Record<string, object> {
  const d = genData(period);
  const gz = { left: 6, right: 16, top: 30, bottom: 52, containLabel: true };
  const dz = [
    { type: "inside", start: 62, end: 100, zoomOnMouseWheel: true, moveOnMouseMove: true, moveOnMouseWheel: false, preventDefaultMouseMove: true, zoomLock: false, throttle: 40, minValueSpan: 5 },
    { type: "slider", start: 62, end: 100, height: 22, bottom: 8, borderColor: "transparent", backgroundColor: hexA("#22c55e", 0.05), fillerColor: hexA("#22c55e", 0.16), handleSize: "120%", handleStyle: { color: "#22c55e", borderColor: "#22c55e" }, moveHandleStyle: { color: "#22c55e" }, emphasis: { handleStyle: { color: "#16a34a" } }, dataBackground: { lineStyle: { color: c.grid }, areaStyle: { color: "transparent" } }, selectedDataBackground: { lineStyle: { color: "#22c55e" }, areaStyle: { color: hexA("#22c55e", 0.12) } }, textStyle: { color: c.text, fontSize: 10 } },
  ];

  const trend = baseOpt(d, c, [ser("Saúde %", d.health, "#22c55e", true)], { min: 0, max: 100, axisLabel: { color: c.text, fontSize: 11, formatter: "{value}%" } }, { legend: { show: false }, grid: { left: 6, right: 14, top: 12, bottom: 6, containLabel: true } });
  const temp = baseOpt(d, c, [ser("Ar", d.airT, "#22c55e", true), ser("Solo", d.soilT, "#14b8a6", false)], { axisLabel: { color: c.text, fontSize: 11, formatter: "{value}°" } }, { dataZoom: dz, grid: gz });
  const hum = baseOpt(d, c, [ser("Solo", d.soilH, "#22c55e", true), ser("Ar", d.airH, "#38bdf8", false)], { min: 0, max: 100, axisLabel: { color: c.text, fontSize: 11, formatter: "{value}%" } }, { dataZoom: dz, grid: gz });
  const co2 = baseOpt(d, c, [ser("CO₂", d.co2, "#38bdf8", true)], undefined, { legend: { show: false }, dataZoom: dz, grid: gz });
  const ph = baseOpt(d, c, [ser("pH", d.ph, "#22c55e", true, { markArea: { silent: true, itemStyle: { color: hexA("#22c55e", 0.1) }, data: [[{ yAxis: 5.5 }, { yAxis: 7.5 }]] } })], { min: 5, max: 8 }, { legend: { show: false }, dataZoom: dz, grid: gz });

  const cur = [score("soil", r.soil), score("airT", r.airT), score("airH", r.airH), score("co2", r.co2), score("ph", r.ph), score("lux", r.lux)];
  const radar = {
    tooltip: { backgroundColor: c.surf, borderColor: c.grid, borderWidth: 1, textStyle: { color: c.base } },
    legend: { bottom: 0, icon: "circle", itemWidth: 8, itemHeight: 8, textStyle: { color: c.text, fontSize: 11 } },
    radar: { center: ["50%", "46%"], radius: "64%", indicator: [{ name: "Umid. solo", max: 100 }, { name: "Temp. ar", max: 100 }, { name: "Umid. ar", max: 100 }, { name: "CO₂", max: 100 }, { name: "pH", max: 100 }, { name: "Luz", max: 100 }], axisName: { color: c.text, fontSize: 11 }, splitLine: { lineStyle: { color: c.grid } }, splitArea: { areaStyle: { color: ["transparent"] } }, axisLine: { lineStyle: { color: c.grid } } },
    series: [{ type: "radar", data: [
      { value: [100, 100, 100, 100, 100, 100], name: "Ideal", lineStyle: { color: hexA("#38bdf8", 0.7), type: "dashed" }, itemStyle: { color: "#38bdf8" }, areaStyle: { color: hexA("#38bdf8", 0.06) } },
      { value: cur, name: "Agora", lineStyle: { color: "#22c55e", width: 2.4 }, itemStyle: { color: "#22c55e" }, areaStyle: { color: hexA("#22c55e", 0.2) } },
    ] }],
  };

  const cats = ["Umid. solo", "Temp. ar", "Umid. ar", "CO₂", "pH"];
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const mk = (f: number) => [Math.round(avg(d.soilH) * f), +(avg(d.airT) * f).toFixed(1), Math.round(avg(d.airH) * f), Math.round(avg(d.co2) * f / 10), +(avg(d.ph) * f).toFixed(1)];
  const compare = {
    grid: { left: 6, right: 10, top: 14, bottom: 6, containLabel: true },
    tooltip: { trigger: "axis", backgroundColor: c.surf, borderColor: c.grid, borderWidth: 1, textStyle: { color: c.base, fontSize: 12 } },
    xAxis: { type: "category", data: cats, axisLine: { lineStyle: { color: c.grid } }, axisTick: { show: false }, axisLabel: { color: c.text, fontSize: 11 } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: c.grid } }, axisLabel: { color: c.text, fontSize: 11 } },
    series: [
      { name: "Hoje", type: "bar", data: mk(1), itemStyle: { color: "#22c55e", borderRadius: [4, 4, 0, 0] }, barWidth: 11 },
      { name: "Ontem", type: "bar", data: mk(0.94), itemStyle: { color: "#14b8a6", borderRadius: [4, 4, 0, 0] }, barWidth: 11 },
      { name: "Semana", type: "bar", data: mk(0.88), itemStyle: { color: "#38bdf8", borderRadius: [4, 4, 0, 0] }, barWidth: 11 },
    ],
  };

  const rows = ["Umid. solo", "Temp. ar", "Umid. ar", "CO₂", "pH", "Luz"];
  const cols = d.labels.filter((_, i) => i % Math.ceil(d.labels.length / 12) === 0);
  const seriesArr = [d.soilH, d.airT, d.airH, d.co2, d.ph, d.health];
  const keys = ["soil", "airT", "airH", "co2", "ph", "lux"];
  const hd: number[][] = [];
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < cols.length; x++) {
    const idx = Math.min(seriesArr[y].length - 1, x * Math.ceil(d.labels.length / 12));
    hd.push([x, y, score(keys[y], seriesArr[y][idx])]);
  }
  const heat = {
    grid: { left: 6, right: 14, top: 10, bottom: 56, containLabel: true },
    tooltip: { backgroundColor: c.surf, borderColor: c.grid, borderWidth: 1, textStyle: { color: c.base, fontSize: 12 }, formatter: (p: { value: number[] }) => rows[p.value[1]] + "<br/>" + cols[p.value[0]] + ": <b>" + p.value[2] + "% ideal</b>" },
    xAxis: { type: "category", data: cols, splitArea: { show: true }, axisLine: { lineStyle: { color: c.grid } }, axisTick: { show: false }, axisLabel: { color: c.text, fontSize: 10 } },
    yAxis: { type: "category", data: rows, splitArea: { show: true }, axisLine: { lineStyle: { color: c.grid } }, axisTick: { show: false }, axisLabel: { color: c.text, fontSize: 11 } },
    visualMap: { min: 0, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 6, itemHeight: 90, textStyle: { color: c.text, fontSize: 11 }, inRange: { color: ["#ef4444", "#f59e0b", "#22c55e"] } },
    series: [{ type: "heatmap", data: hd, itemStyle: { borderColor: c.surf, borderWidth: 2 }, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,.25)" } } }],
  };

  return { trend, temp, hum, co2, ph, radar, compare, heat };
}
