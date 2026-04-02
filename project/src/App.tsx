import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { PharmacyDashboard } from './components/pharmacy/PharmacyDashboard';
import { CourierDashboard } from './components/courier/CourierDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen />;
  }

  switch (profile.role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'pharmacy':
      return <PharmacyDashboard />;
    case 'courier':
      return <CourierDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <CustomerDashboard />;
  }
}

export default App;
