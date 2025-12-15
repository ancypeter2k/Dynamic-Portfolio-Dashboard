"use client";

import React, { useState } from "react";

interface PieChartData {
  name: string;
  value: number;
  investment: number;
  percent: number;
  color: string;
}

interface LineChartData {
  name: string;
  fullName: string;
  value: number;
  isGain: boolean;
}

interface PortfolioChartsProps {
  pieChartData: PieChartData[];
  lineChartData: LineChartData[];
}


export default function PortfolioCharts({
  pieChartData = [],
  lineChartData = [],
}: PortfolioChartsProps) {
  const SVG_SIZE = 300;
  const PIE_RADIUS = 100;
  const PIE_CENTER = SVG_SIZE / 2;

  const [pieHover, setPieHover] = useState<{
    name: string;
    value: string;
    percent: string;
  } | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [lineHover, setLineHover] = useState<{
    name: string;
    value: number;
    label: string;
  } | null>(null);

  
  const topStocks = pieChartData;

  
  const renderPieChart = () => {
    let startAngle = 0;
    const slices: JSX.Element[] = [];
    
    const ANGLE_OFFSET = -Math.PI / 2;

    const getCoordinatesForAngle = (angle: number) => {
      const x = PIE_CENTER + PIE_RADIUS * Math.cos(angle);
      const y = PIE_CENTER + PIE_RADIUS * Math.sin(angle);
      return [x, y];
    };

    topStocks.forEach((slice, index) => {
      const startRadians = startAngle + ANGLE_OFFSET;
      const endRadians =
        startAngle + 2 * Math.PI * slice.percent + ANGLE_OFFSET;

      const [startX, startY] = getCoordinatesForAngle(startRadians);
      const [endX, endY] = getCoordinatesForAngle(endRadians);

      const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

      const d = [
        `M ${PIE_CENTER},${PIE_CENTER}`,
        `L ${startX},${startY}`,
        `A ${PIE_RADIUS},${PIE_RADIUS} 0 ${largeArcFlag} 1 ${endX},${endY}`,
        `Z`,
      ].join(" ");

      if (slice.percent > 0.0001) {
        
        const midAngle = (startRadians + endRadians) / 2;
        const EXPLODE_OFFSET = hoveredSlice === index ? 8 : 0; 
        const dx = EXPLODE_OFFSET * Math.cos(midAngle);
        const dy = EXPLODE_OFFSET * Math.sin(midAngle);

        slices.push(
          <path
            key={crypto.randomUUID()}
            d={d}
            fill={slice.color}
            transform={`translate(${dx},${dy})`}
            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
            onMouseEnter={() => {
              setPieHover({
                name: slice.name,
                value: `₹${slice.value.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}`,
                percent: `${(slice.percent * 100).toFixed(1)}%`,
              });
              setHoveredSlice(index);
            }}
            onMouseLeave={() => {
              setPieHover(null);
              setHoveredSlice(null);
            }}
          />
        );
      }

      startAngle += 2 * Math.PI * slice.percent;
    });

    return (
      <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full">
        {slices}
      </svg>
    );
  };

  
  const renderLegend = () => {
    const items = topStocks.slice(0, 8);
    const leftColumn = items.slice(0, 4);
    const rightColumn = items.slice(4, 8);

    return (
      
      <div className="grid grid-cols-2 gap-x-6 mb-4">
        {}
        <div className="flex flex-col gap-1">
          {leftColumn.map((s, i) => (
            <div
              key={crypto.randomUUID()}
              className="flex items-center gap-2 text-xs"
            >
              {}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: s.color }}
              />
              {}
              <span className="text-gray-300">{s.name}</span>
              {}
              <span className="text-gray-500 text-[10px] ml-auto">
                ({(s.percent * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
        {}
        <div className="flex flex-col gap-1">
          {rightColumn.map((s, i) => (
            <div
              key={crypto.randomUUID()}
              className="flex items-center gap-2 text-xs"
            >
              {}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: s.color }}
              />
              {}
              <span className="text-gray-300">{s.name}</span>
              {}
              <span className="text-gray-500 text-[10px] ml-auto">
                ({(s.percent * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  
  const gainLossData = lineChartData;

  
  const renderLineChart = () => {
    const CHART_WIDTH_PX = 400;
    const CHART_HEIGHT_PX = 280;
    const PADDING = { TOP: 20, BOTTOM: 40, LEFT: 80, RIGHT: 20 };
    const G_WIDTH = CHART_WIDTH_PX - PADDING.LEFT - PADDING.RIGHT;
    const G_HEIGHT = CHART_HEIGHT_PX - PADDING.TOP - PADDING.BOTTOM;

    const allValues = gainLossData.map((d) => d.value);
    const yMin = Math.min(0, ...allValues);
    const yMax = Math.max(0, ...allValues);
    const yRange = yMax - yMin;

    const yScale = (value: number) => {
      if (yRange === 0) return PADDING.TOP + G_HEIGHT / 2;
      return PADDING.TOP + G_HEIGHT - ((value - yMin) / yRange) * G_HEIGHT;
    };

    const xScale = (index: number) => {
      const numPoints = gainLossData.length;
      if (numPoints <= 1) return PADDING.LEFT + G_WIDTH / 2;
      return PADDING.LEFT + (index / (numPoints - 1)) * G_WIDTH;
    };

    const points = gainLossData
      .map((d, index) => `${xScale(index)},${yScale(d.value)}`)
      .join(" ");

    const linePath =
      gainLossData.length > 1 ? (
        <path
          d={`M ${points.replace(/ /g, " L ")}`}
          fill="none"
          stroke="#60A5FA"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />
      ) : null;

    const zeroLineY = yScale(0);
    const zeroLine = (
      <line
        x1={PADDING.LEFT}
        y1={zeroLineY}
        x2={CHART_WIDTH_PX - PADDING.RIGHT}
        y2={zeroLineY}
        stroke="#4B5563"
        strokeWidth="1"
        strokeDasharray="4 2"
      />
    );

    const dataPointsAndLabels = gainLossData.map((d, index) => {
      const x = xScale(index);
      const y = yScale(d.value);
      const color = d.isGain ? "#34D399" : d.value < 0 ? "#F87171" : "#9CA3AF";

      return (
        <React.Fragment key={crypto.randomUUID()}>
          <circle
            cx={x}
            cy={y}
            r="5"
            fill={color}
            className="stroke-gray-900 stroke-2 transition-all duration-300 hover:scale-125 cursor-pointer"
            onMouseEnter={() =>
              setLineHover({
                name: d.fullName || d.name,
                value: d.value,
                label: `${d.value >= 0 ? "+" : "–"} ₹${Math.abs(
                  d.value
                ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
              })
            }
            onMouseLeave={() => setLineHover(null)}
          />

          <text
            x={x}
            y={CHART_HEIGHT_PX - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
            className="font-medium"
          >
            {d.name}
          </text>
        </React.Fragment>
      );
    });

    const yAxisLabels = [yMin, 0, yMax]
      .filter((v, i, self) => self.indexOf(v) === i)
      .map((value, index) => {
        if (value === 0 && (yMax === 0 || yMin === 0) && index !== 1)
          return null;

        const y = yScale(value);
        return (
          <text
            key={crypto.randomUUID()}
            x={PADDING.LEFT - 5}
            y={y}
            textAnchor="end"
            alignmentBaseline="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            {value >= 0 && value !== 0 ? "+" : ""}₹
            {value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </text>
        );
      })
      .filter(Boolean);

    return (
      <svg
        viewBox={`0 0 ${CHART_WIDTH_PX} ${CHART_HEIGHT_PX}`}
        className="w-full h-full"
      >
        <line
          x1={PADDING.LEFT}
          y1={PADDING.TOP}
          x2={PADDING.LEFT}
          y2={CHART_HEIGHT_PX - PADDING.BOTTOM}
          stroke="#4B5563"
          strokeWidth="1"
        />

        {zeroLine}
        {linePath}

        {dataPointsAndLabels}
        {yAxisLabels}

        <text
          x={PADDING.LEFT / 2}
          y={CHART_HEIGHT_PX / 2}
          transform={`rotate(-90 ${PADDING.LEFT / 2} ${CHART_HEIGHT_PX / 2})`}
          textAnchor="middle"
          fontSize="12"
          fill="#9CA3AF"
          className="font-semibold"
        >
          Gain/Loss (₹)
        </text>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {}
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800 relative h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4">
          Top 8 Investment Distribution (₹)
        </h3>

        {}
        {topStocks.length > 0 && <div className="mb-4">{renderLegend()}</div>}

        {pieHover && (
          <div className="absolute top-4 right-4 bg-indigo-900/50 border border-indigo-700 text-indigo-200 p-2 rounded-lg text-sm shadow-md z-10 pointer-events-none">
            <div className="font-semibold">{pieHover.name}</div>
            <div>
              {pieHover.value} ({pieHover.percent})
            </div>
          </div>
        )}

        <div className="h-[300px] flex-1">
          {topStocks.length > 0 ? (
            renderPieChart()
          ) : (
            <div className="text-center py-12 text-gray-500">
              No investment data to display.
            </div>
          )}
        </div>
      </div>

      {}
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800 relative h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4">
          Top 5 Gain/Loss Trend (₹)
          {gainLossData.every((d) => !d.isGain) && (
            <span className="text-xs font-normal text-yellow-400 ml-2">
              (All losses - Market data unavailable)
            </span>
          )}
        </h3>

        {lineHover && (
          <div
            className={`absolute top-4 right-4 ${
              lineHover.value >= 0
                ? "bg-green-900/50 border-green-700 text-green-200"
                : "bg-red-900/50 border-red-700 text-red-200"
            } p-2 rounded-lg text-sm shadow-md z-10 pointer-events-none`}
          >
            <div className="font-semibold">{lineHover.name}</div>
            <div>{lineHover.label}</div>
          </div>
        )}

        <div className="h-[300px] flex-1">
          {gainLossData.length > 0 ? (
            renderLineChart()
          ) : (
            <div className="text-center py-12 text-gray-500">
              No performance data to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
