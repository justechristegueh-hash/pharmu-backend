import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, X, LogOut, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  id: string;
  status: string;
  delivery_type: string;
  delivery_address: string;
  customer_phone: string;
  delivery_fee: number;
  medicine_price: number;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    medicine: {
      name: string;
      dosage: string;
      form: string;
    } | null;
  }[];
}

export function PharmacyDashboard() {
  const { profile, signOut } = useAuth();
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPharmacy();
  }, [profile?.id]);

  useEffect(() => {
    if (pharmacyId) {
      loadOrders();

      const channel = supabase
        .channel('pharmacy-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `pharmacy_id=eq.${pharmacyId}`,
          },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [pharmacyId]);

  const loadPharmacy = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setPharmacyId(data.id);
    } catch (error) {
      console.error('Error loading pharmacy:', error);
    }
  };

  const loadOrders = async () => {
    if (!pharmacyId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            unit_price,
            medicine:medicines(name, dosage, form)
          )
        `)
        .eq('pharmacy_id', pharmacyId)
        .in('status', ['pending', 'accepted', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as unknown as Order[]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;

    const totalMedicinePrice = Object.values(prices).reduce((sum, price) => sum + price, 0);

    if (totalMedicinePrice === 0) {
      alert('Veuillez définir les prix de tous les médicaments');
      return;
    }

    try {
      for (const itemId in prices) {
        const item = selectedOrder.order_items.find(i => i.id === itemId);
        if (!item) continue;

        const unitPrice = prices[itemId];
        const subtotal = unitPrice * item.quantity;

        await supabase
          .from('order_items')
          .update({
            unit_price: unitPrice,
            subtotal: subtotal,
          })
          .eq('id', itemId);
      }

      const newTotal = totalMedicinePrice + selectedOrder.delivery_fee;

      await supabase
        .from('orders')
        .update({
          status: 'accepted',
          medicine_price: totalMedicinePrice,
          total_amount: newTotal,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', selectedOrder.id);

      alert('Commande acceptée avec succès!');
      setPrices({});
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Erreur lors de l\'acceptation de la commande');
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;

    if (!confirm('Voulez-vous vraiment refuser cette commande?')) return;

    try {
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
        })
        .eq('id', selectedOrder.id);

      alert('Commande refusée');
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Erreur lors du refus de la commande');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({
          status: 'ready',
          ready_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      alert('Commande marquée comme prête!');
      loadOrders();
    } catch (error) {
      console.error('Error marking order as ready:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Nouvelle', color: 'bg-yellow-100 text-yellow-700' },
      accepted: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700' },
      preparing: { label: 'En préparation', color: 'bg-purple-100 text-purple-700' },
      ready: { label: 'Prête', color: 'bg-green-100 text-green-700' },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Package className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pharmu Pharmacie</h1>
                <p className="text-xs text-gray-600">Gestion des commandes</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{profile?.full_name}</span>
              </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Commandes actives</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucune commande active</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);

                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`w-full text-left p-4 rounded-lg transition ${
                          selectedOrder?.id === order.id
                            ? 'bg-pink-50 border-2 border-pink-600'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {order.order_items.length} médicament(s)
                        </div>
                        {order.delivery_type === 'express' && (
                          <div className="text-xs text-pink-600 font-medium mt-1">
                            EXPRESS ⚡
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Détails de la commande</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedOrder.status).color}`}>
                    {getStatusBadge(selectedOrder.status).label}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Médicaments demandés</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium">{item.medicine?.name}</div>
                              <div className="text-sm text-gray-600">
                                {item.medicine?.dosage} - {item.medicine?.form}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Quantité: {item.quantity}
                              </div>
                            </div>
                          </div>

                          {selectedOrder.status === 'pending' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prix unitaire (FCFA)
                              </label>
                              <input
                                type="number"
                                value={prices[item.id] || ''}
                                onChange={(e) => setPrices({ ...prices, [item.id]: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                                placeholder="0"
                              />
                              {prices[item.id] && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Sous-total: {(prices[item.id] * item.quantity).toFixed(0)} FCFA
                                </div>
                              )}
                            </div>
                          )}

                          {selectedOrder.status !== 'pending' && item.unit_price > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Prix unitaire:</span>
                                <span className="font-medium">{item.unit_price} FCFA</span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold mt-1">
                                <span>Sous-total:</span>
                                <span className="text-pink-600">{item.unit_price * item.quantity} FCFA</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Informations client</h3>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-600">Téléphone:</span>{' '}
                        <span className="font-medium">{selectedOrder.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Adresse:</span>{' '}
                        <span className="font-medium">{selectedOrder.delivery_address}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type de livraison:</span>{' '}
                        <span className="font-medium">
                          {selectedOrder.delivery_type === 'express' ? 'EXPRESS (≤30 min)' : 'STANDARD (≤1h)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.status === 'pending' && (
                    <div className="border-t pt-4">
                      <div className="bg-pink-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Total médicaments:</span>
                          <span className="font-semibold">
                            {Object.values(prices).reduce((sum, price) => sum + price, 0)} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Frais de livraison:</span>
                          <span className="font-semibold">{selectedOrder.delivery_fee} FCFA</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-pink-200">
                          <span>Total:</span>
                          <span className="text-pink-600">
                            {Object.values(prices).reduce((sum, price) => sum + price, 0) + selectedOrder.delivery_fee} FCFA
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleRejectOrder}
                          className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          <X className="w-5 h-5" />
                          Refuser
                        </button>
                        <button
                          onClick={handleAcceptOrder}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Accepter
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedOrder.status === 'accepted' || selectedOrder.status === 'preparing') && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleMarkReady(selectedOrder.id)}
                        className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Marquer comme prête
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'ready' && (
                    <div className="border-t pt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-900">
                          Commande prête pour livraison
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          En attente du livreur
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sélectionnez une commande
                </h3>
                <p className="text-gray-600">
                  Choisissez une commande dans la liste pour voir les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
