import React, { useState, useCallback, useMemo } from "react";
import { TooltipProps } from "recharts";
// Chart.tsx
import { aggregateCandles } from "../lib/utils";
import { CandleData } from "../lib/utils";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

interface CandlestickChartProps {
  data: CandleData[];
  currentPrice?: number;
  symbol?: string;
}

// Custom candlestick shape for the Bar component
const CandlestickShape = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: CandleData;
}) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const fill = isGreen ? "#10b981" : "#ef4444";
  const bodyColor = isGreen ? "#10b981" : "#ef4444";

  // Calculate positions relative to the chart's Y axis
  // The bar's y and height represent the range from low to high
  const barTop = y; // This is the Y position of the "high" value
  const barHeight = height; // This is the pixel height from high to low
  const priceRange = high - low || 0.0001;

  // Body position within the bar
  const bodyTop =
    barTop + ((high - Math.max(open, close)) / priceRange) * barHeight;
  const bodyBottom =
    barTop + ((high - Math.min(open, close)) / priceRange) * barHeight;
  const bodyH = Math.max(1, bodyBottom - bodyTop);

  // Wick (center line from high to low)
  const wickX = x + width / 2;

  return (
    <g>
      {/* Wick line */}
      <line
        x1={wickX}
        y1={barTop}
        x2={wickX}
        y2={barTop + barHeight}
        stroke={fill}
        strokeWidth={1}
      />
      {/* Candle body */}
      <rect
        x={x + width * 0.15}
        y={bodyTop}
        width={width * 0.7}
        height={bodyH}
        fill={bodyColor}
        rx={1}
      />
    </g>
  );
};

type ChartData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: {
    payload: ChartData;
  }[];
  label?: string;
};
// Custom tooltip
const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isGreen = data.close >= data.open;

  return (
    <div className="bg-[#1e2538] border border-gray-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-1.5 font-mono">{data.time}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-gray-500">Open:</span>
        <span className="text-white font-mono text-right">
          ${data.open.toFixed(4)}
        </span>
        <span className="text-gray-500">High:</span>
        <span className="text-emerald-400 font-mono text-right">
          ${data.high.toFixed(4)}
        </span>
        <span className="text-gray-500">Low:</span>
        <span className="text-red-400 font-mono text-right">
          ${data.low.toFixed(4)}
        </span>
        <span className="text-gray-500">Close:</span>
        <span
          className={`font-mono text-right ${isGreen ? "text-emerald-400" : "text-red-400"}`}
        >
          ${data.close.toFixed(4)}
        </span>
        <span className="text-gray-500">Volume:</span>
        <span className="text-white font-mono text-right">
          {(data.volume / 1000).toFixed(1)}K
        </span>
      </div>
      <div
        className={`mt-1.5 pt-1.5 border-t border-gray-700 text-center font-medium ${isGreen ? "text-emerald-400" : "text-red-400"}`}
      >
        {isGreen ? "+" : ""}
        {(((data.close - data.open) / data.open) * 100).toFixed(2)}%
      </div>
    </div>
  );
};

