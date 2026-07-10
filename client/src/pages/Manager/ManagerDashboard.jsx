import { useState, useEffect } from 'react';
import { orderService } from '../../features/orders/services/order.service';
import { formatPrice } from '../../utils/formatPrice';

export const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCompleted: 0,
    activeOrders: 0,
    avgOrderValue: 0,
    breakdown: { PLACED: 0, ACCEPTED: 0, PREPARING: 0, READY: 0, DELIVERED: 0, CANCELLED: 0 }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await orderService.getOrders({ limit: 100 });
        
        const orders = data.items || [];
        
        let revenue = 0;
        let completed = 0;
        let active = 0;
        const breakdown = { PLACED: 0, ACCEPTED: 0, PREPARING: 0, READY: 0, DELIVERED: 0, CANCELLED: 0 };

        orders.forEach(order => {
          if (breakdown[order.orderStatus] !== undefined) {
            breakdown[order.orderStatus]++;
          }
          
          if (order.orderStatus === 'DELIVERED') {
            revenue += order.totalAmount;
            completed += 1;
          } else if (order.orderStatus !== 'CANCELLED') {
            active += 1;
          }
        });

        setStats({
          totalRevenue: revenue,
          ordersCompleted: completed,
          activeOrders: active,
          avgOrderValue: completed > 0 ? revenue / completed : 0,
          breakdown
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-[#f0e6d8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-8 border border-[#f0e6d8]">
      <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider mb-2">Dashboard Overview</h2>
      
      {/* Stat Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-dollar-sign text-green-700"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{formatPrice(stats.totalRevenue)}</p>
        </div>

        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Orders Completed</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-check-circle text-blue-700"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{stats.ordersCompleted}</p>
        </div>

        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Active Orders</h3>
            <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
              <i className="fas fa-clock text-orange"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{stats.activeOrders}</p>
        </div>

        <div className="bg-[#f5ebdc]/30 p-6 rounded-xl border border-[#e6d5c1] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-[#502314] font-black uppercase text-[10px] tracking-widest">Avg Order Value</h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fas fa-chart-line text-purple-700"></i>
            </div>
          </div>
          <p className="font-display text-3xl font-black text-black mt-4">{formatPrice(stats.avgOrderValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Status Breakdown */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#f0e6d8] overflow-hidden">
          <div className="p-5 border-b border-[#f0e6d8] bg-[#f5ebdc]/50">
            <h3 className="font-display font-black text-[#502314] uppercase text-sm tracking-widest">Live Order Queue</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
                <span className="font-bold text-xs uppercase tracking-wider text-black/70">Placed</span>
              </div>
              <span className="font-black text-lg">{stats.breakdown.PLACED}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="font-bold text-xs uppercase tracking-wider text-black/70">Accepted / Prep</span>
              </div>
              <span className="font-black text-lg">{stats.breakdown.ACCEPTED + stats.breakdown.PREPARING}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange"></div>
                <span className="font-bold text-xs uppercase tracking-wider text-black/70">Ready</span>
              </div>
              <span className="font-black text-lg">{stats.breakdown.READY}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0e6d8] overflow-hidden">
          <div className="p-5 border-b border-[#f0e6d8] bg-[#f5ebdc]/50">
            <h3 className="font-display font-black text-[#502314] uppercase text-sm tracking-widest">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f0e6d8] text-[10px] uppercase tracking-widest text-[#502314]/70 font-black">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e6d8]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-black/50 font-bold">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-[#f5ebdc]/20 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-black/70">#{order._id.substring(order._id.length - 6)}</td>
                      <td className="px-5 py-4 text-xs font-bold text-black/70">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
                          order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          order.orderStatus === 'READY' ? 'bg-orange/20 text-orange' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-right text-black">{formatPrice(order.totalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};
