import { useState } from 'react';
import { ShoppingCart, Minus, Plus, X, Zap, Clock, CreditCard } from 'lucide-react';
import { Medicine } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CartProps {
  items: { medicine: Medicine; quantity: number }[];
  onUpdateQuantity: (medicineId: string, quantity: number) => void;
  onRemove: (medicineId: string) => void;
  location: { lat: number; lng: number } | null;
  address: string;
  onCheckout: (orderId: string) => void;
}

type DeliveryType = 'express' | 'standard';
type PaymentMethod = 'wallet' | 'wave' | 'orange_money';

export function Cart({ items, onUpdateQuantity, onRemove, location, address, onCheckout }: CartProps) {
  const { profile } = useAuth();
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);

  const deliveryFees = {
    express: 2000,
    standard: 1000,
  };

  const deliveryFee = deliveryFees[deliveryType];

  const handlePlaceOrder = async () => {
    if (!location) {
      alert('Veuillez activer la géolocalisation');
      return;
    }

    if (!address.trim()) {
      alert('Veuillez entrer votre adresse');
      return;
    }

    if (!phone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: profile?.id,
            delivery_type: deliveryType,
            status: 'pending',
            delivery_address: address,
            delivery_latitude: location.lat,
            delivery_longitude: location.lng,
            delivery_details: deliveryDetails,
            customer_phone: phone,
            medicine_price: 0,
            delivery_fee: deliveryFee,
            total_amount: deliveryFee,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        medicine_id: item.medicine.id,
        quantity: item.quantity,
        unit_price: 0,
        subtotal: 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            order_id: orderData.id,
            user_id: profile?.id,
            amount: deliveryFee,
            method: paymentMethod,
            status: 'completed',
            transaction_id: `TXN-${Date.now()}`,
          },
        ]);

      if (paymentError) throw paymentError;

      alert('Commande passée avec succès! La pharmacie va confirmer la disponibilité et le prix.');
      onCheckout(orderData.id);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Votre panier est vide
        </h3>
        <p className="text-gray-600">
          Ajoutez des médicaments depuis la recherche Suqali
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Vos médicaments</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.medicine.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.medicine.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {item.medicine.dosage && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        {item.medicine.dosage}
                      </span>
                    )}
                    {item.medicine.form && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {item.medicine.form}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.medicine.id, item.quantity - 1)}
                    className="p-1 bg-white rounded hover:bg-gray-100 transition"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.medicine.id, item.quantity + 1)}
                    className="p-1 bg-white rounded hover:bg-gray-100 transition"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={() => onRemove(item.medicine.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Type de livraison</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDeliveryType('express')}
              className={`p-4 border-2 rounded-xl transition ${
                deliveryType === 'express'
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <Zap className={`w-6 h-6 mb-2 ${deliveryType === 'express' ? 'text-pink-600' : 'text-gray-600'}`} />
              <div className="font-semibold">EXPRESS</div>
              <div className="text-sm text-gray-600">≤ 30 minutes</div>
              <div className="text-pink-600 font-bold mt-2">{deliveryFees.express} FCFA</div>
            </button>
            <button
              onClick={() => setDeliveryType('standard')}
              className={`p-4 border-2 rounded-xl transition ${
                deliveryType === 'standard'
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <Clock className={`w-6 h-6 mb-2 ${deliveryType === 'standard' ? 'text-pink-600' : 'text-gray-600'}`} />
              <div className="font-semibold">STANDARD</div>
              <div className="text-sm text-gray-600">≤ 1 heure</div>
              <div className="text-pink-600 font-bold mt-2">{deliveryFees.standard} FCFA</div>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Détails de livraison</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse complète
              </label>
              <input
                type="text"
                value={address}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Détails (immeuble, étage, etc.)
              </label>
              <textarea
                value={deliveryDetails}
                onChange={(e) => setDeliveryDetails(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                placeholder="Bâtiment, étage, numéro de porte..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Paiement</h2>
          <div className="space-y-2">
            {[
              { value: 'wave', label: 'Wave', icon: CreditCard },
              { value: 'orange_money', label: 'Orange Money', icon: CreditCard },
              { value: 'wallet', label: 'Wallet Pharmu', icon: CreditCard },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value as PaymentMethod)}
                className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg transition ${
                  paymentMethod === method.value
                    ? 'border-pink-600 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <method.icon className={`w-5 h-5 ${paymentMethod === method.value ? 'text-pink-600' : 'text-gray-600'}`} />
                <span className={`font-medium ${paymentMethod === method.value ? 'text-pink-600' : 'text-gray-700'}`}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Prix des médicaments</span>
              <span className="font-medium">Défini par la pharmacie</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Frais de livraison</span>
              <span className="font-medium">{deliveryFee} FCFA</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>Total à payer</span>
              <span className="text-pink-600">{deliveryFee} FCFA</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Le prix final sera confirmé par la pharmacie
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !location || !address}
            className="w-full mt-6 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Traitement...' : 'Commander maintenant'}
          </button>
        </div>
      </div>
    </div>
  );
}
