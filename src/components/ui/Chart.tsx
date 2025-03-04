"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TrendChartProps {
  data: {
    months: string[];
    primaryData: number[];
    secondaryData: number[];
    yearlyData: Array<{ year: string; primaryData: number[]; secondaryData: number[] }>;
    currentPoint: {
      month: string;
      value: number;
      label: string;
    };
  };
}

const Chart: React.FC<TrendChartProps> = ({ data }) => {
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [displayData, setDisplayData] = useState<typeof data>({
    ...data,
    primaryData: data.primaryData,
    secondaryData: data.secondaryData,
    months: data.months,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateDataForView = useCallback((view: 'day' | 'week' | 'month' | 'year') => {
    let filteredData;
    switch (view) {
      case 'day':
        filteredData = {
          ...data,
          months: data.months.slice(-1),
          primaryData: data.primaryData.slice(-1),
          secondaryData: data.secondaryData.slice(-1),
        };
        break;
      case 'week':
        filteredData = {
          ...data,
          months: data.months.slice(-4),
          primaryData: data.primaryData.slice(-4),
          secondaryData: data.secondaryData.slice(-4),
        };
        break;
      case 'year':
        filteredData = {
          ...data,
          months: data.months,
          primaryData: data.yearlyData[1].primaryData,
          secondaryData: data.yearlyData[1].secondaryData,
        };
        break;
      case 'month':
      default:
        filteredData = {
          ...data,
          months: data.months,
          primaryData: data.primaryData,
          secondaryData: data.secondaryData,
        };
        break;
    }
    setDisplayData(filteredData);
  }, [data]);

  useEffect(() => {
    updateDataForView(view);
  }, [view, updateDataForView]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...displayData.primaryData, ...displayData.secondaryData) * 1.2;

    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight * i) / 4;
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
    }
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';

    const xStep = chartWidth / (displayData.months.length - 1);
    displayData.months.forEach((month, i) => {
      const x = padding + i * xStep;
      ctx.fillText(month, x, height - padding / 2);
    });

    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;

    displayData.primaryData.forEach((value, i) => {
      const x = padding + i * xStep;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;

    displayData.secondaryData.forEach((value, i) => {
      const x = padding + i * xStep;
      const y = padding + chartHeight - (value / maxValue) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    const currentMonthIndex = displayData.months.indexOf(displayData.currentPoint.month);
    if (currentMonthIndex !== -1) {
      const x = padding + currentMonthIndex * xStep;
      const y = padding + chartHeight - (displayData.currentPoint.value / maxValue) * chartHeight;

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      const pillWidth = 60;
      const pillHeight = 24;
      ctx.roundRect(x - pillWidth / 2, y - 40, pillWidth, pillHeight, 12);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(displayData.currentPoint.label, x, y - 25);

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [displayData]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 text-sm ${view === 'day' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-black'} rounded-md transition-transform hover:scale-105`}
            onClick={() => setView('day')}>
            Day
          </button>
          <button 
            className={`px-4 py-2 text-sm ${view === 'week' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-black'} rounded-md transition-transform hover:scale-105`}
            onClick={() => setView('week')}>
            Week
          </button>
          <button 
            className={`px-4 py-2 text-sm ${view === 'month' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-black'} rounded-md transition-transform hover:scale-105`}
            onClick={() => setView('month')}>
            Month
          </button>
          <button 
            className={`px-4 py-2 text-sm ${view === 'year' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-black'} rounded-md transition-transform hover:scale-105`}
            onClick={() => setView('year')}>
            Year
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={300} 
          className="w-full h-full border border-gray-300" 
        />
      </div>
    </div>
  );
};

export default Chart;
