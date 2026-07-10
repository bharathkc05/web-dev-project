import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../features/orders/services/order.service';
import { formatPrice } from '../../utils/formatPrice';

export const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getOrders({ limit: 50 });
        setOrders(data?.items || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-surface-container text-on-surface-variant border border-surface-container-high';
      case 'ACCEPTED': return 'bg-brown/10 text-brown border border-brown/20';
      case 'PREPARING': return 'bg-orange/10 text-[#d97706] border border-orange/30';
      case 'READY': return 'bg-orange text-white shadow-sm shadow-orange/30';
      case 'DELIVERED': return 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/20';
      case 'CANCELLED': return 'bg-primary/10 text-primary border border-primary/20';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-2xl font-black text-black uppercase mb-8 tracking-wider">RECENT ORDERS</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-20 bg-white rounded-xl shadow-sm">
          <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-receipt text-2xl text-neutral-400"></i>
          </div>
          <h2 className="font-display text-lg font-black mb-1">No orders yet</h2>
          <p className="text-on-surface-variant mb-6 text-sm">When you place an order, it will appear here.</p>
          <Link to="/menu" className="inline-block bg-orange text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wide hover:bg-orange/90 transition-colors text-sm">
            Start Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-on-surface uppercase text-sm tracking-wider">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="text-sm font-bold text-on-surface-variant mb-1">
                    {order.items.map(item => `${item.product?.name || 'Unknown Product'} x${item.quantity}`).join(', ')}
                  </div>
                  
                  <div className="text-xs font-semibold text-neutral-400">
                    {formatPrice(order.totalAmount)} | {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:border-l md:border-neutral-100 md:pl-6 shrink-0">
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <Link 
                      to={`/account/orders/${order._id}/track`}
                      className="flex-1 md:flex-none text-center bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-2.5 rounded-full font-bold uppercase tracking-wide text-xs transition-colors"
                    >
                      Track
                    </Link>
                  )}
                  <button className="flex-1 md:flex-none text-center bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-wide text-xs transition-colors">
                    Reorder
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
