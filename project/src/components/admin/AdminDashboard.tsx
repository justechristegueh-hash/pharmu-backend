import { useState, useEffect } from 'react';
import { Shield, Package, Truck, Users, CheckCircle, X, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PendingMedicine {
  id: string;
  name: string;
  dosage: string | null;
  form: string | null;
  status: string;
  created_at: string;
  proposed_by: string;
}

interface Stats {
  totalOrders: number;
  activeOrders: number;
  totalCustomers: number;
  totalPharmacies: number;
  totalCouriers: number;
  availableCouriers: number;
}

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [pendingMedicines, setPendingMedicines] = useState<PendingMedicine[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    activeOrders: 0,
    totalCustomers: 0,
    totalPharmacies: 0,
    totalCouriers: 0,
    availableCouriers: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingMedicines();
    loadStats();
  }, []);

  const loadPendingMedicines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_medicines')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingMedicines(data || []);
    } catch (error) {
      console.error('Error loading pending medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [orders, customers, pharmacies, couriers] = await Promise.all([
        supabase.from('orders').select('id, status', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
        supabase.from('pharmacies').select('id', { count: 'exact' }),
        supabase.from('couriers').select('id, is_available', { count: 'exact' }),
      ]);

      const activeOrders = orders.data?.filter(
        (o) => !['delivered', 'cancelled'].includes(o.status)
      ).length || 0;

      const availableCouriers = couriers.data?.filter((c) => c.is_available).length || 0;

      setStats({
        totalOrders: orders.count || 0,
        activeOrders,
        totalCustomers: customers.count || 0,
        totalPharmacies: pharmacies.count || 0,
        totalCouriers: couriers.count || 0,
        availableCouriers,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApproveMedicine = async (medicineId: string, medicine: PendingMedicine) => {
    try {
      await supabase.from('medicines').insert([
        {
          name: medicine.name,
          dosage: medicine.dosage,
          form: medicine.form,
          is_active: true,
        },
      ]);

      await supabase
        .from('pending_medicines')
        .update({ status: 'approved' })
        .eq('id', medicineId);

      alert('Médicament approuvé et ajouté à la base de données');
      loadPendingMedicines();
    } catch (error) {
      console.error('Error approving medicine:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleRejectMedicine = async (medicineId: string) => {
    try {
      await supabase
        .from('pending_medicines')
        .update({ status: 'rejected' })
        .eq('id', medicineId);

      alert('Proposition rejetée');
      loadPendingMedicines();
    } catch (error) {
      console.error('Error rejecting medicine:', error);
      alert('Erreur lors du rejet');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pharmu Admin</h1>
                <p className="text-xs text-gray-600">Supervision et gestion</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{profile?.full_name}</span>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-pink-600 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <div className="text-sm text-gray-600">Commandes totales</div>
                <div className="text-xs text-pink-600 font-medium mt-1">
                  {stats.activeOrders} actives
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <div className="text-sm text-gray-600">Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalPharmacies}</div>
                <div className="text-sm text-gray-600">Pharmacies</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-3 rounded-lg">
                <Truck className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCouriers}</div>
                <div className="text-sm text-gray-600">Livreurs</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {stats.availableCouriers} disponibles
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            Médicaments en attente de validation ({pendingMedicines.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
            </div>
          ) : pendingMedicines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune proposition en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{medicine.name}</div>
                    <div className="flex gap-2 mt-1">
                      {medicine.dosage && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {medicine.dosage}
                        </span>
                      )}
                      {medicine.form && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {medicine.form}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Proposé le {new Date(medicine.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectMedicine(medicine.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Rejeter"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleApproveMedicine(medicine.id, medicine)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                      title="Approuver"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
