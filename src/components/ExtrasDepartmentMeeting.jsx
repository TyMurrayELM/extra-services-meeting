import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Check, AlertTriangle, Timer, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import _ from 'lodash';
// Department icon imports
import sprayIcon from '../assets/icons/spray.png';
import arborIcon from '../assets/icons/arbor.png';
import enhancementsIcon from '../assets/icons/enhancements.png';
const azIcon = new URL('../assets/icons/az.png', import.meta.url).href;
const lvIcon = new URL('../assets/icons/lv.png', import.meta.url).href;

import MonthProgress from './MonthProgress';
import MeetingGuide from './MeetingGuide';
import KPITable from './KPITable';

const MEETING_TYPE = 'extras-meeting';

// Department and region-specific OT % targets
const OT_TARGETS = {
  'phoenix': {
    'spray': '< 5%',
    'arbor': '< 5%',
    'enhancements': '< 0.5%'
  },
  'lasvegas': {
    'spray': '0%',
    'arbor': '< 1%',
    'enhancements': '0%'
  }
};

// Department and region-specific headcount targets
const HEADCOUNT_TARGETS = {
  'phoenix': {
    'spray': '3',
    'arbor': '23',
    'enhancements': '10'
  },
  'lasvegas': {
    'spray': '1',
    'arbor': '6',
    'enhancements': '3'
  }
};

// Format a date value as 'YYYY-MM-DD' for Supabase queries
const formatDateForDB = (date) => new Date(date).toISOString().split('T')[0];

// Immutably update a single field on a KPI within the metrics array
const updateKpiField = (metrics, mIndex, kIndex, field, value) =>
  metrics.map((metric, i) =>
    i !== mIndex
      ? metric
      : {
          ...metric,
          kpis: metric.kpis.map((kpi, j) =>
            j !== kIndex ? kpi : { ...kpi, [field]: value }
          ),
        }
  );

const CATEGORY_ORDER = {
  'Financial': 1,
  'Client': 2,
  'Internal': 3,
  'People, Learning & Growth': 4
};

const sortByCategory = (a, b) => (CATEGORY_ORDER[a.category] || 999) - (CATEGORY_ORDER[b.category] || 999);

