import React, { useEffect, useState } from 'react';
import {
  getGroups,
  createGroup,
  deleteGroup,
  getDuties,
  createDuty,
  updateDuty
} from '../../services/api';
import { RefreshCw, Users, Trash2 } from 'lucide-react';

const Duties = () => {
  const [groups, setGroups] = useState([]);
  const [Duties, setDuties] = useState([]);

  const [newDutyDate, setNewDutyDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newDutyTime, setNewDutyTime] = useState('Morning');
  const [newDutyName, setNewDutyName] = useState('');
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

  const handleAddDuty = async () => {
    if (!newDutyName) return;
    try {
      await createDuty({
        name: newDutyName,
        date: newDutyDate,
        timeOfDay: newDutyTime
      });
      setNewDutyName('');
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

    let nextIndex = 0;
    if (duty.currentAssignee) {
      const currIdx = groups.findIndex(
        f => f._id === duty.currentAssignee._id
      );
      if (currIdx !== -1) {
        nextIndex = (currIdx + 1) % groups.length;
      }
    }

    const subsequentIndex = (nextIndex + 1) % groups.length;

    try {
      await updateDuty(duty._id, {
        currentAssignee: groups[nextIndex]._id,
        nextAssignee: groups[subsequentIndex]._id
      });
      loadData();
    } catch (err) {}
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
            {Duties.length === 0 && (
              <p className="col-span-full py-4 text-gray-500 dark:text-gray-400">
                No Duties found.
              </p>
            )}

            {Duties.map(duty => (
              <div
                key={duty._id}
                className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm space-y-4 relative"
              >
                <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-200 bg-gray-50 dark:bg-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
                  <span>
                    {duty.date
                      ? new Date(duty.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'No date'}
                  </span>
                  <span>•</span>
                  <span>{duty.timeOfDay || 'Morning'}</span>
                </div>

                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-300 pr-24">
                  {duty.name}
                </h3>

                <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-600 p-2 sm:p-3 rounded-lg border border-gray-100/50">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-200 uppercase">
                      Current
                    </p>
                    <p className="text-sm text-primary-600 font-bold">
                      {duty.currentAssignee?.name || 'Unassigned'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-200 uppercase">
                      Up Next
                    </p>
                    <p className="text-sm text-primary-600">
                      → {duty.nextAssignee?.name || 'Unassigned'}
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
            ))}
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
                + Add Group Member
              </h3>

              <div className="space-y-3">
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

                <button
                  onClick={handleAddGroup}
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                >
                  Add Group Member
                </button>
              </div>
            </div>
          </div>

          {/* ADD NEW DUTY (MOVED HERE) */}
          <div className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-300 mb-3">
              + Add New Duty
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                id="newDutyName"
                name="newDutyName"
                value={newDutyName}
                onChange={e => setNewDutyName(e.target.value)}
                placeholder="e.g. Take out trash"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              />

              <div className="flex gap-3">
                <input
                  type="date"
                  id="newDutyDate"
                  name="newDutyDate"
                  value={newDutyDate}
                  onChange={e => setNewDutyDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />

                <select
                  id="newDutyTime"
                  name="newDutyTime"
                  value={newDutyTime}
                  onChange={e => setNewDutyTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="Morning">Morning</option>
                  <option value="Night">Night</option>
                </select>
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