export default function CandlestickChart({
  data,
  currentPrice,
  symbol,
}: CandlestickChartProps) {
  const [zoomDomain, setZoomDomain] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // Compute the visible data based on zoom
  const visibleData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (zoomDomain) {
      return data.slice(zoomDomain.start, zoomDomain.end);
    }
    // Show last 60 candles by default, or all if fewer
    const showCount = Math.min(data.length, 60);
    return data.slice(data.length - showCount);
  }, [data, zoomDomain]);

  // Calculate price domain with padding
  const priceDomain = useMemo(() => {
    if (visibleData.length === 0) return [0, 1];
    const highs = visibleData.map((d) => d.high);
    const lows = visibleData.map((d) => d.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const padding = (max - min) * 0.1 || 0.01;
    return [min - padding, max + padding];
  }, [visibleData]);

  // Volume domain
  const maxVolume = useMemo(() => {
    if (visibleData.length === 0) return 1;
    return Math.max(...visibleData.map((d) => d.volume)) * 1.2;
  }, [visibleData]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const currentStart = zoomDomain?.start ?? Math.max(0, data.length - 60);
    const currentEnd = zoomDomain?.end ?? data.length;
    const range = currentEnd - currentStart;
    if (range <= 10) return; // minimum 10 candles
    const mid = Math.floor((currentStart + currentEnd) / 2);
    const newRange = Math.floor(range * 0.7);
    setZoomDomain({
      start: Math.max(0, mid - Math.floor(newRange / 2)),
      end: Math.min(data.length, mid + Math.ceil(newRange / 2)),
    });
  }, [data.length, zoomDomain]);

  const handleZoomOut = useCallback(() => {
    if (!zoomDomain) return;
    const range = zoomDomain.end - zoomDomain.start;
    const mid = Math.floor((zoomDomain.start + zoomDomain.end) / 2);
    const newRange = Math.min(data.length, Math.floor(range * 1.5));
    const newStart = Math.max(0, mid - Math.floor(newRange / 2));
    const newEnd = Math.min(data.length, newStart + newRange);
    if (newEnd - newStart >= data.length) {
      setZoomDomain(null);
    } else {
      setZoomDomain({ start: newStart, end: newEnd });
    }
  }, [data.length, zoomDomain]);

  const handleReset = useCallback(() => {
    setZoomDomain(null);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-[#0f1219] rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading chart data...</p>
      </div>
    );
  }

  // We use the "high" field for the bar height (high-low range) and a custom shape
  // to draw the actual candlestick
  const chartData = visibleData.map((d) => ({
    ...d,
    // The bar needs a value representing the range for positioning
    range: d.high - d.low || 0.0001,
    // Base for the bar (the low price)
    base: d.low,
  }));

  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={handleZoomIn}
          className="px-2 py-1 bg-white/5 border border-gray-700 rounded text-gray-400 hover:text-white hover:bg-white/10 text-xs font-mono transition-colors"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-2 py-1 bg-white/5 border border-gray-700 rounded text-gray-400 hover:text-white hover:bg-white/10 text-xs font-mono transition-colors"
        >
          -
        </button>
        <button
          onClick={handleReset}
          className="px-2 py-1 bg-white/5 border border-gray-700 rounded text-gray-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Candlestick Chart */}
      <div className="bg-[#0f1219] rounded-t-lg pt-2">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
              minTickGap={40}
            />
            <YAxis
              domain={priceDomain}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              width={65}
              orientation="right"
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
            />
            {/* Current price reference line */}
            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
            {/* Candlestick bars */}
            <Bar
              dataKey="range"
              stackId="candle"
              shape={CandlestickShape}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="bg-[#0f1219] rounded-b-lg pb-2 -mt-1">
        <ResponsiveContainer width="100%" height={80}>
          <ComposedChart
            data={chartData}
            margin={{ top: 0, right: 10, bottom: 5, left: 10 }}
          >
            <XAxis
              dataKey="time"
              tick={false}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
            />
            <YAxis
              domain={[0, maxVolume]}
              tick={{ fill: "#64748b", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
              width={65}
              orientation="right"
            />
            <Tooltip
              content={({ active, payload }: TooltipProps<number, string>) => {
                if (!active || !payload?.[0]) return null;
                return (
                  <div className="bg-[#1e2538] border border-gray-700 rounded px-2 py-1 text-[10px] text-gray-300">
                    Vol: {(payload[0].value / 1000).toFixed(1)}K
                  </div>
                );
              }}
              cursor={false}
            />
            <Bar
              dataKey="volume"
              isAnimationActive={false}
              radius={[1, 1, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.close >= entry.open
                      ? "rgba(16,185,129,0.4)"
                      : "rgba(239,68,68,0.4)"
                  }
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
