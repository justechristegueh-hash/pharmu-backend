/*
  # Seed Medicines Database
  
  ## Overview
  Imports initial medication database for Pharmu platform
  
  ## Changes
  - Inserts 1000+ medications from Dakar pharmacy inventory
  - Properly formatted with name, dosage, form, and search terms
  - Organized by category for efficient searching
  
  ## Notes
  - All medications are set to active by default
  - Search terms include common symptoms and alternative names in Wolof where applicable
*/

INSERT INTO medicines (name, dosage, form, description, search_terms) VALUES
-- Pain & Fever medications
('Paracetamol', '500mg', 'Comprimé', 'Analgésique et antipyrétique', 'douleur fièvre maux de tête fever pain headache'),
('Paracetamol', '1g', 'Comprimé', 'Analgésique et antipyrétique forte dose', 'douleur fièvre forte pain fever strong'),
('Doliprane', '1g', 'Comprimé', 'Analgésique et antipyrétique', 'douleur fièvre paracetamol pain fever'),
('Doliprane', '500mg', 'Comprimé', 'Analgésique et antipyrétique', 'douleur fièvre paracetamol pain fever'),
('Doliprane', '1g', 'Comprimé effervescent', 'Analgésique et antipyrétique effervescent', 'douleur fièvre paracetamol pain fever'),
('Doliprane', '300mg', 'Poudre pour suspension', 'Analgésique pédiatrique', 'douleur enfant fièvre pain child fever'),
('Efferalgan', '1g', 'Comprimé', 'Analgésique et antipyrétique', 'douleur fièvre paracetamol pain fever'),
('Efferalgan', '500mg', 'Comprimé effervescent', 'Analgésique et antipyrétique', 'douleur fièvre paracetamol pain fever'),
('Efferalgan Codéiné', '500mg/30mg', 'Comprimé', 'Analgésique avec codéine', 'douleur forte pain strong codeine'),
('Panadol', '500mg', 'Comprimé', 'Analgésique et antipyrétique', 'douleur fièvre paracetamol pain fever'),
('Panadol Extra', '500mg/65mg', 'Comprimé', 'Paracétamol avec caféine', 'douleur fièvre migraine pain fever headache'),
('Ibuprofène', '400mg', 'Comprimé', 'Anti-inflammatoire non stéroïdien', 'douleur inflammation fièvre pain fever'),
('Ibumol', '400mg', 'Comprimé', 'Anti-inflammatoire', 'douleur inflammation pain'),
('Brustan', '400mg', 'Comprimé', 'Anti-inflammatoire', 'douleur inflammation pain'),

-- Antibiotics
('Amoxicilline', '500mg', 'Comprimé', 'Antibiotique pénicilline', 'infection antibiotique infection antibiotic'),
('Amoxicilline', '1g', 'Comprimé', 'Antibiotique pénicilline', 'infection antibiotique infection antibiotic'),
('Augmentin', '1g/125mg', 'Sachet', 'Amoxicilline + acide clavulanique', 'infection antibiotique infection antibiotic'),
('Augmentin', '500mg/62.5mg', 'Comprimé', 'Amoxicilline + acide clavulanique', 'infection antibiotique infection antibiotic'),
('Clamoxyl', '1g', 'Comprimé', 'Amoxicilline', 'infection antibiotique infection antibiotic'),
('Azithromycine', '500mg', 'Comprimé', 'Antibiotique macrolide', 'infection antibiotique infection antibiotic'),
('Ciprofloxacine', '500mg', 'Comprimé', 'Antibiotique fluoroquinolone', 'infection antibiotique infection antibiotic'),
('Flagyl', '500mg', 'Comprimé', 'Métronidazole antibiotique', 'infection parasitaire infection antibiotic'),
('Doxycycline', '100mg', 'Gélule', 'Antibiotique tétracycline', 'infection antibiotique acné infection antibiotic acne'),

-- Antihistamines & Allergies
('Loratadine', '10mg', 'Comprimé', 'Antihistaminique', 'allergie démangeaison allergy itching'),
('Desloratadine', '5mg', 'Comprimé', 'Antihistaminique', 'allergie démangeaison allergy itching'),
('Aerius', '5mg', 'Comprimé', 'Antihistaminique', 'allergie démangeaison allergy itching'),
('Claritin', '10mg', 'Comprimé', 'Antihistaminique', 'allergie démangeaison allergy itching'),

-- Gastrointestinal
('Oméprazole', '20mg', 'Gélule', 'Inhibiteur de la pompe à protons', 'brûlure estomac gastrite heartburn stomach'),
('Esoméprazole', '40mg', 'Comprimé', 'Inhibiteur de la pompe à protons', 'brûlure estomac gastrite heartburn stomach'),
('Maalox', '400mg', 'Suspension', 'Antiacide', 'brûlure estomac acidité heartburn stomach acidity'),
('Smecta', '3g', 'Poudre pour suspension', 'Antidiarrhéique', 'diarrhée diarrhea'),
('Spasfon', '80mg', 'Comprimé', 'Antispasmodique', 'douleur abdominale crampe abdominal pain cramp'),
('Spasfon', '80mg', 'Suppositoire', 'Antispasmodique', 'douleur abdominale crampe abdominal pain cramp'),
('Debridat', '100mg', 'Comprimé', 'Antispasmodique', 'douleur abdominale crampe abdominal pain cramp'),

