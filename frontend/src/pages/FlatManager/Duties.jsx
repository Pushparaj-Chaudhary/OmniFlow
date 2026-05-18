import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getGroups,
  createGroup,
  deleteGroup,
  getDuties,
  createDuty,
  updateDuty,
  deleteDuty,
  getHouseholdMembers,
  removeMember
} from '../../services/api';
import { RefreshCw, Users, Trash2, Sun, Moon, Clock, CalendarDays, Key, Share2, Copy, UserCheck, Shield, Plus } from 'lucide-react';
import { formatDateLocal } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

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
  const { user: currentUser, updateUser } = useAuth();
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null);
  const [groups, setGroups] = useState([]);
  const [duties, setDuties] = useState([]);

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

  const loadData = useCallback(async () => {
    try {
      const [fmRes, chRes, houseRes] = await Promise.all([
        getGroups(),
        getDuties(),
        getHouseholdMembers()
      ]);
      setGroups(fmRes.data);
      setDuties(chRes.data);
      setHousehold(houseRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        // If household is not found, clear it from session
        updateUser({ activeHousehold: null });
      }
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        payload.assigneeType = groups[0].type;
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

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name}?`)) return;
    try {
      if (member.type === 'User') {
        await removeMember(member._id);
      } else {
        await deleteGroup(member._id);
      }
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
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
        assigneeType: groups[nextIndex].type,
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

  const copyCode = () => {
    if (household?.secretCode) {
      navigator.clipboard.writeText(household.secretCode);
      alert('Secret code copied!');
    }
  };

  const shareLink = async () => {
    if (!household?.secretCode) return;
    const link = `${window.location.origin}/flatmanager?joinCode=${household.secretCode}`;
    const shareData = {
      title: 'Join my OmniFlow Group',
      text: `Join ${household.name} on OmniFlow! Code: ${household.secretCode}`,
      url: link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(`Join group ${household.name} on OmniFlow!\nCode: ${household.secretCode}\nLink: ${link}`);
      alert('Invite link copied!');
    }
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

          {/* TEAM MEMBERS (AUTOMATIC & MANUAL) */}
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                Group Members
              </h2>
              {household?.name && (
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/40 px-2 py-1 rounded-full border border-primary-100 dark:border-primary-800">
                  {household.name}
                </span>
              )}
            </div>

            {/* Invite roommates area (Admin Only) */}
            {household?.admin === currentUser?._id && (
              <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                          <Key className="w-3 h-3" />
                          <span>Invitation Code</span>
                      </div>
                      <p className="text-xl font-mono font-black text-gray-800 dark:text-gray-200 tracking-widest">{household?.secretCode || '......'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={copyCode} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors shadow-sm" title="Copy Code">
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={shareLink} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md shadow-primary-200 dark:shadow-none" title="Share Invitation">
                          <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 italic">New members use this code to join automatically.</p>
              </div>
            )}

            <div className="space-y-3 mb-8">
              {groups.length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-gray-400 text-sm">Waiting for members to join...</p>
                </div>
              )}

              {groups.map(fm => {
                const isAdmin = household?.admin === currentUser?._id;
                const isMemberRealUser = fm.type === 'User';
                const isSelf = fm._id === currentUser?._id;
                const canRemove = isAdmin && !isSelf;

                return (
                  <div
                    key={fm._id}
                    className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 transition-all border-l-4 border-l-transparent hover:border-l-primary-500 dark:hover:border-l-primary-500 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isMemberRealUser ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                         {isMemberRealUser ? <UserCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                          {fm.name}
                          {fm._id === household?.admin && (
                            <Shield className="w-3.5 h-3.5 text-amber-500" title="Group Admin" />
                          )}
                          {isSelf && (
                            <span className="text-[9px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">You</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">{isMemberRealUser ? 'Joined Member' : 'Manual Guest'}</p>
                      </div>
                    </div>

                    {canRemove && (
                      <button
                        onClick={() => handleDeleteMember(fm)}
                        className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Addition Form (Only for Admin - Added as "Manual Guests") */}
            {household?.admin === currentUser?._id && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                   <Plus className="w-3 h-3 mr-1" />
                   Add Manual New Member
                </h3>

                <div className="space-y-3">
                  <label htmlFor="manualMemberName" className="sr-only">Member Name</label>
                  <input
                    type="text"
                    id="manualMemberName"
                    name="manualMemberName"
                    placeholder="Member Name"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <label htmlFor="manualMemberEmail" className="sr-only">Email Address</label>
                    <input
                      type="email"
                      id="manualMemberEmail"
                      name="manualMemberEmail"
                      placeholder="Email (Optional)"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                      value={newGroup.email}
                      onChange={e => setNewGroup({ ...newGroup, email: e.target.value })}
                    />
                    <button
                      onClick={handleAddGroup}
                      className="py-2 bg-gray-800 dark:bg-gray-700 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
                    >
                      Add Guest
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  placeholder="e.g. Cooking"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg dark:text-white text-black"
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