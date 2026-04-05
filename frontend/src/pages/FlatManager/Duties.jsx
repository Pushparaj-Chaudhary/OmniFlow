import React, { useEffect, useState, useCallback } from 'react';
import {
  getGroups,
  createGroup,
  deleteGroup,
  getDuties,
  createDuty,
  updateDuty,
  deleteDuty
} from '../../services/api';
import { RefreshCw, Users, Trash2, Sun, Moon, Clock, CalendarDays } from 'lucide-react';
import { formatDateLocal } from '../../utils/dateUtils';

/**
 * Compute display values for a duty based on:
 *  1. rotationDays — auto-advance the assignee every N days
 *  2. timeOfDay    — if Morning/Night, shift within a day at 6 PM / 6 AM
 *
 * The duty.currentAssignee is the *base* person. duty.date is when they started.
 * We compute how many rotation periods have elapsed and offset into the group list.
 */
const getDisplayedDuty = (duty, groups) => {
  const now = new Date();
  const currentHour = now.getHours();
  const storedTime = duty.timeOfDay || 'Full Day';
  const rotationDays = duty.rotationDays || 1;

  // --- Step 1: Auto-rotation based on elapsed days ---
  let displayCurrent = duty.currentAssignee;
  let displayNext = duty.nextAssignee;
  let rotationCount = 0;

  const dutyDate = duty.date ? new Date(duty.date) : null;

  if (dutyDate && displayCurrent && groups.length > 0) {
    // Calculate full days elapsed since duty start date
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dutyMidnight = new Date(dutyDate.getFullYear(), dutyDate.getMonth(), dutyDate.getDate());
    const daysElapsed = Math.floor((nowMidnight - dutyMidnight) / 86400000);

    if (daysElapsed > 0) {
      rotationCount = Math.floor(daysElapsed / rotationDays);
    }

    if (rotationCount > 0) {
      const baseIdx = groups.findIndex(g => g._id === displayCurrent._id);
      if (baseIdx !== -1) {
        const currentIdx = (baseIdx + rotationCount) % groups.length;
        const nextIdx = (currentIdx + 1) % groups.length;
        displayCurrent = groups[currentIdx];
        displayNext = groups[nextIdx];
      }
    }
  }

  // --- Step 2: Morning/Night shift within a day ---
  if (storedTime === 'Full Day') {
    return {
      displayTimeOfDay: 'Full Day',
      displayCurrent,
      displayNext,
      isShifted: false,
      rotationCount
    };
  }

  // For Morning/Night duties: 6 AM – 6 PM is morning, 6 PM – 6 AM is night
  const isNightHours = currentHour >= 18 || currentHour < 6;

  if (storedTime === 'Morning' && isNightHours && groups.length > 0) {
    // It's night hours but stored as Morning → shift forward by 1
    const nightCurrent = displayNext;
    let nightNext = null;
    if (nightCurrent) {
      const idx = groups.findIndex(g => g._id === nightCurrent._id);
      if (idx !== -1) {
        nightNext = groups[(idx + 1) % groups.length];
      }
    }
    return {
      displayTimeOfDay: 'Night',
      displayCurrent: nightCurrent,
      displayNext: nightNext,
      isShifted: true,
      rotationCount
    };
  }

  if (storedTime === 'Night' && !isNightHours && groups.length > 0) {
    // It's morning hours but stored as Night → shift forward by 1
    const morningCurrent = displayNext;
    let morningNext = null;
    if (morningCurrent) {
      const idx = groups.findIndex(g => g._id === morningCurrent._id);
      if (idx !== -1) {
        morningNext = groups[(idx + 1) % groups.length];
      }
    }
    return {
      displayTimeOfDay: 'Morning',
      displayCurrent: morningCurrent,
      displayNext: morningNext,
      isShifted: true,
      rotationCount
    };
  }

  return {
    displayTimeOfDay: storedTime,
    displayCurrent,
    displayNext,
    isShifted: false,
    rotationCount
  };
};

