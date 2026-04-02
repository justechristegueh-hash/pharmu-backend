import { useState, useEffect } from 'react';
import { Search, MapPin, ShoppingCart, Clock, Zap, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Medicine } from '../../lib/supabase';
import { MedicineSearch } from './MedicineSearch';
import { Cart } from './Cart';
import { OrderTracking } from './OrderTracking';

type View = 'search' | 'cart' | 'tracking';

export function CustomerDashboard() {
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<View>('search');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [cartItems, setCartItems] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const addToCart = (medicine: Medicine, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { medicine, quantity }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCartItems((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      )
    );
  };

  const handleCheckout = (orderId: string) => {
    setActiveOrderId(orderId);
    setCartItems([]);
    setView('tracking');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-lg">
                <Search className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pharmu</h1>
                <p className="text-xs text-gray-600">Suqali - Recherche intelligente</p>
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

          <div className="mt-4 flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-pink-600" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Entrez votre adresse"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-[120px] z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setView('search')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
                view === 'search'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <Search className="w-4 h-4" />
              Suqali
            </button>
            <button
              onClick={() => setView('cart')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition relative ${
                view === 'cart'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Panier
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView('tracking')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition ${
                view === 'tracking'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              Suivi
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'search' && (
          <MedicineSearch onAddToCart={addToCart} />
        )}
        {view === 'cart' && (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            location={location}
            address={address}
            onCheckout={handleCheckout}
          />
        )}
        {view === 'tracking' && (
          <OrderTracking orderId={activeOrderId} />
        )}
      </main>
    </div>
  );
}
