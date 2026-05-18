import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { getReportSummary, getReportPerformance, getReportProductivity, getReportPriorities, getReportActivity } from '../services/api';
import { 
  BookOpen, CheckSquare, Clock, Users, Activity, Sparkles, 
  Loader2, AlertCircle, TrendingUp, ArrowUpRight, Zap, Target
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-all hover:shadow-md group">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20 shrink-0 transition-transform group-hover:scale-110`}>
        <Icon className={`w-4 h-4 ${colorClass.replace('bg-', 'text-')} dark:text-opacity-90`} />
      </div>
      {trend && (
        <div className="flex items-center text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
          <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{title}</p>
      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
    </div>
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [productivity, setProductivity] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [sumRes, perfRes, prodRes, prioRes, actRes] = await Promise.all([
          getReportSummary(),
          getReportPerformance(),
          getReportProductivity(),
          getReportPriorities(),
          getReportActivity()
        ]);

        setSummary(sumRes.data);
        setPerformance(perfRes.data);
        setProductivity(prodRes.data);
        setPriorities(prioRes.data);
        setActivity(actRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Analyzing Data...</p>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center mt-6 flex flex-col items-center p-6 bg-red-50 dark:bg-red-900/10 rounded-xl max-w-md mx-auto">
      <AlertCircle className="w-10 h-10 mb-3" />
      <h3 className="text-base font-bold mb-1">Sync Interrupted</h3>
      <p className="text-xs opacity-80">{error}</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* Premium Header Banner - More Compact */}
      <div className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest mb-1">
              <Sparkles className="w-2.5 h-2.5 mr-1" /> Intelligence Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Productivity <span className="text-indigo-200">Pulse</span>
            </h1>
            <p className="text-indigo-100/80 text-xs sm:text-sm max-w-sm font-medium leading-relaxed">
              Workflow accelerating. {summary?.completedTasks || 0} tasks done with a {Math.round((summary?.completedTasks / summary?.totalTasks) * 100) || 0}% efficiency rate.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center min-w-[80px]">
              <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Focus Score</p>
              <p className="text-lg font-black">84</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-center min-w-[80px]">
              <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Top Goal</p>
              <p className="text-xs font-black truncate max-w-[100px]">{performance?.todayData?.[0]?.name || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - More Compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Total Tasks" value={summary?.totalTasks} icon={CheckSquare} colorClass="bg-indigo-500" trend="+12%" />
        <StatCard title="Notes" value={summary?.totalNotes} icon={BookOpen} colorClass="bg-blue-500" />
        <StatCard title="Finished" value={summary?.completedTasks} icon={CheckSquare} colorClass="bg-emerald-500" trend="+8%" />
        <StatCard title="Pending" value={summary?.pendingTasks} icon={Clock} colorClass="bg-amber-500" />
        <StatCard title="Overdue" value={summary?.overdueTasks} icon={AlertCircle} colorClass="bg-rose-500" />
        <StatCard title="Users" value={summary?.activeUsers} icon={Users} colorClass="bg-purple-500" />
      </div>

      {/* Row 2: Charts - More Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" /> Performance Velocity
              </h3>
            </div>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg uppercase tracking-wider">
              Last 7 Days
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance?.todayData || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={8}
                />
                <YAxis hide />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <h3 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2 text-rose-500" /> Strategic Split
          </h3>
          <div className="flex-1 flex flex-col justify-center relative">
             <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorities}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {priorities.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{priorities.reduce((acc, curr) => acc + curr.value, 0)}</p>
             </div>
             <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                {priorities.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase truncate">{p.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Row 3: Leaderboard & Activity - More Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white">Group Leaderboard</h3>
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </div>
          <div className="space-y-4">
            {productivity.map((user, idx) => (
              <div key={idx} className="group/item">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-lg object-cover" 
                    />
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.completed} Done</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{user.completionPercentage}%</p>
                </div>
                <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${user.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-[380px]">
          <h3 className="text-base font-black text-gray-900 dark:text-white mb-4">Intelligence Stream</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 hide-scrollbar">
            {activity.map((act, i) => (
              <div key={i} className="flex relative items-start gap-3">
                {i !== activity.length - 1 && (
                  <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-gray-50 dark:bg-gray-800 -ml-px"></div>
                )}
                <div className="relative shrink-0 w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-500">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-3 border border-transparent">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">{act.message}</p>
                  <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5 opacity-60">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
