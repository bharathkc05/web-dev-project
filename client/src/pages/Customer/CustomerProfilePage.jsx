import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../features/auth/services/auth.service';

export const CustomerProfilePage = () => {
  const { user, token, refreshToken } = useAuth();
  const { setAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (location.state?.edit) {
      setIsEditing(true);
      // Clean up the state so it doesn't re-open on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const updatedProfile = await authService.updateProfile(formData);
      setAuth({ ...user, ...updatedProfile }, token, refreshToken);
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl font-black text-black uppercase tracking-wider">PROFILE</h2>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        {error && !isEditing && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold">
            {error}
          </div>
        )}
        {successMsg && !isEditing && (
          <div className="mb-6 p-4 bg-[#e6f4ea] border border-[#137333]/20 text-[#137333] rounded-xl text-sm font-bold">
            {successMsg}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-surface-container">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center border-2 border-primary/20 shrink-0">
              <i className="fas fa-user text-primary text-2xl"></i>
            </div>
            <div>
              <h3 className="font-headline-sm font-black text-on-surface text-xl">{user?.name || 'Guest'}</h3>
              <p className="text-sm font-bold text-on-surface-variant mt-1">Customer Account</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-on-surface font-semibold">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phone Number</p>
              <p className="text-on-surface font-semibold">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-display text-xl font-black text-black uppercase tracking-wider">Edit Profile</h3>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user?.name || '', phone: user?.phone || '' });
                  setError('');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-neutral-200 text-neutral-500 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="flex justify-center mb-8">
                <div className="relative cursor-pointer group">
                  <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                    <i className="fas fa-user text-primary text-4xl"></i>
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange text-white rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                    <i className="fas fa-pen text-xs"></i>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange/50 text-sm bg-[#fcf9f8] text-black font-semibold" 
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email ID</label>
                  <input 
                    type="email" 
                    disabled 
                    value={user?.email || ''} 
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed text-sm font-semibold" 
                  />
                  <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wide">Email cannot be changed</p>
                </div>
                
                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-orange text-white rounded-lg font-black uppercase tracking-wider text-sm hover:bg-orange/90 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
                  >
                    {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                    Save changes
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
