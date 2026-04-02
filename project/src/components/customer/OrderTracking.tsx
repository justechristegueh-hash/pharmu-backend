import { useState, useEffect } from 'react';
import { Clock, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  id: string;
  status: string;
  delivery_type: string;
  delivery_address: string;
  delivery_fee: number;
  medicine_price: number;
  total_amount: number;
  created_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  pharmacy: {
    name: string;
    address: string;
  } | null;
  courier: {
    full_name: string;
    phone: string;
  } | null;
  order_items: {
    quantity: number;
    medicine: {
      name: string;
      dosage: string;
      form: string;
    } | null;
  }[];
}

interface OrderTrackingProps {
  orderId: string | null;
}

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${profile?.id}`,
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o.id === orderId);
      if (order) setSelectedOrder(order);
    }
  }, [orderId, orders]);

  const loadOrders = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacy:pharmacies(name, address),
          courier:couriers(full_name, phone),
          order_items(
            quantity,
            medicine:medicines(name, dosage, form)
          )
        `)
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as unknown as Order[]);

      if (data && data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0] as unknown as Order);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
      pending: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
      accepted: { label: 'Acceptée', color: 'text-blue-600 bg-blue-50', icon: Package },
      preparing: { label: 'En préparation', color: 'text-blue-600 bg-blue-50', icon: Package },
      ready: { label: 'Prête', color: 'text-green-600 bg-green-50', icon: Package },
      in_transit: { label: 'En livraison', color: 'text-purple-600 bg-purple-50', icon: Truck },
      delivered: { label: 'Livrée', color: 'text-green-600 bg-green-50', icon: CheckCircle },
      cancelled: { label: 'Annulée', color: 'text-red-600 bg-red-50', icon: Clock },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune commande
        </h3>
        <p className="text-gray-600">
          Vos commandes apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Mes commandes</h2>
          <div className="space-y-2">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

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
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4 text-pink-600" />
                      <span className="text-sm font-medium">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {order.order_items.length} médicament(s)
                  </div>
                  <div className="text-sm font-semibold text-pink-600 mt-1">
                    {order.total_amount} FCFA
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Détails de la commande</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                  {getStatusInfo(selectedOrder.status).label}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Médicaments</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.medicine?.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.medicine?.dosage} - {item.medicine?.form}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Qté: {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Adresse de livraison</div>
                      <div className="text-sm text-gray-600">{selectedOrder.delivery_address}</div>
                    </div>
                  </div>
                </div>

                {selectedOrder.pharmacy && (
                  <div className="border-t pt-4">
                    <div className="font-semibold mb-2">Pharmacie</div>
                    <div className="text-sm">
                      <div className="font-medium">{selectedOrder.pharmacy.name}</div>
                      <div className="text-gray-600">{selectedOrder.pharmacy.address}</div>
                    </div>
                  </div>
                )}

                {selectedOrder.courier && (
                  <div className="border-t pt-4">
                    <div className="font-semibold mb-2">Livreur</div>
                    <div className="text-sm">
                      <div className="font-medium">{selectedOrder.courier.full_name}</div>
                      <div className="text-gray-600">{selectedOrder.courier.phone}</div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Prix des médicaments</span>
                    <span className="font-medium">{selectedOrder.medicine_price} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-medium">{selectedOrder.delivery_fee} FCFA</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                    <span>Total</span>
                    <span className="text-pink-600">{selectedOrder.total_amount} FCFA</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="font-semibold mb-3">Suivi</div>
                  <div className="space-y-3">
                    {[
                      { status: 'pending', label: 'Commande passée', time: selectedOrder.created_at },
                      { status: 'accepted', label: 'Acceptée par la pharmacie', time: selectedOrder.accepted_at },
                      { status: 'ready', label: 'Prête pour livraison', time: selectedOrder.ready_at },
                      { status: 'delivered', label: 'Livrée', time: selectedOrder.delivered_at },
                    ].map((step, index) => {
                      const isComplete = step.time !== null;
                      const isCurrent = selectedOrder.status === step.status && !isComplete;

                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-600' : isCurrent ? 'bg-pink-600' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${isComplete || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                              {step.label}
                            </div>
                            {step.time && (
                              <div className="text-xs text-gray-600">
                                {new Date(step.time).toLocaleString('fr-FR')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
