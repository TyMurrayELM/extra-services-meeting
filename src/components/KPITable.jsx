import React, { useMemo } from 'react';
import { Info, CheckCircle2, Check, Clock, RefreshCw, BookOpen, AlertTriangle, AlertOctagon, ExternalLink } from 'lucide-react';
import RichTextActions from './RichTextActions';

// Reusable info tooltip
const InfoTooltip = ({ text }) => (
  <div className="relative group">
    <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 cursor-help transition-colors" aria-label="Help" />
    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 leading-relaxed">
      {text}
      <div className="absolute left-3 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const STATUS_CONFIG = {
  'all-good':      { icon: CheckCircle2, label: 'All Good',      color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-300' },
  'on-track':      { icon: Check,        label: 'On Track',      color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-300' },
  'resolving':     { icon: Clock,        label: 'Resolving',     color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  'in-progress':   { icon: RefreshCw,    label: 'In Progress',   color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-300' },
  'in-training':   { icon: BookOpen,     label: 'In Training',   color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-300' },
  'off-track':     { icon: AlertTriangle,label: 'Off Track',     color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-300' },
  'serious-issue': { icon: AlertOctagon, label: 'Serious Issue', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-400' },
};

const CATEGORY_CONFIG = {
  'Financial - Revenue': {
    bg: 'bg-emerald-50/60',
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    objective: 'Increase profitability',
  },
  'Financial': {
    bg: 'bg-emerald-50/60',
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    objective: 'Increase profitability',
  },
  'Client': {
    bg: 'bg-blue-50/60',
    border: 'border-l-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    objective: 'Retain Client Business',
  },
  'Internal': {
    bg: 'bg-violet-50/60',
    border: 'border-l-violet-500',
    badge: 'bg-violet-100 text-violet-700',
    objective: 'Build quality into operational processes',
  },
  'People, Learning & Growth': {
    bg: 'bg-amber-50/60',
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    objective: 'Increase employee retention, Upskill employees and Develop our safety culture',
  },
};

const KPI_LINKS = {
  'Revenue vs. Goal': 'https://lookerstudio.google.com/u/0/reporting/2a7279f7-4e0a-4a51-a24a-1fe66fa70ae3/page/p_8id7wsettc?params=%7B%22df368%22:%22ORexclude%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580Maint%25EE%2580%2580Maint%2520Onsite%25EE%2580%2581include%25EE%2580%25803%25EE%2580%2580NU%25EE%2580%2582%22%7D',
  'Sales vs. Goal': 'https://lookerstudio.google.com/u/0/reporting/2a7279f7-4e0a-4a51-a24a-1fe66fa70ae3/page/p_uybn8k00sc',
  'Proposed vs. Goal': 'https://lookerstudio.google.com/u/0/reporting/2a7279f7-4e0a-4a51-a24a-1fe66fa70ae3/page/p_uybn8k00sc',
  'Gross Margin': 'https://manage.encorelm.com/crm/opportunities?job_status_name=Complete',
  'Backlog': 'https://manage.encorelm.com/crm/opportunities?opportunity_status_name=Won&job_status_name=In+Production',
  'Open Opportunities': 'https://manage.encorelm.com/crm/opportunities?opportunity_status_name=Won&job_status_name=In+Production',
  'Fleet': 'https://manage.encorelm.com/service_requests',
  'Equipment': 'https://manage.encorelm.com/service_requests',
};

// KPIs with department-specific links
const FORECAST_LINKS = {
  'spray': 'https://direct-labor-calculator.vercel.app/forecast/spray',
  'arbor': 'https://direct-labor-calculator.vercel.app/forecast/arbor',
  'enhancements': 'https://direct-labor-calculator.vercel.app/forecast/enhancements',
};

const KPI_DEPT_LINKS = {
  'Required FTEs to Hit Goal': FORECAST_LINKS,
  'Hours Efficiency Metric': FORECAST_LINKS,
};

// KPIs that show a Slack icon instead of an external link
const SLACK_KPIS = new Set(['OT %', 'Proposal Targets and Deadlines being Met', 'Follow up on Proposals']);

// Slack logo SVG component
const SlackIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.52zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/>
  </svg>
);

const KPI_TOOLTIPS = {
  'Hours Efficiency Metric': 'Based on hours worked, how close is revenue to our hourly rate x hours worked?',
  'Gross Margin': 'Can be found on Encore Dashboard when filtered on Region & Department. Can be found in Manage \u2192 Master Opportunities Tracker \u2192 Completed Jobs.',
  'Hiring Needs': 'Target headcount for this department to hit revenue goals',
};

// Format a numeric string with commas (e.g. "400000" -> "400,000")
const formatWithCommas = (val) => {
  if (!val) return '';
  const stripped = String(val).replace(/[^0-9.-]/g, '');
  if (!stripped) return val;
  const num = parseFloat(stripped);
  if (isNaN(num)) return val;
  return num.toLocaleString('en-US');
};

// Strip commas so we store raw numbers in the DB
const stripCommas = (val) => String(val).replace(/,/g, '');

// KPIs whose delta should be formatted as dollars
const DOLLAR_KPIS = new Set(['Revenue vs. Goal', 'Sales vs. Goal', 'Proposed vs. Goal']);

// Compute delta between target and actual, handling %, $, and plain numbers
const computeDelta = (target, actual, kpiName) => {
  if (!target || !actual) return null;

  const parse = (val) => {
    const cleaned = String(val).replace(/[$,%\s,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const t = parse(target);
  const a = parse(actual);
  if (t === null || a === null) return null;

  const diff = a - t;
  const isPercent = String(target).includes('%') || String(actual).includes('%');
  const isDollar = DOLLAR_KPIS.has(kpiName) || String(target).includes('$') || String(actual).includes('$');

  let formatted;
  const absFormatted = Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (isPercent) {
    formatted = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  } else if (isDollar) {
    formatted = diff >= 0 ? `+$${absFormatted}` : `-$${absFormatted}`;
  } else {
    formatted = `${diff >= 0 ? '+' : ''}${diff % 1 === 0 ? diff : diff.toFixed(1)}`;
  }

  return { value: diff, formatted };
};

// Calculate month progress as a fraction (0-1) based on business days elapsed
const useMonthProgress = () => {
  return useMemo(() => {
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

    const total = getBusinessDays(startOfMonth, endOfMonth);
    const completed = getBusinessDays(startOfMonth, yesterday);
    return completed / total;
  }, []);
};

// Project the run-rate final value: actual / monthProgress
const computeProjection = (actual, target, monthProgress) => {
  if (!actual || monthProgress <= 0) return null;
  const parsedActual = parseFloat(String(actual).replace(/[$,%\s,]/g, ''));
  if (isNaN(parsedActual) || parsedActual === 0) return null;
  const projected = Math.round(parsedActual / monthProgress);
  const formatted = `$${projected.toLocaleString('en-US')}`;

  const parsedTarget = target ? parseFloat(String(target).replace(/[$,%\s,]/g, '')) : null;
  let gap = null;
  if (parsedTarget && !isNaN(parsedTarget)) {
    const diff = projected - parsedTarget;
    const absFmt = `$${Math.abs(diff).toLocaleString('en-US')}`;
    gap = {
      value: diff,
      formatted: diff >= 0 ? `+${absFmt} over` : `-${absFmt} short`,
    };
  }

  return { formatted, gap };
};

const KPITable = ({
  loading,
  metricsData,
  departmentId,
  handleActualChange,
  handleStatusChange,
  handleActionsChange,
  handleTargetChange,
}) => {
  const monthProgress = useMonthProgress();

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200/80 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-white tracking-tight">Strategic Objectives & KPIs</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-44">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-52">KPI</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-36">Target</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-36">Actual</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-black uppercase tracking-wider w-24">Delta</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-44">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions & Deadlines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-black">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : metricsData.map((metric, mIndex) => {
              const config = CATEGORY_CONFIG[metric.category] || {
                bg: 'bg-white',
                border: 'border-l-gray-300',
                badge: 'bg-gray-100 text-black',
                objective: '',
              };

              return metric.kpis.map((kpi, kIndex) => {
                const statusCfg = STATUS_CONFIG[kpi.status];
                const StatusIcon = statusCfg?.icon;
                const delta = computeDelta(kpi.target, kpi.actual, kpi.name);

                // Resolve link: static or department-specific
                const kpiLink = KPI_LINKS[kpi.name] || KPI_DEPT_LINKS[kpi.name]?.[departmentId] || null;
                const isSlackKpi = SLACK_KPIS.has(kpi.name);
                const hasIcon = kpiLink || isSlackKpi;

                // Look up Required FTEs data for reference in Hiring Needs row
                const requiredFtes = kpi.name === 'Hiring Needs'
                  ? metricsData.flatMap(m => m.kpis).find(k => k.name === 'Required FTEs to Hit Goal')
                  : null;

                return (
                  <tr
                    key={`${mIndex}-${kIndex}`}
                    className={`${config.bg} border-l-4 ${config.border} hover:bg-white/80 transition-colors`}
                  >
                    {/* Category */}
                    <td className="px-5 py-3.5 align-top">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${config.badge}`}>
                        {metric.category}
                      </span>
                      {config.objective && (
                        <p className="text-[11px] text-black mt-1.5 leading-snug pr-2">
                          {config.objective}
                        </p>
                      )}
                    </td>

                    {/* KPI Name */}
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-black">{kpi.name}</span>
                        {KPI_TOOLTIPS[kpi.name] && (
                          <InfoTooltip text={KPI_TOOLTIPS[kpi.name]} />
                        )}
                      </div>
                      {kpi.explanation && (
                        <p className="text-[11px] text-black mt-1 leading-snug pr-2">
                          {kpi.explanation}
                        </p>
                      )}
                    </td>

                    {/* Target */}
                    <td className="px-5 py-3.5 align-top">
                      {kpi.name === 'Proposal Targets and Deadlines being Met' ? (
                        <div>
                          <div className="text-[10px] font-semibold text-black text-center mb-1"># Late</div>
                          <span className="block text-sm font-medium text-black text-center">0</span>
                        </div>
                      ) : kpi.name === 'Follow up on Proposals' ? (
                        <div>
                          <div className="text-[10px] font-semibold text-black text-center mb-1"># without Follow-up</div>
                          <span className="block text-sm font-medium text-black text-center">0</span>
                        </div>
                      ) : kpi.name === 'Open Opportunities' ? (
                        <div>
                          <div className="text-[10px] font-semibold text-black text-center mb-1"># over 60 days</div>
                          <span className="block text-sm font-medium text-black text-center">0</span>
                        </div>
                      ) : kpi.name === 'Fleet' || kpi.name === 'Equipment' ? (
                        <span></span>
                      ) : kpi.name === 'Daily Safety Talks' ? (
                        <span className="text-sm font-medium text-black">Daily</span>
                      ) : DOLLAR_KPIS.has(kpi.name) ? (
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black text-sm">$</span>
                          <input
                            type="text"
                            value={formatWithCommas(kpi.target)}
                            onChange={(e) => handleTargetChange(mIndex, kIndex, stripCommas(e.target.value))}
                            placeholder="0"
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-black rounded-lg text-sm text-center
                              hover:border-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                          />
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            value={kpi.target || ''}
                            onChange={(e) => handleTargetChange(mIndex, kIndex, e.target.value)}
                            placeholder="-"
                            className="w-full px-2 py-1.5 bg-white border border-black rounded-lg text-sm text-center
                              hover:border-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                          />
                          {requiredFtes && (
                            <div className="mt-1.5 text-[10px] text-black text-center leading-tight">
                              <span className="font-medium">Req. FTEs:</span> <span className="font-semibold text-black">{requiredFtes.target || '-'}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actual */}
                    <td className="px-5 py-3.5 align-top">
                      <div className={hasIcon ? 'flex items-start gap-1.5' : ''}>
                      <div className="flex-1">
                      {kpi.name === 'Daily Safety Talks' ? (
                        <select
                          value={kpi.actual || ''}
                          onChange={(e) => handleActualChange(mIndex, kIndex, e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-black rounded-lg text-sm text-center
                            hover:border-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : DOLLAR_KPIS.has(kpi.name) ? (
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black text-sm">$</span>
                          <input
                            type="text"
                            value={formatWithCommas(kpi.actual)}
                            onChange={(e) => handleActualChange(mIndex, kIndex, stripCommas(e.target.value))}
                            placeholder="0"
                            className="w-full pl-6 pr-2 py-1.5 bg-white border border-black rounded-lg text-sm text-center
                              hover:border-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                          />
                        </div>
                      ) : (
                        <div>
                          {kpi.name === 'Proposal Targets and Deadlines being Met' && (
                            <div className="text-[10px] font-semibold text-black text-center mb-1"># Late</div>
                          )}
                          {kpi.name === 'Follow up on Proposals' && (
                            <div className="text-[10px] font-semibold text-black text-center mb-1"># without Follow-up</div>
                          )}
                          {kpi.name === 'Open Opportunities' && (
                            <div className="text-[10px] font-semibold text-black text-center mb-1"># over 60 days</div>
                          )}
                          {kpi.name === 'Fleet' && (
                            <div className="text-[10px] font-semibold text-black text-center mb-1">Open Fleet Repair/Maintenance Service Requests</div>
                          )}
                          {kpi.name === 'Equipment' && (
                            <div className="text-[10px] font-semibold text-black text-center mb-1">Open Equipment Repair/Maintenance Service Requests</div>
                          )}
                          <input
                            type="text"
                            value={kpi.actual || ''}
                            onChange={(e) => handleActualChange(mIndex, kIndex, e.target.value)}
                            placeholder="..."
                            className="w-full px-2 py-1.5 bg-white border border-black rounded-lg text-sm text-center
                              hover:border-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                          />
                          {requiredFtes && (
                            <div className="mt-1.5 text-[10px] text-black text-center leading-tight">
                              <span className="font-medium">Req. FTEs:</span> <span className="font-semibold text-black">{requiredFtes.actual || '-'}</span>
                            </div>
                          )}
                        </div>
                      )}
                      </div>
                      {kpiLink && (
                        <a
                          href={kpiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
                          title="Open data source"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {isSlackKpi && !kpiLink && (
                        <div className="mt-2 text-[#4A154B] flex-shrink-0" title="Can be found in Slack">
                          <SlackIcon className="w-4 h-4" />
                        </div>
                      )}
                      </div>
                    </td>

                    {/* Delta */}
                    <td className="px-5 py-3.5 align-top text-center">
                      {delta ? (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          delta.value > 0 ? 'bg-green-100 text-green-700' :
                          delta.value < 0 ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-black'
                        }`}>
                          {delta.formatted}
                        </span>
                      ) : (
                        <span className="text-xs text-black">-</span>
                      )}
                      {kpi.name === 'Backlog' && delta && delta.value > 0 && (
                        <div className="mt-1 text-[10px] font-semibold text-red-600">Understaffed</div>
                      )}
                      {DOLLAR_KPIS.has(kpi.name) && (() => {
                        const projection = computeProjection(kpi.actual, kpi.target, monthProgress);
                        if (!projection) return null;
                        return (
                          <>
                            <div className="mt-1.5 text-[10px] text-black leading-tight">
                              <span className="font-medium text-black">Proj:</span>{' '}
                              <span className="font-semibold text-black">{projection.formatted}</span>
                            </div>
                            {projection.gap && (
                              <div className={`mt-0.5 text-[10px] font-semibold leading-tight ${
                                projection.gap.value >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {projection.gap.formatted}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 align-top">
                      <div className="space-y-1.5">
                        <select
                          value={kpi.status}
                          onChange={(e) => handleStatusChange(mIndex, kIndex, e.target.value)}
                          className={`w-full px-3 py-1.5 border rounded-lg bg-white text-sm appearance-none cursor-pointer
                            hover:border-black focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all
                            ${statusCfg ? `${statusCfg.border} ${statusCfg.bg}` : 'border-black'}
                            ${kpi.status === 'serious-issue' ? 'animate-pulse' : ''}`}
                        >
                          <option value="">Select status...</option>
                          {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                            <option key={value} value={value}>{cfg.label}</option>
                          ))}
                        </select>
                        {statusCfg && (
                          <div className={`flex items-center gap-1.5 px-1 ${statusCfg.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{statusCfg.label}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions & Deadlines */}
                    <td className="px-5 py-3.5">
                      <RichTextActions
                        value={kpi.actions || ''}
                        onChange={(e) => handleActionsChange(mIndex, kIndex, e.target.value)}
                        placeholder="Enter actions & deadlines..."
                      />
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KPITable;
