import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { CustomerCampaignView } from './components/campaign/CustomerCampaignView';
import { CustomerHome } from './components/customer/CustomerHome';
import { campaignStore } from './data/campaignStore';
import { Campaign } from './types';
import { Lock } from 'lucide-react';

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'Admin@123123') {
      onLogin();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-900">Admin Login</h2>
          <p className="text-sm text-stone-500 mt-1">Delhi Collection Campaign Manager</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

const CustomerRoute = () => {
  const { id } = useParams<{id: string}>();
  const campSlug = id;
  const [campaign, setCampaign] = useState<Campaign | null>(() => {
    return campSlug ? campaignStore.getCampaignById(campSlug) || null : null;
  });

  useEffect(() => {
    const updateCampaign = () => {
      if (campSlug) {
        const camp = campaignStore.getCampaignById(campSlug);
        setCampaign(camp || null);
      }
    };
    updateCampaign();
    return campaignStore.subscribe(updateCampaign);
  }, [campSlug]);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
          <p className="text-stone-400">The requested campaign does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden min-h-screen sm:min-h-0 sm:rounded-3xl border border-stone-800 flex flex-col">
        <CustomerCampaignView
          campaign={campaign}
          onCampaignUpdated={() => {
            const updated = campaignStore.getCampaignById(campaign.id);
            if (updated) setCampaign(updated);
          }}
        />
      </div>
    </div>
  );
};

const ProtectedAdminRoute = ({ isAuthenticated, onLogout, children }: any) => {
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <>
      <div className="fixed top-3 right-3 z-50">
        <button 
          onClick={onLogout}
          className="px-3 py-1.5 bg-stone-800 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-lg transition-colors border border-stone-700"
        >
          Logout Admin
        </button>
      </div>
      {children}
    </>
  );
};

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuth') === 'true';
  });

  const handleLogin = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('isAdminAuth', 'true');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAdminAuth');
  };

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/campaign/:id" element={<CustomerRoute />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedAdminRoute isAuthenticated={isAdminAuthenticated} onLogout={handleLogout}>
                <AdminLayout />
              </ProtectedAdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