const BranchManagerMeeting = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentBooks, setCurrentBooks] = useState([]);
  const [facilitator, setFacilitator] = useState('');
  const agaveLogo = new URL('../assets/logos/agave.png', import.meta.url).href;
  const [selectedRegion, setSelectedRegion] = useState('phoenix');

  const fetchMeetingMetadata = async (date) => {
    try {
      const formattedDate = formatDateForDB(date);

      const { data, error } = await supabase
        .from('meeting_metadata')
        .select('*')
        .eq('meeting_type', MEETING_TYPE)
        .eq('meeting_date', formattedDate)
        .maybeSingle();

      if (error) {
        console.error('Error fetching metadata:', error);
        return;
      }

      if (data) {
        setCurrentBooks(data.current_books || []);
        setFacilitator(data.facilitator || '');
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('meeting_metadata')
          .insert({
            meeting_type: MEETING_TYPE,
            meeting_date: formattedDate,
            current_books: meetingData.currentBooks,
            facilitator: '',
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        if (newData) {
          setCurrentBooks(newData.current_books || []);
          setFacilitator(newData.facilitator || '');
        }
      }
    } catch (err) {
      console.error('Error in fetchMeetingMetadata:', err);
    }
  };

  const handleFacilitatorChange = async (newValue) => {
    try {
      // First check if record exists
      const { data: existingData, error: fetchError } = await supabase
        .from('meeting_metadata')
        .select('*')
        .eq('meeting_type', MEETING_TYPE)
        .eq('meeting_date', formatDateForDB(selectedDate))
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const { error } = await supabase
        .from('meeting_metadata')
        .upsert({
          id: existingData?.id,
          meeting_type: MEETING_TYPE,
          meeting_date: formatDateForDB(selectedDate),
          facilitator: newValue,
          current_books: currentBooks || [],
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setFacilitator(newValue);
    } catch (err) {
      console.error('Error updating facilitator:', err);
    }
  };

  const handleBookChange = async (index, newValue) => {
    if (process.env.NODE_ENV === 'development') {
      const newBooks = [...currentBooks];
      newBooks[index] = newValue;
      setCurrentBooks(newBooks);
      return;
    }

    try {
      const newBooks = [...currentBooks];
      newBooks[index] = newValue;

      const { error } = await supabase
        .from('meeting_metadata')
        .upsert({
          meeting_type: MEETING_TYPE,
          meeting_date: formatDateForDB(selectedDate),
          current_books: newBooks,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setCurrentBooks(newBooks);
    } catch (err) {
      console.error('Error updating books:', err);
    }
  };

  const handleAddBook = async () => {
    if (process.env.NODE_ENV === 'development') {
      const newBooks = [...currentBooks, ''];
      setCurrentBooks(newBooks);
      return;
    }

    try {
      const newBooks = [...currentBooks, ''];

      const { error } = await supabase
        .from('meeting_metadata')
        .upsert({
          meeting_type: MEETING_TYPE,
          meeting_date: formatDateForDB(selectedDate),
          current_books: newBooks,
          facilitator: facilitator,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setCurrentBooks(newBooks);
    } catch (err) {
      console.error('Error adding book:', err);
    }
  };

  const handleFileUpload = async (e) => {
    if (process.env.NODE_ENV === 'development') {
      const files = Array.from(e.target.files);
      setUploadedFiles(files.map(file => ({
        name: file.name,
        path: `${selectedDate}/${file.name}`
      })));
      return;
    }

    const files = Array.from(e.target.files);
    try {
      for (const file of files) {
        const filePath = `${selectedDate}/${file.name}`;

        const { data, error } = await supabase.storage
          .from('meeting-files')
          .upload(filePath, file);

        if (error) {
          console.error('Error uploading file:', error);
          return;
        }
      }
      await fetchFilesForDate(selectedDate);
    } catch (error) {
      console.error('Error in file upload:', error);
    }
  };

  const fetchFilesForDate = async (date) => {
    if (process.env.NODE_ENV === 'development') {
      setUploadedFiles([]);
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('meeting-files')
        .list(date);

      if (error) {
        console.error('Error fetching files:', error);
        return;
      }

      setUploadedFiles(data ? data.map(file => ({
        name: file.name,
        path: `${date}/${file.name}`
      })) : []);
    } catch (error) {
      console.error('Error in fetchFilesForDate:', error);
    }
  };

  const meetingData = {
    mission: "Uplifting & Enriching our people & the properties we maintain",
    currentBooks: ["Seven habits of highly effective people", "Raving fans"],
    metrics: [
      {
        category: 'Client',
        kpis: [
          {
            name: 'Proposal Targets and Deadlines being Met',
            explanation: 'Proposal Requests on time, budgeted effort proposed, proposal $\'s being met',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Follow up on Proposals',
            explanation: 'Follow-ups Scheduled for all proposals and proper pipeline management',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Execution, External and Completion Process Adherence',
            explanation: '',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Open Opportunities',
            explanation: 'Identify Long-aged Jobs that need addressing or statusing',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: '',
            explanation: '',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          }
        ]
      },
      {
        category: 'Financial',
        kpis: [
          {
            name: 'Revenue vs. Goal',
            explanation: 'Invoiced revenue which is directly driven by how much work has been completed over the course of the month ',
            target: '100%',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Sales vs. Goal',
            explanation: 'How well we are filling the backlog and getting new work approved',
            target: '100%',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Hours Efficiency Metric',
            explanation: 'How productive is the production team being?',
            target: '100%',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Gross Margin',
            explanation: 'How are we performing and estimating the work?',
            target: '70%',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Backlog',
            explanation: 'How far out are we scheduled at current crew sizing?',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'OT %',
            explanation: 'Overtime percentage - tracking overtime hours as a percentage of total hours worked',
            target: '< 10%',
            actual: '',
            status: '',
            actions: ''
          }
        ]
      },
      {
        category: 'Internal',
        kpis: [
          {
            name: 'Internal Process follow-through and Communication',
            explanation: 'Process follow through and game plan before job starts',
            target: '100% process following',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Fleet',
            explanation: 'Review vehicle and equipment needs or issues',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Equipment',
            explanation: '',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Daily Safety Talks',
            explanation: '',
            target: '-',
            actual: '',
            status: '',
            actions: ''
          }
        ]
      },
      {
        category: 'People, Learning & Growth',
        kpis: [
          {
            name: 'Hiring Needs',
            target: '-',
            explanation: 'Target headcount for this department to hit revenue goals',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Training & Development',
            target: '',
            explanation: 'Complete required training of the month',
            actual: '',
            status: '',
            actions: ''
          },
          {
            name: 'Employee Engagement',
            target: '',
            explanation: 'Recognize and appreciate employee contributions, achievements, milestones, and/or behaviors that support organizational goals and values',
            actual: '',
            status: '',
            actions: ''
          }
        ]
      }
    ].sort(sortByCategory)
  };

  const [selectedTab, setSelectedTab] = useState('guide');
  const [metricsData, setMetricsData] = useState(
    [...meetingData.metrics].sort(sortByCategory)
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const generateBiWeeklyWednesdays = () => {
    const dates = [];
    const startDate = new Date(2025, 1, 19);
    let currentDate = new Date(startDate);

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 2);

    while (currentDate < endDate) {
      if (currentDate.getDay() === 3) {
        dates.push(currentDate.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        }));
        currentDate.setDate(currentDate.getDate() + 14);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return dates;
  };

  const findNearestDate = (dates) => {
    const today = new Date();
    return dates.reduce((nearest, date) => {
      const current = new Date(date);
      const nearestDate = new Date(nearest);
      return Math.abs(current - today) < Math.abs(nearestDate - today) ? date : nearest;
    });
  };

  const dates = generateBiWeeklyWednesdays();
  const [selectedDate, setSelectedDate] = useState(findNearestDate(dates));

  const fetchKPIData = async (departmentId, date) => {
    try {
      const formattedDate = formatDateForDB(date);

      const { data, error } = await supabase
        .from('kpi_entries')
        .select('*')
        .eq('meeting_type', MEETING_TYPE)
        .eq('department_id', departmentId)
        .eq('region', selectedRegion)
        .eq('meeting_date', formattedDate);

      if (!data || data.length === 0) {
        const initialEntries = meetingData.metrics.flatMap(metric =>
          metric.kpis.map(kpi => {
            let target = kpi.target;
            if (kpi.name === 'OT %' && OT_TARGETS[selectedRegion]?.[departmentId]) {
              target = OT_TARGETS[selectedRegion][departmentId];
            }
            if (kpi.name === 'Hiring Needs' && HEADCOUNT_TARGETS[selectedRegion]?.[departmentId]) {
              target = HEADCOUNT_TARGETS[selectedRegion][departmentId];
            }

            return {
              meeting_type: MEETING_TYPE,
              department_id: departmentId,
              region: selectedRegion,
              meeting_date: formattedDate,
              category: metric.category,
              kpi_name: kpi.name,
              target: target,
              explanation: kpi.explanation || '',
              actual: '',
              status: 'in-progress',
              actions: ''
            };
          })
        );

        const { data: newData, error: insertError } = await supabase
          .from('kpi_entries')
          .insert(initialEntries)
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        return transformKPIData(newData);
      }

      return transformKPIData(data);

    } catch (err) {
      console.error('Error in fetchKPIData:', err);
      return meetingData.metrics;
    }
  };

  const transformKPIData = (data) => {
    const seen = new Set();

    const groupedData = data.reduce((acc, entry) => {
      const key = `${entry.category}-${entry.kpi_name}`;

      if (seen.has(key)) {
        return acc;
      }

      seen.add(key);

      if (!acc[entry.category]) {
        acc[entry.category] = { category: entry.category, kpis: [] };
      }

      const matchingMetric = meetingData.metrics.find(m => m.category === entry.category);
      const matchingKpi = matchingMetric?.kpis.find(k => k.name === entry.kpi_name);
      const explanation = matchingKpi?.explanation || entry.explanation || '';

      acc[entry.category].kpis.push({
        name: entry.kpi_name,
        target: entry.target || '',
        actual: entry.actual || '',
        status: entry.status || '',
        actions: entry.actions || '',
        explanation: explanation
      });
      return acc;
    }, {});

    Object.values(groupedData).forEach(group => {
      group.kpis.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
    });

    return Object.values(groupedData).sort(sortByCategory);
  };

  const addNewFinancialKPI = async (departmentId, date) => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kpi_entries')
        .select('*')
        .eq('meeting_type', MEETING_TYPE)
        .eq('department_id', departmentId)
        .eq('meeting_date', formatDateForDB(date))
        .eq('category', 'Financial')
        .eq('kpi_name', 'Maintenance Direct Labor Cost (DL%) - Onsites');

      if (error) throw error;

      if (data.length === 0) {
        const { error: insertError } = await supabase
          .from('kpi_entries')
          .insert({
            meeting_type: MEETING_TYPE,
            department_id: departmentId,
            meeting_date: formatDateForDB(date),
            category: 'Financial',
            kpi_name: 'Maintenance Direct Labor Cost (DL%) - Onsites',
            target: '55%',
            explanation: 'Direct labor costs as percentage of maintenance revenue',
            actual: '',
            status: 'in-progress',
            actions: ''
          });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error adding new Financial KPI:', err);
    }
  };

  useEffect(() => {
    if (selectedTab !== 'guide') {
      const init = async () => {
        setLoading(true);
        try {
          const formattedDate = formatDateForDB(selectedDate);

          const { data, error } = await supabase
            .from('kpi_entries')
            .select('*')
            .eq('meeting_type', MEETING_TYPE)
            .eq('department_id', selectedTab)
            .eq('region', selectedRegion)
            .eq('meeting_date', formattedDate);

          if (error) throw error;

          if (!data || data.length === 0) {
            const initialEntries = meetingData.metrics.flatMap(metric =>
              metric.kpis.filter(kpi => kpi.name).map(kpi => {
                let target = kpi.target;
                if (kpi.name === 'OT %' && OT_TARGETS[selectedRegion]?.[selectedTab]) {
                  target = OT_TARGETS[selectedRegion][selectedTab];
                }
                if (kpi.name === 'Hiring Needs' && HEADCOUNT_TARGETS[selectedRegion]?.[selectedTab]) {
                  target = HEADCOUNT_TARGETS[selectedRegion][selectedTab];
                }

                return {
                  meeting_type: MEETING_TYPE,
                  department_id: selectedTab,
                  region: selectedRegion,
                  meeting_date: formattedDate,
                  category: metric.category,
                  kpi_name: kpi.name,
                  target: target,
                  explanation: kpi.explanation || '',
                  actual: '',
                  status: 'in-progress',
                  actions: '',
                  updated_at: new Date().toISOString()
                };
              })
            );

            const { data: newData, error: insertError } = await supabase
              .from('kpi_entries')
              .insert(initialEntries)
              .select();

            if (insertError) throw insertError;

            setMetricsData(transformKPIData(newData));
          } else {
            setMetricsData(transformKPIData(data));
          }
        } catch (err) {
          console.error('Error:', err);
        }
        setLoading(false);
      };

      init();
    }
  }, [selectedTab, selectedDate, selectedRegion]);

  useEffect(() => {
    fetchFilesForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const handleTabClose = () => {
      supabase.auth.signOut();
    };

    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  useEffect(() => {
    fetchMeetingMetadata(selectedDate);
  }, [selectedDate]);

  const handleActualChange = async (mIndex, kIndex, newValue) => {
    const metric = metricsData[mIndex];
    const kpi = metric.kpis[kIndex];

    setMetricsData(prev => updateKpiField(prev, mIndex, kIndex, 'actual', newValue));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const formattedDate = formatDateForDB(selectedDate);

      const { error } = await supabase
        .from('kpi_entries')
        .update({
          actual: newValue,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('meeting_type', MEETING_TYPE)
        .eq('department_id', selectedTab)
        .eq('region', selectedRegion)
        .eq('meeting_date', formattedDate)
        .eq('category', metric.category)
        .eq('kpi_name', kpi.name);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error updating actual value:', err);
      setError(err.message);
    }
  };

  const handleStatusChange = async (mIndex, kIndex, newValue) => {
    setMetricsData(prev => updateKpiField(prev, mIndex, kIndex, 'status', newValue));

    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const metric = metricsData[mIndex];
    const kpi = metric.kpis[kIndex];

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('kpi_entries')
        .update({
          status: newValue,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('meeting_type', MEETING_TYPE)
        .eq('department_id', selectedTab)
        .eq('region', selectedRegion)
        .eq('meeting_date', formatDateForDB(selectedDate))
        .eq('category', metric.category)
        .eq('kpi_name', kpi.name);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const debouncedSaveActions = useMemo(
    () => _.debounce(async (newValue, departmentId, date, category, kpiName, region) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const formattedDate = formatDateForDB(date);

        const { error } = await supabase
          .from('kpi_entries')
          .update({
            actions: newValue,
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          })
          .eq('meeting_type', MEETING_TYPE)
          .eq('department_id', departmentId)
          .eq('region', region)
          .eq('meeting_date', formattedDate)
          .eq('category', category)
          .eq('kpi_name', kpiName);

        if (error) {
          console.error('Error saving actions:', error);
          throw error;
        }
      } catch (err) {
        console.error('Error in debouncedSaveActions:', err);
      }
    }, 1000),
    []
  );

  const handleActionsChange = (mIndex, kIndex, newValue) => {
    const metric = metricsData[mIndex];
    const kpi = metric.kpis[kIndex];

    setMetricsData(prev => updateKpiField(prev, mIndex, kIndex, 'actions', newValue));

    debouncedSaveActions(
      newValue,
      selectedTab,
      selectedDate,
      metric.category,
      kpi.name,
      selectedRegion
    );
  };

  const departments = [
    { id: 'spray', name: 'Spray', headerColor: 'bg-red-50', icon: sprayIcon },
    { id: 'arbor', name: 'Arbor', headerColor: 'bg-green-50', icon: arborIcon },
    { id: 'enhancements', name: 'Enhancements', headerColor: 'bg-purple-50', icon: enhancementsIcon }
  ];

  const tabOptions = [
    { id: 'guide', name: 'Meeting Guide' },
    ...departments
  ];

  return (
    <div className="bg-blue-50 min-h-screen w-full">
      <div className="container mx-auto p-4 space-y-4">

        {/* Week Selector and User Profile */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src={agaveLogo}
                alt="Agave Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold">Extra Services Meeting Agenda</h1>
            </div>

            {/* Region Toggle */}
            <div className="relative w-[200px] h-8">
              <div className="absolute inset-0 flex rounded-full bg-gray-200">
                <div
                  className={`absolute w-[100px] h-8 transition-transform duration-300 ease-in-out ${
                    selectedRegion === 'phoenix' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                >
                  <div className={`h-full w-full rounded-full shadow-md ${
                    selectedRegion === 'phoenix' ? 'bg-orange-600' : 'bg-yellow-600'
                  }`} />
                </div>
                <button
                  onClick={() => setSelectedRegion('phoenix')}
                  className={`relative z-10 flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                    selectedRegion === 'phoenix' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  Phoenix
                </button>
                <button
                  onClick={() => setSelectedRegion('lasvegas')}
                  className={`relative z-10 flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                    selectedRegion === 'lasvegas' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  Las Vegas
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* State Icon */}
            <img
              src={selectedRegion === 'phoenix' ? azIcon : lvIcon}
              alt={selectedRegion === 'phoenix' ? 'Arizona' : 'Las Vegas'}
              className="h-9 w-auto"
            />
            <MonthProgress />
            <div className="relative min-w-[200px]">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2.5 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              >
                {dates.map(date => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" fillRule="evenodd" d="M10 12l-5-5h10l-5 5z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1">
            {tabOptions.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  rounded-xl px-4 py-3 text-sm font-medium transition-all shadow-sm
                  flex items-center gap-2 justify-center
                  ${tab.id === 'spray' && 'bg-red-200 hover:bg-red-300'}
                  ${tab.id === 'spray' && '[&[data-state=active]]:bg-red-400 [&[data-state=active]]:text-white'}
                  ${tab.id === 'arbor' && 'bg-green-200 hover:bg-green-300'}
                  ${tab.id === 'arbor' && '[&[data-state=active]]:bg-green-400 [&[data-state=active]]:text-white'}
                  ${tab.id === 'enhancements' && 'bg-purple-200 hover:bg-purple-300'}
                  ${tab.id === 'enhancements' && '[&[data-state=active]]:bg-purple-400 [&[data-state=active]]:text-white'}
                  ${tab.id === 'guide' && 'bg-blue-200 hover:bg-blue-300'}
                  ${tab.id === 'guide' && '[&[data-state=active]]:bg-blue-600 [&[data-state=active]]:text-white'}
                `}
              >
                {tab.id !== 'guide' && (
                  <img src={tab.icon} alt={tab.name} className="w-6 h-6" />
                )}
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Meeting Guide Tab */}
          <TabsContent value="guide">
            <MeetingGuide
              meetingData={meetingData}
              currentBooks={currentBooks}
              setCurrentBooks={setCurrentBooks}
              handleBookChange={handleBookChange}
              handleAddBook={handleAddBook}
              facilitator={facilitator}
              setFacilitator={setFacilitator}
              handleFacilitatorChange={handleFacilitatorChange}
              uploadedFiles={uploadedFiles}
              handleFileUpload={handleFileUpload}
              selectedDate={selectedDate}
            />
          </TabsContent>

          {/* Department Tabs */}
          {departments.map(department => (
            <TabsContent key={department.id} value={department.id} className="space-y-4 mt-6">
              <KPITable
                loading={loading}
                metricsData={metricsData}
                handleActualChange={handleActualChange}
                handleStatusChange={handleStatusChange}
                handleActionsChange={handleActionsChange}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default BranchManagerMeeting;
