import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { getReportSummary, getReportPerformance, getReportProductivity, getReportPriorities, getReportActivity } from '../services/api';
import { BookOpen, CheckSquare, Clock, Users, Activity, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-2 sm:space-x-3 transition-colors">
    <div className={`p-1.5 sm:p-2 rounded-full ${colorClass} bg-opacity-10 dark:bg-opacity-20 shrink-0`}>
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass.replace('bg-', 'text-')} dark:text-opacity-90`} />
    </div>
    <div className='flex items-center justify-between w-full'>
      <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
      <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
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

  if (loading) return <div className="flex justify-center items-center h-full mt-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (error) return <div className="text-red-500 text-center mt-10 flex flex-col items-center"><AlertCircle className="w-10 h-10 mb-2" />{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center transition-colors">
        <Activity className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" /> Analytics Dashboard
      </h1>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Summary Cards (Moved to 3rd Column) */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 lg:col-span-1 content-start">
            <StatCard title="Notes" value={summary.totalNotes} icon={BookOpen} colorClass="bg-blue-500 text-blue-600" />
            <StatCard title="Tasks" value={summary.totalTasks} icon={CheckSquare} colorClass="bg-indigo-500 text-indigo-600" />
            <StatCard title="Done" value={summary.completedTasks} icon={CheckSquare} colorClass="bg-green-500 text-green-600" />
            <StatCard title="Pending" value={summary.pendingTasks} icon={Clock} colorClass="bg-yellow-500 text-yellow-600" />
            <StatCard title="Overdue" value={summary.overdueTasks} icon={AlertCircle} colorClass="bg-red-500 text-red-600" />
            <StatCard title="Users" value={summary.activeUsers} icon={Users} colorClass="bg-purple-500 text-purple-600" />
          </div>
        )}
        
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">

          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors">
            Today’s Progress
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>

              <BarChart
                data={performance?.todayData || []}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />

                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />

              </BarChart>

            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors">Priority Distribution</h3>
          <div className="h-72 flex justify-center items-center">
            {priorities.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No priority data</p> : (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={priorities}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* User Productivity Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 overflow-hidden flex flex-col h-[400px] transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Group Productivity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Member</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3 rounded-tr-lg">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {productivity.map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Avatar" className="w-6 h-6 rounded-full mr-2" />
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.totalAssigned}</td>
                    <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{user.completed}</td>
                    <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400 font-medium">{user.pending}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-700 dark:text-gray-300 w-10">{user.completionPercentage}%</span>
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full ml-2">
                          <div className="h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: `${user.completionPercentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {productivity.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No tasks assigned yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-[400px] transition-colors">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {activity.length === 0 ? <p className="text-gray-400 dark:text-gray-500 text-sm">No recent activity.</p> : activity.map((act, i) => (
              <div key={i} className="flex relative items-start gap-4 pb-4">
                {i !== activity.length - 1 && <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100 dark:bg-gray-700 -ml-px transition-colors"></div>}
                <div className="relative shrink-0 w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-500 dark:text-blue-400 mt-1 transition-colors">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 transition-colors">{act.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 transition-colors">{new Date(act.time).toLocaleString()}</p>
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
