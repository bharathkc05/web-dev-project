import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchUsersAndOutlets = async () => {
    try {
      setLoading(true);
      const [usersData, outletsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getOutlets({ isActive: true })
      ]);
      setUsers(usersData.data?.items || usersData.items || []);
      setOutlets(outletsData.data?.items || outletsData.items || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOutlets();
  }, []);

  const handleSuspend = async (id) => {
    const reason = window.prompt('Please enter a reason for suspension:');
    if (reason === null) return; // User cancelled

    try {
      await adminService.suspendUser(id, reason || 'No reason provided');
      fetchUsersAndOutlets();
    } catch (error) {
      console.error('Failed to suspend user', error);
      alert(error.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleUnsuspend = async (id) => {
    if (window.confirm('Are you sure you want to unsuspend this user?')) {
      try {
        await adminService.unsuspendUser(id);
        fetchUsersAndOutlets();
      } catch (error) {
        console.error('Failed to unsuspend user', error);
        alert(error.response?.data?.message || 'Failed to unsuspend user');
      }
    }
  };

  const handleAssignManagerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOutletId || !selectedUserForAssign) return;

    try {
      setAssigning(true);
      await adminService.assignManager(selectedUserForAssign._id, selectedOutletId);
      setIsAssignModalOpen(false);
      setSelectedUserForAssign(null);
      setSelectedOutletId('');
      fetchUsersAndOutlets();
    } catch (error) {
      console.error('Failed to assign manager', error);
      alert(error.response?.data?.message || 'Failed to assign manager');
    } finally {
      setAssigning(false);
    }
  };

  const openAssignModal = (user) => {
    setSelectedUserForAssign(user);
    setSelectedOutletId('');
    setIsAssignModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) {
      try {
        await adminService.deleteUser(id);
        fetchUsersAndOutlets();
      } catch (error) {
        console.error('Failed to delete user', error);
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Manage Users</h2>
        <div className="relative w-64">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-surface-container-high rounded-full focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-lowest border-b border-surface-container-high text-on-surface-variant font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'OUTLET_MANAGER' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-800 uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-800 uppercase tracking-wider">Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role !== 'ADMIN' && (
                          <>
                            {user.isActive ? (
                              <button
                                onClick={() => handleSuspend(user._id)}
                                className="bg-orange/10 text-orange hover:bg-orange hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnsuspend(user._id)}
                                className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              >
                                Unsuspend
                              </button>
                            )}

                            {user.role === 'CUSTOMER' && user.isActive && (
                              <button
                                onClick={() => openAssignModal(user)}
                                className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              >
                                Assign Outlet
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(user._id)}
                              className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">Assign Outlet Manager</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <p className="mb-6 text-sm font-bold text-neutral-500">
                You are about to promote <span className="font-black text-black uppercase">{selectedUserForAssign?.name}</span> to an Outlet Manager.
              </p>
              <form id="assign-manager-form" onSubmit={handleAssignManagerSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Outlet</label>
                  <select
                    required
                    value={selectedOutletId}
                    onChange={(e) => setSelectedOutletId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold"
                  >
                    <option value="" disabled>Choose an outlet...</option>
                    {outlets.map(outlet => (
                      <option key={outlet._id} value={outlet._id}>
                        {outlet.name} {outlet.address ? `(${outlet.address.substring(0, 20)}...)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-neutral-200 text-black font-bold uppercase tracking-wide text-xs hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="flex-1 bg-orange hover:bg-[#d95a20] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                  >
                    {assigning ? <i className="fas fa-spinner fa-spin"></i> : 'Assign & Promote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
