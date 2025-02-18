// src/components/MonthProgress.jsx
import React, { useMemo } from 'react';

const MonthProgress = () => {
  const calculateProgress = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfMonth = new Date(yesterday.getFullYear(), yesterday.getMonth(), 1);
    const endOfMonth = new Date(yesterday.getFullYear(), yesterday.getMonth() + 1, 0);
    
    const getBusinessDays = (start, end) => {
      let count = 0;
      const current = new Date(start);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    };
    
    const totalBusinessDays = getBusinessDays(startOfMonth, endOfMonth);
    const completedBusinessDays = getBusinessDays(startOfMonth, yesterday);
    const percentage = Math.round((completedBusinessDays / totalBusinessDays) * 100);
    
    return {
      percentage,
      completedBusinessDays,
      totalBusinessDays
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-gray-600">Month Progress</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-blue-600">{calculateProgress.percentage}%</span>
          <span className="text-xs text-gray-500">
            ({calculateProgress.completedBusinessDays}/{calculateProgress.totalBusinessDays} days)
          </span>
        </div>
      </div>
      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${calculateProgress.percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MonthProgress;