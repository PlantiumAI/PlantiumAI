"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

// Wrapper ECharts client-side (sem SSR). Reaplica option, redimensiona via
// ResizeObserver (cobre colapso da sidebar) e reseta dataZoom no duplo-clique.
export function EChart({
  option,
  height = 250,
  resetZoom = false,
}: {
  option: object;
  height?: number;
  resetZoom?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const instRef = useRef<ReturnType<typeof echarts.init> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const inst = echarts.init(ref.current);
    instRef.current = inst;
    const ro = new ResizeObserver(() => {
      try { inst.resize(); } catch { /* noop */ }
    });
    ro.observe(ref.current);
    if (resetZoom) {
      inst.getZr().on("dblclick", () => inst.dispatchAction({ type: "dataZoom", start: 0, end: 100 }));
    }
    return () => { ro.disconnect(); inst.dispose(); instRef.current = null; };
  }, [resetZoom]);

  useEffect(() => {
    instRef.current?.setOption(option as echarts.EChartsCoreOption, true);
  }, [option]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