const Duties = () => {
  const [groups, setGroups] = useState([]);
  const [duties, setDuties] = useState([]);
  const [, setTick] = useState(0);

  const [newDutyDate, setNewDutyDate] = useState(
    formatDateLocal(new Date())
  );
  const [newDutyTime, setNewDutyTime] = useState('Full Day');
  const [newDutyName, setNewDutyName] = useState('');
  const [newDutyRotation, setNewDutyRotation] = useState(1);
  const [newGroup, setNewGroup] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const loadData = async () => {
    try {
      const [fmRes, chRes] = await Promise.all([
        getGroups(),
        getDuties()
      ]);
      setGroups(fmRes.data);
      setDuties(chRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Re-render every minute so shifts happen automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleAddDuty = async () => {
    if (!newDutyName) return;
    try {
      const payload = {
        name: newDutyName,
        date: newDutyDate,
        timeOfDay: newDutyTime,
        rotationDays: newDutyRotation
      };
      // Auto-assign from existing group members
      if (groups.length >= 1) {
        payload.currentAssignee = groups[0]._id;
      }
      if (groups.length >= 2) {
        payload.nextAssignee = groups[1]._id;
      } else if (groups.length === 1) {
        payload.nextAssignee = groups[0]._id;
      }
      await createDuty(payload);
      setNewDutyName('');
      setNewDutyRotation(1);
      loadData();
    } catch (err) {}
  };

  const handleAddGroup = async () => {
    if (!newGroup.name) return;
    try {
      await createGroup(newGroup);
      setNewGroup({ name: '', email: '', phone: '' });
      loadData();
    } catch (err) {}
  };

  const handleDeleteGroup = async (id) => {
    try {
      await deleteGroup(id);
      loadData();
    } catch (err) {}
  };

  const handleNextTurn = async (duty) => {
    if (groups.length === 0) return alert('Add group members first');

    const displayed = getDisplayedDuty(duty, groups);
    const effectiveCurrent = displayed.displayCurrent;

    let nextIndex = 0;
    if (effectiveCurrent) {
      const currIdx = groups.findIndex(f => f._id === effectiveCurrent._id);
      if (currIdx !== -1) {
        nextIndex = (currIdx + 1) % groups.length;
      }
    }
    const subsequentIndex = (nextIndex + 1) % groups.length;

    try {
      await updateDuty(duty._id, {
        currentAssignee: groups[nextIndex]._id,
        nextAssignee: groups[subsequentIndex]._id,
        // Reset date to today so auto-rotation starts fresh from the new person
        date: formatDateLocal(new Date()),
        timeOfDay: displayed.isShifted ? displayed.displayTimeOfDay : duty.timeOfDay
      });
      loadData();
    } catch (err) {}
  };

  const handleDeleteDuty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this duty?')) return;
    try {
      await deleteDuty(id);
      loadData();
    } catch (err) {}
  };

  /** Badge style helper */
  const getBadgeStyle = (displayTime) => {
    if (displayTime === 'Night') {
      return 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700';
    }
    if (displayTime === 'Morning') {
      return 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700';
    }
    return 'text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-500';
  };

  const getShiftIcon = (displayTime) => {
    if (displayTime === 'Night') return <Moon className="w-3 h-3 mr-1" />;
    if (displayTime === 'Morning') return <Sun className="w-3 h-3 mr-1" />;
    return <Clock className="w-3 h-3 mr-1" />;
  };

  /** How many days until the next auto-rotation */
  const getDaysUntilNextRotation = (duty) => {
    const rotationDays = duty.rotationDays || 1;
    const dutyDate = duty.date ? new Date(duty.date) : null;
    if (!dutyDate) return null;

    const now = new Date();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dutyMidnight = new Date(dutyDate.getFullYear(), dutyDate.getMonth(), dutyDate.getDate());
    const daysElapsed = Math.floor((nowMidnight - dutyMidnight) / 86400000);

    if (daysElapsed < 0) return rotationDays; // future duty
    const daysSinceLastRotation = daysElapsed % rotationDays;
    return rotationDays - daysSinceLastRotation;
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300">
            Manage Duties
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {duties.length === 0 && (
              <p className="col-span-full py-4 text-gray-500 dark:text-gray-400">
                No Duties found.
              </p>
            )}

            {duties.map(duty => {
              const { displayTimeOfDay, displayCurrent, displayNext, isShifted, rotationCount } = getDisplayedDuty(duty, groups);
              const daysUntilNext = getDaysUntilNextRotation(duty);
              const rotDays = duty.rotationDays || 1;

              return (
                <div
                  key={duty._id}
                  className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm space-y-3 relative"
                >
                  {/* Badge: date + shift */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <div className={`flex items-center space-x-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md border ${getBadgeStyle(displayTimeOfDay)}`}>
                      {getShiftIcon(displayTimeOfDay)}
                      <span>
                        {duty.date
                          ? new Date(duty.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'No date'}
                      </span>
                      <span>•</span>
                      <span>{displayTimeOfDay}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteDuty(duty._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Duty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-300 pr-28">
                    {duty.name}
                  </h3>

                  {/* Rotation info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                      <CalendarDays className="w-3 h-3 mr-1" />
                      {rotDays === 1 ? 'Rotates daily' : `Rotates every ${rotDays} days`}
                    </span>
                    {daysUntilNext !== null && (
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                        {daysUntilNext === 0
                          ? 'Rotates today'
                          : daysUntilNext === 1
                            ? 'Next rotation tomorrow'
                            : `Next rotation in ${daysUntilNext} days`
                        }
                      </span>
                    )}
                    {duty.timeOfDay !== 'Full Day' && (
                      <span className="inline-flex items-center text-[10px] sm:text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        Day/Night shift
                      </span>
                    )}
                  </div>

                  {/* Current / Up Next */}
                  <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-600 p-2 sm:p-3 rounded-lg border border-gray-100/50">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-200 uppercase">
                        Current
                      </p>
                      <p className="text-sm text-primary-600 font-bold">
                        {displayCurrent?.name || 'Unassigned'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-200 uppercase">
                        Up Next
                      </p>
                      <p className="text-sm text-primary-600">
                        → {displayNext?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNextTurn(duty)}
                    className="w-full flex justify-center items-center py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Next Turn
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* TEAM MEMBERS */}
          <div className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              Manage Group Members
            </h2>

            <div className="space-y-3 mb-6">
              {groups.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No group members added.
                </p>
              )}

              {groups.map(fm => (
                <div
                  key={fm._id}
                  className="flex justify-between items-center p-2 border border-gray-100 dark:border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300 text-sm">
                      {fm.name}
                    </p>
                    {fm.email && (
                      <p className="text-xs text-gray-500">{fm.email}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteGroup(fm._id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-3">
                Add Group Member
              </h3>

              <div className="space-y-3">
                <div>
                  <label htmlFor="newGroupName" className="sr-only">Name</label>
                  <input
                    type="text"
                    id="newGroupName"
                    name="newGroupName"
                    placeholder="Name (Required)"
                    value={newGroup.name}
                    onChange={e =>
                      setNewGroup({
                        ...newGroup,
                        name: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="newGroupEmail" className="sr-only">Email</label>
                  <input
                    type="email"
                    id="newGroupEmail"
                    name="newGroupEmail"
                    placeholder="Email (Optional)"
                    value={newGroup.email}
                    onChange={e =>
                      setNewGroup({
                        ...newGroup,
                        email: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                <button
                  onClick={handleAddGroup}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                >
                  Add Group Member
                </button>
              </div>
            </div>
          </div>

          {/* ADD NEW DUTY */}
          <div className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-300 mb-3">
              Add New Duty
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="newDutyName" className="sr-only">Duty Name</label>
                <input
                  type="text"
                  id="newDutyName"
                  name="newDutyName"
                  value={newDutyName}
                  onChange={e => setNewDutyName(e.target.value)}
                  placeholder="e.g. Take out trash"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-full">
                  <label htmlFor="newDutyDate" className="sr-only">Date</label>
                  <input
                    type="date"
                    id="newDutyDate"
                    name="newDutyDate"
                    value={newDutyDate}
                    min={formatDateLocal(new Date())}
                    onChange={e => setNewDutyDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="newDutyTime" className="sr-only">Time of Day</label>
                  <select
                    id="newDutyTime"
                    name="newDutyTime"
                    value={newDutyTime}
                    onChange={e => setNewDutyTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Morning">Morning</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              {/* Rotation Days */}
              <div>
                <label 
                  htmlFor="newDutyRotation"
                  className="text-xs font-semibold text-gray-500 dark:text-gray-300 mb-2 block"
                >
                  Next person takes over after how many days?
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setNewDutyRotation(prev => Math.max(1, prev - 1))}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-lg transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      id="newDutyRotation"
                      name="newDutyRotation"
                      value={newDutyRotation}
                      readOnly
                      className="w-12 py-2 text-center font-bold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewDutyRotation(prev => prev + 1)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {newDutyRotation === 1 ? 'day (daily)' : `days`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddDuty}
                className="py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Duties;