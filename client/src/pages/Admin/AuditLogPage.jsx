import { useState, useEffect } from 'react';
import { adminService } from './services/admin.service';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const data = await adminService.getAuditLogs(filters);
      setLogs(data.data?.items || data.items || []);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Audit Logs</h2>
        
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <i className="fas fa-calendar-alt text-on-surface-variant"></i>
            <input
              type="date"
              className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer text-on-surface-variant font-medium p-0"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <span className="text-on-surface-variant text-sm">-</span>
            <input
              type="date"
              className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer text-on-surface-variant font-medium p-0"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={handleClearFilters}
              className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading audit logs...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-lowest border-b border-surface-container-high text-on-surface-variant font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Type</th>
                  <th className="px-6 py-4">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant text-xs font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {log.actorId || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-surface-container text-on-surface uppercase tracking-wider">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {log.targetType}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">
                      {log.targetId || '-'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                      No audit logs found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
