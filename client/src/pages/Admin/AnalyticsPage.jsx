import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { formatPrice } from '../../utils/formatPrice';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getPlatformAnalytics();
        setData(res.data || res);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  const {
    totalUsers,
    totalRevenue,
    totalOrders,
    activeOutlets,
    masterCatalogueSize,
    topActivatedProducts,
    dailyOrders,
  } = data;

  const MetricCard = ({ title, value, icon, bg }) => (
    <div className={`p-6 rounded-2xl shadow-sm border border-surface-container-high flex items-center ${bg}`}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/40 text-on-surface mr-4">
        <i className={`${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-on-surface mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Platform Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Users" value={totalUsers} icon="fas fa-users" bg="bg-blue-50" />
        <MetricCard title="Total Orders" value={totalOrders} icon="fas fa-shopping-bag" bg="bg-green-50" />
        <MetricCard title="Revenue" value={formatPrice(totalRevenue)} icon="fas fa-rupee-sign" bg="bg-yellow-50" />
        <MetricCard title="Active Outlets" value={activeOutlets} icon="fas fa-store" bg="bg-purple-50" />
        <MetricCard title="Master Catalogue" value={masterCatalogueSize} icon="fas fa-book" bg="bg-orange/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Orders Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-high">
          <h3 className="text-lg font-bold text-on-surface mb-6">Daily Orders (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyOrders} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#502314" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#502314', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#E65C00', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Products Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-high">
          <h3 className="text-lg font-bold text-on-surface mb-6">Top 5 Most Activated Products</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topActivatedProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#E65C00" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
