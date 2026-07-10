import { useState, useEffect } from 'react';
import { orderService } from '../../features/orders/services/order.service';
import { formatPrice } from '../../utils/formatPrice';

export const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders({ limit: 100 });
      console.log('ManagerOrders fetchOrders data:', data);
      setOrders(data?.items || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Polling every 10 seconds for new orders (since we don't have socket implemented yet in this component)
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      // Optimistic update
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
      fetchOrders(); // Revert on failure
    }
  };

  // Group orders by status
  const pendingOrders = orders.filter(o => o.orderStatus === 'PLACED');
  const preparingOrders = orders.filter(o => o.orderStatus === 'ACCEPTED' || o.orderStatus === 'PREPARING');
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');
  const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'CANCELLED');

  const OrderCard = ({ order }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-surface-container-high hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            #{order._id.substring(order._id.length - 6)}
          </span>
          <p className="text-sm font-medium text-on-surface mt-1">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <div className="text-right">
          <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
          <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">{order.paymentMode}</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-on-surface-variant"><span className="font-bold text-on-surface">{item.qty}x</span> {item.name}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-surface-container-highest flex flex-col space-y-2">
        {order.orderStatus === 'PLACED' && (
          <>
            <button onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')} className="w-full bg-primary text-white py-2 rounded-lg font-bold text-xs hover:bg-orange transition-colors">Accept Order</button>
            <button onClick={() => handleUpdateStatus(order._id, 'CANCELLED')} className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors">Reject</button>
          </>
        )}
        {order.orderStatus === 'ACCEPTED' && (
          <button onClick={() => handleUpdateStatus(order._id, 'PREPARING')} className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors">Start Preparing</button>
        )}
        {order.orderStatus === 'PREPARING' && (
          <button onClick={() => handleUpdateStatus(order._id, 'READY')} className="w-full bg-orange-50 text-orange-600 py-2 rounded-lg font-bold text-xs hover:bg-orange-100 transition-colors">Mark Ready</button>
        )}
        {order.orderStatus === 'READY' && (
          <button onClick={() => handleUpdateStatus(order._id, 'DELIVERED')} className="w-full bg-green-50 text-green-600 py-2 rounded-lg font-bold text-xs hover:bg-green-100 transition-colors">Mark Delivered</button>
        )}
        {(order.orderStatus === 'DELIVERED' || order.orderStatus === 'CANCELLED') && (
          <div className="text-center py-2 text-xs font-bold text-on-surface-variant">
            {order.orderStatus}
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">Order Fulfillment</h2>
        <button onClick={fetchOrders} className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors focus:outline-none">
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {/* Pending Column */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-4 flex flex-col h-full min-h-[500px]">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center justify-between">
            Pending <span className="bg-surface-container px-2 py-0.5 rounded-full text-xs">{pendingOrders.length}</span>
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 hide-scrollbar">
            {pendingOrders.map(order => <OrderCard key={order._id} order={order} />)}
            {pendingOrders.length === 0 && <p className="text-center text-xs text-on-surface-variant py-8">No pending orders</p>}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-4 flex flex-col h-full min-h-[500px]">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center justify-between">
            Preparing <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">{preparingOrders.length}</span>
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 hide-scrollbar">
            {preparingOrders.map(order => <OrderCard key={order._id} order={order} />)}
            {preparingOrders.length === 0 && <p className="text-center text-xs text-on-surface-variant py-8">No orders in preparation</p>}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-4 flex flex-col h-full min-h-[500px]">
          <h2 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center justify-between">
            Ready <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-xs">{readyOrders.length}</span>
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 hide-scrollbar">
            {readyOrders.map(order => <OrderCard key={order._id} order={order} />)}
            {readyOrders.length === 0 && <p className="text-center text-xs text-on-surface-variant py-8">No orders ready</p>}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high p-4 flex flex-col h-full min-h-[500px]">
          <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-4 flex items-center justify-between">
            Completed <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-xs">{completedOrders.slice(0, 10).length}</span>
          </h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 hide-scrollbar">
            {completedOrders.slice(0, 10).map(order => <OrderCard key={order._id} order={order} />)}
            {completedOrders.length === 0 && <p className="text-center text-xs text-on-surface-variant py-8">No completed orders today</p>}
            {completedOrders.length > 10 && <p className="text-center text-xs text-on-surface-variant py-2">Showing last 10</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