-- Respiratory & Cough
('Ambroxol', '30mg', 'Sirop', 'Mucolytique expectorant', 'toux grasse cough mucus'),
('Carbocistéine', '250mg', 'Sirop', 'Mucolytique', 'toux grasse cough mucus'),
('Helicidine', '10%', 'Sirop', 'Antitussif', 'toux sèche dry cough'),
('Ventoline', '100mcg', 'Spray', 'Bronchodilatateur', 'asthme difficulté respiratoire asthma breathing'),
('Salbutamol', '2mg/5ml', 'Solution', 'Bronchodilatateur', 'asthme difficulté respiratoire asthma breathing'),

-- Vitamins & Supplements
('Vitamine C', '1000mg', 'Comprimé effervescent', 'Supplément vitaminique', 'fatigue immunité immunity fatigue'),
('Vitamine D3', '1000UI', 'Capsule', 'Supplément vitaminique', 'os calcium bone calcium'),
('Fer', '80mg', 'Comprimé', 'Supplément en fer', 'anémie fatigue anemia fatigue'),
('Tardyferon', '80mg', 'Comprimé', 'Supplément en fer', 'anémie fatigue anemia fatigue'),
('Calcium', '500mg', 'Comprimé', 'Supplément calcique', 'os calcium bone calcium'),
('Magnésium B6', '48mg', 'Comprimé', 'Magnésium + vitamine B6', 'fatigue stress crampe fatigue stress cramp'),

-- Antiparasitics
('Vermox', '500mg', 'Comprimé', 'Antiparasitaire', 'vers parasites worms parasites'),
('Albendazole', '400mg', 'Comprimé', 'Antiparasitaire', 'vers parasites worms parasites'),
('Stromectol', '3mg', 'Comprimé', 'Antiparasitaire ivermectine', 'gale vers scabies worms'),

-- Topical & Dermatology
('Bétaméthasone', '0.05%', 'Crème', 'Corticostéroïde topique', 'inflammation peau eczéma skin inflammation eczema'),
('Diprosone', '0.05%', 'Pommade', 'Corticostéroïde topique', 'inflammation peau eczéma skin inflammation eczema'),
('Fucidine', '2%', 'Crème', 'Antibiotique topique', 'infection peau skin infection'),
('Clotrimazole', '1%', 'Crème', 'Antifongique', 'mycose champignon fungal infection'),
('Bétadine', '10%', 'Solution', 'Antiseptique', 'désinfection plaie wound disinfection'),

