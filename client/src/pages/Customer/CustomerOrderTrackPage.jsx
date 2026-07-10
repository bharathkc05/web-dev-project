import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../features/orders/services/order.service';
import { formatPrice } from '../../utils/formatPrice';

export const CustomerOrderTrackPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Poll for updates every 10 seconds if not delivered or cancelled
    const interval = setInterval(() => {
      if (order && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED') {
        fetchOrder();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [id, order?.orderStatus]);

  if (isLoading && !order) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-black text-on-surface mb-2">Order Not Found</h2>
        <p className="text-on-surface-variant mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/account/orders" className="text-primary hover:underline font-bold">Return to My Orders</Link>
      </div>
    );
  }

  const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'];
  const cancelled = order.orderStatus === 'CANCELLED';
  
  // Calculate current step index
  let currentStep = statuses.indexOf(order.orderStatus);
  if (currentStep === -1) currentStep = 0; // Fallback

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      <div 
        className="mx-auto select-none outline-none"
        style={{ 
          width: '85%', 
          margin: '0 auto', 
          padding: '2rem 0px',
        }}
      >
        {/* Breadcrumb */}
        <div className="mb-10 flex items-center text-xs font-bold text-on-surface-variant tracking-wider uppercase">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2 font-bold">&gt;</span>
          <Link to="/account/orders" className="hover:text-primary transition-colors">My Orders</Link>
          <span className="mx-2 font-bold">&gt;</span>
          <span className="text-on-surface font-black">TRACK ORDER</span>
        </div>

        <div className="mb-8">
          <h1 className="font-headline-xl text-3xl font-black text-on-surface">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Tracking & Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tracking Status Card */}
            <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-6">Track Order</h2>
              
              {cancelled ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <i className="fas fa-times-circle text-4xl text-red-500 mb-3"></i>
                  <h3 className="text-xl font-bold text-red-700 mb-1">Order Cancelled</h3>
                  <p className="text-red-600 text-sm">This order has been cancelled and will not be fulfilled.</p>
                </div>
              ) : (
                <div className="relative pt-4 pb-8">
                  
                  <div className="flex justify-between relative">
                    {/* Line wrapper */}
                    <div className="absolute top-5 left-5 right-5 h-1.5 bg-surface-container-high rounded-full -z-10">
                      {/* Active line */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }}
                      ></div>
                    </div>

                    {statuses.map((status, index) => {
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;
                      
                      const icons = {
                        'PLACED': 'fa-receipt',
                        'ACCEPTED': 'fa-check-double',
                        'PREPARING': 'fa-fire-burner',
                        'READY': 'fa-bag-shopping',
                        'DELIVERED': 'fa-house-circle-check'
                      };
                      
                      const labels = {
                        'PLACED': 'Placed',
                        'ACCEPTED': 'Accepted',
                        'PREPARING': 'Preparing',
                        'READY': 'Ready',
                        'DELIVERED': 'Delivered'
                      };
                      
                      return (
                        <div key={status} className="flex flex-col items-center z-10 w-16">
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                              isCurrent ? 'bg-primary text-white shadow-md shadow-primary/30 scale-110 ring-4 ring-primary/20' : 
                              isCompleted ? 'bg-primary text-white' : 'bg-white text-on-surface-variant border-2 border-surface-container-high'
                            }`}
                          >
                            <i className={`fas ${icons[status]} ${isCurrent ? 'animate-bounce' : ''}`}></i>
                          </div>
                          <span className={`text-xs mt-3 font-bold text-center ${isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            {labels[status]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-surface-container last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-bold text-on-surface text-sm">
                        {item.qty}x
                      </div>
                      <span className="font-medium text-on-surface">{item.name}</span>
                    </div>
                    <span className="font-bold text-on-surface">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar - Receipt & Info */}
          <div className="space-y-6">
            
            {/* Receipt Card */}
            <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h3 className="font-bold text-on-surface mb-4 border-b border-surface-container pb-2">Receipt</h3>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-medium text-on-surface">{formatPrice(order.totalAmount - order.tax + order.discount)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Discount</span>
                  <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-on-surface">{formatPrice(order.tax)}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-dashed border-surface-container-high flex justify-between items-center">
                <span className="font-black text-on-surface text-lg">Total</span>
                <span className="font-black text-primary text-xl">{formatPrice(order.totalAmount)}</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface-variant">Payment Method</span>
                <div className="flex items-center">
                  <i className={`fas ${order.paymentMode === 'COD' ? 'fa-money-bill' : 'fa-credit-card'} text-primary mr-2`}></i>
                  <span className="font-bold text-on-surface">{order.paymentMode}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h3 className="font-bold text-on-surface mb-4 border-b border-surface-container pb-2">Delivery Details</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wide mb-1">Address</p>
                  <p className="font-medium text-on-surface">
                    {order.address.street}, {order.address.city}, {order.address.state} {order.address.pincode}
                  </p>
                </div>
                
                {order.instructions && (
                  <div>
                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wide mb-1">Instructions</p>
                    <p className="font-medium text-on-surface bg-surface-container p-3 rounded-lg italic">
                      "{order.instructions}"
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
