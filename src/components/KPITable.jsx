import React from 'react';
import { Info } from 'lucide-react';
import RichTextActions from './RichTextActions';

// Reusable info tooltip
const InfoTooltip = ({ text }) => (
  <div className="relative group">
    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" aria-label="Help" />
    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-20">
      {text}
      <div className="absolute left-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const CATEGORY_COLORS = {
  'Client': 'bg-blue-50',
  'Financial': 'bg-green-50',
  'Internal': 'bg-purple-50',
  'People, Learning & Growth': 'bg-orange-50',
};

const STRATEGIC_OBJECTIVES = {
  'Financial': 'Strategic Objective: Increase profitability',
  'Client': 'Strategic Objective: Retain Client Business',
  'Internal': 'Strategic Objective: Build quality into operational processes',
  'People, Learning & Growth': 'Strategic Objective: Increase employee retention, Upskill employees and Develop our safety culture',
};

const KPI_TOOLTIPS = {
  'Hours Efficiency Metric': 'Based on hours worked, how close is revenue to our hourly rate x hours worked?',
  'Gross Margin': 'Can be found on Encore Dashboard when filtered on Region & Department. Can be found in Manage → Master Opportunities Tracker → Completed Jobs.',
  'Hiring Needs': 'Target headcount for this department to hit revenue goals',
};

const KPITable = ({
  loading,
  metricsData,
  handleActualChange,
  handleStatusChange,
  handleActionsChange,
}) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-blue-900 p-4">
        <h2 className="text-lg font-semibold text-white">Strategic Objectives & KPIs</h2>
      </div>
      <div className="bg-white p-4">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left font-semibold w-40">Category</th>
                <th className="px-4 py-2 text-left font-semibold w-48">KPI</th>
                <th className="px-4 py-2 text-left font-semibold w-32">Target</th>
                <th className="px-4 py-2 text-left font-semibold w-32">Actual</th>
                <th className="px-4 py-2 text-left font-semibold w-48">Status</th>
                <th className="px-4 py-2 text-left font-semibold flex-1">Actions & Deadlines</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : metricsData.map((metric, mIndex) => (
                metric.kpis.map((kpi, kIndex) => (
                  <tr
                    key={`${mIndex}-${kIndex}`}
                    className={`border-b border-gray-100 ${CATEGORY_COLORS[metric.category] || 'bg-white'}`}
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium">{metric.category}</div>
                      {STRATEGIC_OBJECTIVES[metric.category] && (
                        <div className="text-xs text-gray-500 mt-1 pr-2">
                          {STRATEGIC_OBJECTIVES[metric.category]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium flex items-center gap-1">
                        {kpi.name}
                        {KPI_TOOLTIPS[kpi.name] && (
                          <InfoTooltip text={KPI_TOOLTIPS[kpi.name]} />
                        )}
                      </div>
                      {kpi.explanation && (
                        <div className="text-xs text-gray-500 mt-1 pr-2">
                          {kpi.explanation}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">{kpi.target || '-'}</td>
                    <td className="px-1 py-2 w-12 align-top">
                      <input
                        type="text"
                        value={kpi.actual || ''}
                        onChange={(e) => handleActualChange(mIndex, kIndex, e.target.value)}
                        placeholder="..."
                        className="w-full px-1 py-1 bg-white border border-black rounded-md hover:bg-gray-50 focus:bg-white focus:border-2 focus:border-black focus:outline-none text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <select
                        value={kpi.status}
                        onChange={(e) => handleStatusChange(mIndex, kIndex, e.target.value)}
                        className={`flex items-center w-full px-3 py-2 border rounded-md bg-white ${
                          kpi.status === 'serious-issue' ? 'border-red-700 bg-red-50 animate-pulse' :
                          kpi.status === 'off-track' ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="">Select a status...</option>
                        <option value="all-good">👍 All Good</option>
                        <option value="on-track">✅ On Track</option>
                        <option value="resolving">⏳ Resolving</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="in-training">📚 In Training</option>
                        <option value="off-track">⚠️ Off Track</option>
                        <option value="serious-issue">🚨 Serious Issue</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <RichTextActions
                        value={kpi.actions || ''}
                        onChange={(e) => handleActionsChange(mIndex, kIndex, e.target.value)}
                        placeholder="Enter actions & deadlines..."
                      />
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KPITable;
