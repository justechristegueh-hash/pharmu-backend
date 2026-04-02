import { useState, useEffect } from 'react';
import { Search, Plus, PlusCircle } from 'lucide-react';
import { supabase, Medicine } from '../../lib/supabase';

interface MedicineSearchProps {
  onAddToCart: (medicine: Medicine, quantity: number) => void;
}

export function MedicineSearch({ onAddToCart }: MedicineSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalName, setProposalName] = useState('');
  const [proposalDosage, setProposalDosage] = useState('');
  const [proposalForm, setProposalForm] = useState('');

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMedicines(medicines.slice(0, 20));
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = medicines.filter(
        (med) =>
          med.name.toLowerCase().includes(term) ||
          med.dosage?.toLowerCase().includes(term) ||
          med.form?.toLowerCase().includes(term) ||
          med.search_terms?.toLowerCase().includes(term)
      );
      setFilteredMedicines(filtered);
    }
  }, [searchTerm, medicines]);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
      setFilteredMedicines((data || []).slice(0, 20));
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('pending_medicines')
        .insert([
          {
            proposed_by: user.id,
            name: proposalName,
            dosage: proposalDosage,
            form: proposalForm,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      alert('Votre proposition a été envoyée. Elle sera examinée par un administrateur.');
      setShowProposalForm(false);
      setProposalName('');
      setProposalDosage('');
      setProposalForm('');
    } catch (error) {
      console.error('Error proposing medicine:', error);
      alert('Erreur lors de la proposition du médicament.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-pink-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Suqali - Recherchez par nom, dosage, forme ou symptôme..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredMedicines.length} médicament(s) trouvé(s)
          </p>
          <button
            onClick={() => setShowProposalForm(!showProposalForm)}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            Proposer un médicament
          </button>
        </div>
      </div>

      {showProposalForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Proposer un médicament</h3>
          <form onSubmit={handleProposeMedicine} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du médicament
              </label>
              <input
                type="text"
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={proposalDosage}
                  onChange={(e) => setProposalDosage(e.target.value)}
                  placeholder="Ex: 500mg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forme
                </label>
                <select
                  value={proposalForm}
                  onChange={(e) => setProposalForm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="">Sélectionner</option>
                  <option value="Comprimé">Comprimé</option>
                  <option value="Gélule">Gélule</option>
                  <option value="Sirop">Sirop</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Injection">Injection</option>
                  <option value="Pommade">Pommade</option>
                  <option value="Crème">Crème</option>
                  <option value="Suppositoire">Suppositoire</option>
                  <option value="Ovule">Ovule</option>
                  <option value="Spray">Spray</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition"
              >
                Soumettre
              </button>
              <button
                type="button"
                onClick={() => setShowProposalForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {medicine.dosage && (
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        {medicine.dosage}
                      </span>
                    )}
                    {medicine.form && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {medicine.form}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {medicine.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {medicine.description}
                </p>
              )}
              <button
                onClick={() => onAddToCart(medicine, 1)}
                className="w-full bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter au panier
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredMedicines.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun médicament trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez une autre recherche ou proposez un nouveau médicament.
          </p>
          <button
            onClick={() => setShowProposalForm(true)}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition"
          >
            Proposer un médicament
          </button>
        </div>
      )}
    </div>
  );
}