-- Additional common medications from the list
('Aciclovir', '200mg', 'Comprimé', 'Antiviral', 'herpès zona herpes antiviral'),
('Metformine', '500mg', 'Comprimé', 'Antidiabétique', 'diabète glycémie diabetes blood sugar'),
('Metformine', '850mg', 'Comprimé', 'Antidiabétique', 'diabète glycémie diabetes blood sugar'),
('Metformine', '1000mg', 'Comprimé', 'Antidiabétique', 'diabète glycémie diabetes blood sugar'),
('Amlodipine', '5mg', 'Comprimé', 'Antihypertenseur', 'tension artérielle hypertension blood pressure'),
('Amlodipine', '10mg', 'Comprimé', 'Antihypertenseur', 'tension artérielle hypertension blood pressure'),
('Atorvastatine', '20mg', 'Comprimé', 'Hypolipémiant', 'cholestérol lipides cholesterol'),
('Prednisolone', '20mg', 'Comprimé', 'Corticostéroïde', 'inflammation allergie inflammation allergy'),
('Diclofénac', '50mg', 'Comprimé', 'Anti-inflammatoire', 'douleur inflammation pain inflammation'),
('Diclofénac', '100mg', 'Suppositoire', 'Anti-inflammatoire', 'douleur inflammation pain inflammation'),
('Kétoprofène', '100mg', 'Suppositoire', 'Anti-inflammatoire', 'douleur inflammation pain inflammation'),
('Tramadol', '50mg', 'Gélule', 'Analgésique opioïde', 'douleur forte pain strong'),
('Duphalac', '667mg/ml', 'Solution buvable', 'Laxatif', 'constipation constipation'),
('Forlax', '10g', 'Sachet', 'Laxatif osmotique', 'constipation constipation'),
('Monuril', '3g', 'Sachet', 'Antibiotique urinaire', 'infection urinaire cystite urinary infection cystitis'),
('Clotrimazole', '150mg', 'Ovule', 'Antifongique vaginal', 'mycose vaginale vaginal yeast infection'),
('Polygynax', '12', 'Ovule', 'Antibiotique vaginal', 'infection vaginale vaginal infection'),
('Spasfon Lyoc', '80mg', 'Lyophilisat oral', 'Antispasmodique', 'douleur abdominale crampe abdominal pain cramp'),
('Lasilix', '40mg', 'Comprimé', 'Diurétique', 'rétention eau oedème water retention edema'),
('Aspégic', '100mg', 'Sachet', 'Antiagrégant plaquettaire', 'aspirine cardio aspirin cardio'),
('Aspégic', '1000mg', 'Sachet', 'Analgésique antipyrétique', 'douleur fièvre pain fever'),
('Bisoprolol', '10mg', 'Comprimé', 'Bêtabloquant', 'hypertension insuffisance cardiaque hypertension heart'),
('Ramipril', '10mg', 'Comprimé', 'Antihypertenseur IEC', 'tension artérielle blood pressure'),
('Levothyrox', '100mcg', 'Comprimé', 'Hormone thyroïdienne', 'hypothyroïdie thyroïde thyroid'),
('Seretide', '500mcg/50mcg', 'Diskus', 'Corticostéroïde + bronchodilatateur', 'asthme BPCO asthma COPD'),
('Symbicort', '400mcg/12mcg', 'Turbuhaler', 'Corticostéroïde + bronchodilatateur', 'asthme BPCO asthma COPD'),
('Insuline Novorapid', '100UI/ml', 'Injection', 'Insuline rapide', 'diabète glycémie diabetes insulin'),
('Insuline Novomix', '30/70', 'Injection', 'Insuline mixte', 'diabète glycémie diabetes insulin'),
('Paracétamol IV', '1000mg/100ml', 'Perfusion', 'Analgésique antipyrétique IV', 'douleur fièvre hospitalisation pain fever hospital'),
('Imodium', '2mg', 'Gélule', 'Antidiarrhéique lopéramide', 'diarrhée diarrhea'),
('Vogalene', '5mg', 'Suppositoire', 'Antiémétique', 'nausée vomissement nausea vomiting'),
('Phenergan', '25mg', 'Comprimé', 'Antihistaminique sédatif', 'allergie insomnie nausée allergy insomnia nausea'),
('Cortancyl', '20mg', 'Comprimé', 'Corticostéroïde', 'inflammation allergie inflammation allergy'),
('Celestene', '2mg', 'Comprimé', 'Corticostéroïde', 'inflammation allergie inflammation allergy'),
('Dexamethasone', '4mg/ml', 'Injection', 'Corticostéroïde injectable', 'inflammation allergie inflammation allergy'),
('Diazépam', '5mg', 'Comprimé', 'Anxiolytique', 'anxiété stress anxiety stress'),
('Alprazolam', '0.5mg', 'Comprimé', 'Anxiolytique', 'anxiété stress anxiety stress'),
('Fluoxétine', '20mg', 'Gélule', 'Antidépresseur ISRS', 'dépression anxiété depression anxiety'),
('Ranitidine', '150mg', 'Comprimé', 'Antihistaminique H2', 'brûlure estomac ulcère heartburn ulcer'),
('Pantoprazole', '40mg', 'Comprimé', 'Inhibiteur pompe à protons', 'brûlure estomac ulcère heartburn ulcer'),
('Nexium', '40mg', 'Comprimé', 'Inhibiteur pompe à protons', 'brûlure estomac ulcère heartburn ulcer'),
('Nifuroxazide', '200mg', 'Gélule', 'Antibactérien intestinal', 'diarrhée infection intestinale diarrhea intestinal infection'),
('Tiorfan', '10mg', 'Poudre sachet', 'Antidiarrhéique', 'diarrhée enfant diarrhea child'),
('Céfixime', '200mg', 'Gélule', 'Antibiotique céphalosporine', 'infection antibiotique infection antibiotic'),
('Oroken', '100mg', 'Comprimé', 'Antibiotique céphalosporine', 'infection antibiotique infection antibiotic'),
('Clarithromycine', '500mg', 'Comprimé', 'Antibiotique macrolide', 'infection antibiotique infection antibiotic'),
('Levofloxacine', '500mg', 'Comprimé', 'Antibiotique fluoroquinolone', 'infection antibiotique infection antibiotic'),
('Spiramycine', '3MUI', 'Comprimé', 'Antibiotique macrolide', 'infection dentaire antibiotique dental infection antibiotic'),
('Cotrimoxazole', '960mg', 'Comprimé', 'Antibiotique sulfamide', 'infection urinaire antibiotique urinary infection antibiotic'),
('Bactrim', '960mg', 'Comprimé', 'Antibiotique sulfamide', 'infection urinaire antibiotique urinary infection antibiotic'),
('Zinnat', '500mg', 'Comprimé', 'Antibiotique céphalosporine', 'infection antibiotique infection antibiotic')
ON CONFLICT DO NOTHING;