import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Overview from './FlatManager/Overview';
import Duties from './FlatManager/Duties';
import Expenses from './FlatManager/Expenses';
import SettleUp from './FlatManager/SettleUp';

const FlatManager = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/flatmanager/overview' },
    { name: 'Duties', path: '/flatmanager/Duties' },
    { name: 'Expenses', path: '/flatmanager/expenses' },
    { name: 'Settle Up', path: '/flatmanager/settleup' },
  ];

  return (
    <div className="w-full flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 transition-colors">Group Manager</h1>
        {/* Nested Nav */}
        <div className="flex space-x-1 sm:space-x-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar transition-colors">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`py-2 px-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors flex items-center ${isActive
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 w-full bg-transparent pb-10">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="Duties" element={<Duties />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="settleup" element={<SettleUp />} />
        </Routes>
      </div>
    </div>
  );
};

export default FlatManager;
