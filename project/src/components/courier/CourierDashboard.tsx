import { useState, useEffect } from 'react';
import { Truck, MapPin, Package, CheckCircle, LogOut, User, Navigation } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Order {
  id: string;
  status: string;
  delivery_type: string;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  customer_phone: string;
  total_amount: number;
  created_at: string;
  pharmacy: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
  } | null;
}

export function CourierDashboard() {
  const { profile, signOut } = useAuth();
  const [courierId, setCourierId] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('assigned');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourier();
  }, [profile?.id]);

  useEffect(() => {
    if (courierId) {
      loadCurrentOrder();

      const channel = supabase
        .channel('courier-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `courier_id=eq.${courierId}`,
          },
          () => {
            loadCurrentOrder();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [courierId]);

  const loadCourier = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCourierId(data.id);
        setIsAvailable(data.is_available);
      }
    } catch (error) {
      console.error('Error loading courier:', error);
    }
  };

  const loadCurrentOrder = async () => {
    if (!courierId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacy:pharmacies(name, address, latitude, longitude, phone)
        `)
        .eq('courier_id', courierId)
        .in('status', ['ready', 'in_transit'])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentOrder(data as unknown as Order);

      if (data) {
        const { data: deliveryData } = await supabase
          .from('deliveries')
          .select('status')
          .eq('order_id', data.id)
          .maybeSingle();

        if (deliveryData) {
          setDeliveryStatus(deliveryData.status);
        }
      }
    } catch (error) {
      console.error('Error loading current order:', error);
    }
  };

  const toggleAvailability = async () => {
    if (!courierId) return;

    try {
      const { error } = await supabase
        .from('couriers')
        .update({ is_available: !isAvailable })
        .eq('id', courierId);

      if (error) throw error;
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const updateDeliveryStatus = async (newStatus: string) => {
    if (!currentOrder) return;

    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          await supabase
            .from('deliveries')
            .update({
              status: newStatus,
              courier_latitude: position.coords.latitude,
              courier_longitude: position.coords.longitude,
              updated_at: new Date().toISOString(),
            })
            .eq('order_id', currentOrder.id);

          if (newStatus === 'picked_up') {
            await supabase
              .from('orders')
              .update({ status: 'in_transit' })
              .eq('id', currentOrder.id);
          } else if (newStatus === 'delivered') {
            await supabase
              .from('orders')
              .update({
                status: 'delivered',
                delivered_at: new Date().toISOString(),
              })
              .eq('id', currentOrder.id);

            await supabase
              .from('couriers')
              .update({
                total_deliveries: supabase.rpc('increment', { row_id: courierId }),
              })
              .eq('id', courierId);
          }

          setDeliveryStatus(newStatus);
          if (newStatus === 'delivered') {
            setCurrentOrder(null);
            alert('Livraison terminée avec succès!');
          }
        });
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const openMaps = (lat: number, lng: number, label: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pharmu Livreur</h1>
                <p className="text-xs text-gray-600">Livraison de médicaments</p>
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

          <div className="mt-4">
            <button
              onClick={toggleAvailability}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isAvailable
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {isAvailable ? '✓ Disponible' : '✕ Indisponible'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {currentOrder ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Livraison en cours</h2>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  {currentOrder.delivery_type === 'express' ? 'EXPRESS ⚡' : 'STANDARD'}
                </span>
              </div>

              <div className="space-y-6">
                {deliveryStatus === 'assigned' || deliveryStatus === 'en_route_to_pharmacy' ? (
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Étape 1: Récupérer à la pharmacie</h3>
                        <p className="text-sm text-gray-600">{currentOrder.pharmacy?.name}</p>
                        <p className="text-sm text-gray-600">{currentOrder.pharmacy?.address}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Tel: {currentOrder.pharmacy?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          currentOrder.pharmacy &&
                          openMaps(
                            currentOrder.pharmacy.latitude,
                            currentOrder.pharmacy.longitude,
                            currentOrder.pharmacy.name
                          )
                        }
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-5 h-5" />
                        Navigation
                      </button>
                      <button
                        onClick={() => updateDeliveryStatus('picked_up')}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Récupéré
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Étape 2: Livrer au client</h3>
                        <p className="text-sm text-gray-600">{currentOrder.delivery_address}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Tel: {currentOrder.customer_phone}
                        </p>
                      </div>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Montant à collecter:</span>
                        <span className="text-2xl font-bold text-pink-600">
                          {currentOrder.total_amount} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          openMaps(
                            currentOrder.delivery_latitude,
                            currentOrder.delivery_longitude,
                            currentOrder.delivery_address
                          )
                        }
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-5 h-5" />
                        Navigation
                      </button>
                      <button
                        onClick={() => updateDeliveryStatus('delivered')}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Livré
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'assigned' || deliveryStatus === 'en_route_to_pharmacy' ? 'bg-pink-600' : 'bg-green-600'}`}></div>
                    <span className={`text-sm ${deliveryStatus === 'assigned' || deliveryStatus === 'en_route_to_pharmacy' ? 'font-semibold' : 'text-gray-600'}`}>
                      En route vers la pharmacie
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'picked_up' ? 'bg-pink-600' : deliveryStatus === 'delivered' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span className={`text-sm ${deliveryStatus === 'picked_up' ? 'font-semibold' : deliveryStatus === 'delivered' ? 'text-gray-600' : 'text-gray-400'}`}>
                      Médicaments récupérés
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'en_route_to_customer' ? 'bg-pink-600' : deliveryStatus === 'delivered' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span className={`text-sm ${deliveryStatus === 'en_route_to_customer' ? 'font-semibold' : deliveryStatus === 'delivered' ? 'text-gray-600' : 'text-gray-400'}`}>
                      En route vers le client
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${deliveryStatus === 'delivered' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span className={`text-sm ${deliveryStatus === 'delivered' ? 'font-semibold text-green-600' : 'text-gray-400'}`}>
                      Livré
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isAvailable ? 'En attente de livraison' : 'Vous êtes indisponible'}
            </h3>
            <p className="text-gray-600">
              {isAvailable
                ? 'Une livraison vous sera attribuée automatiquement'
                : 'Activez votre disponibilité pour recevoir des livraisons'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
