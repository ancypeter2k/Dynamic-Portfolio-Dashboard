"use client";

import React from 'react';

interface SummaryCardsProps {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalGain: number;
  totalLoss: number;
  totalRevenue: number;
  overallReturn: number;
  isGain: boolean;
}

const Card: React.FC<{ title: string; value: string; color: string; bgColor: string; accentColor: string }> = ({ title, value, color, bgColor, accentColor }) => {
  return (
    <div className={`${bgColor} rounded-xl p-4 shadow-lg border-l-4 ${accentColor} border-t border-r border-b border-gray-700/30 flex flex-col justify-between min-h-[100px] relative overflow-hidden`}>
      <div className={`text-sm font-medium ${color} mb-2 opacity-90`}>{title}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
      </div>
      {}
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 ${accentColor.replace('border-', 'bg-').replace('-500', '-500/20')} rounded-full blur-2xl`}></div>
    </div>
  );
};

export default function SummaryCards({ 
  totalInvestment, 
  currentValue, 
  totalGainLoss, 
  totalGain,
  totalLoss,
  totalRevenue,
  overallReturn, 
  isGain 
}: SummaryCardsProps) {
  const overallReturnStr = overallReturn.toFixed(2);

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <Card 
        title="Total Investment" 
        value={`₹${totalInvestment.toLocaleString('en-IN')}`} 
        color="text-purple-300" 
        bgColor="bg-gradient-to-br from-purple-900/50 to-purple-800/30"
        accentColor="border-purple-500"
      />
      <Card 
        title="Total Revenue" 
        value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
        color="text-blue-300" 
        bgColor="bg-gradient-to-br from-blue-900/50 to-blue-800/30"
        accentColor="border-blue-500"
      />
      <Card 
        title="Total Profit" 
        value={`+₹${totalGain.toLocaleString('en-IN')}`} 
        color="text-green-300" 
        bgColor="bg-gradient-to-br from-green-900/50 to-green-800/30"
        accentColor="border-green-500"
      />
      <Card 
        title="Total Loss" 
        value={`-₹${totalLoss.toLocaleString('en-IN')}`} 
        color="text-red-300" 
        bgColor="bg-gradient-to-br from-red-900/50 to-red-800/30"
        accentColor="border-red-500"
      />
      <Card 
        title="Overall Return %" 
        value={`${overallReturn >= 0 ? '+' : ''}${overallReturnStr}%`} 
        color={isGain ? "text-emerald-300" : "text-orange-300"} 
        bgColor={isGain ? "bg-gradient-to-br from-emerald-900/50 to-emerald-800/30" : "bg-gradient-to-br from-orange-900/50 to-orange-800/30"}
        accentColor={isGain ? "border-emerald-500" : "border-orange-500"}
      />
    </div>
  );
};