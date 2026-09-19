import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function seed() {
  console.log('🧹 Nettoyage des anciennes données...');

  // Delete in order of dependencies
  await prisma.paiement.deleteMany();
  await prisma.demande.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.bureau.deleteMany();

  console.log('✅ Anciennes données supprimées.');

  // Find admin/responsable users to attach requests to
  const users = await prisma.user.findMany();
  const adminUser = users.find(u => u.role === 'admin') || users[0];
  const adminName = adminUser ? `${adminUser.prenom} ${adminUser.nom}` : 'Admin';

  console.log('🏢 Création des 20 bureaux professionnels...');

  const bureauxData = [
    // Étage 1 — Médical & Santé
    {
      numero: 101,
      nom: 'Cabinet Dr. Benjelloun (Médecine Générale)',
      etage: 1,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 1600,
      telephone: '0522 20 11 01',
      email: 'contact@dr-benjelloun.ma',
    },
    {
      numero: 102,
      nom: 'Pharmacie Centrale Al Shifa',
      etage: 1,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 3200,
      telephone: '0522 20 11 02',
      email: 'pharmacie.alshifa@gmail.com',
    },
    {
      numero: 103,
      nom: 'Optique & Vision Noor',
      etage: 1,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 1800,
      telephone: '0522 20 11 03',
      email: 'contact@noor-optique.ma',
    },
    {
      numero: 104,
      nom: "Laboratoire d'Analyses Médicales Ibn Sina",
      etage: 1,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 3500,
      telephone: '0522 20 11 04',
      email: 'contact@labo-ibnsina.ma',
    },
    {
      numero: 105,
      nom: 'Cabinet Dentaire Dr. Tazi',
      etage: 1,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 2000,
      telephone: '0522 20 11 05',
      email: 'cabinet.tazi@gmail.com',
    },

    // Étage 2 — Juridique & Finance
    {
      numero: 201,
      nom: 'Cabinet Me. Alami & Associés (Avocats)',
      etage: 2,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 2800,
      telephone: '0522 30 22 01',
      email: 'contact@alami-avocats.ma',
    },
    {
      numero: 202,
      nom: 'Étude Notariale Me. Berrada',
      etage: 2,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 2200,
      telephone: '0522 30 22 02',
      email: 'etude.berrada@notaires.ma',
    },
    {
      numero: 203,
      nom: 'Fiduciaire Al-Maghrib (Expertise Comptable)',
      etage: 2,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 3000,
      telephone: '0522 30 22 03',
      email: 'contact@fiduciaire-almaghrib.com',
    },
    {
      numero: 204,
      nom: 'Audit & Conseil Stratégie Maroc',
      etage: 2,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 2400,
      telephone: '0522 30 22 04',
      email: 'audit.strategie@gmail.com',
    },
    {
      numero: 205,
      nom: 'Bureau Disponible — Rénové',
      etage: 2,
      type: 'individuel' as const,
      statut: 'inactif' as const,
      cotisation: 1800,
      telephone: '',
      email: '',
    },

    // Étage 3 — Technologies & Ingénierie
    {
      numero: 301,
      nom: 'Atlas Digital Solutions (IA & Dev)',
      etage: 3,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 3400,
      telephone: '0522 40 33 01',
      email: 'contact@atlasdigital.ma',
    },
    {
      numero: 302,
      nom: 'Kettani Architecture & Design',
      etage: 3,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 2600,
      telephone: '0522 40 33 02',
      email: 'kettani.archi@gmail.com',
    },
    {
      numero: 303,
      nom: 'NexGen Marketing & Communication',
      etage: 3,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 1900,
      telephone: '0522 40 33 03',
      email: 'info@nexgen.ma',
    },
    {
      numero: 304,
      nom: "Bureau d'Études BTP & Ingénierie",
      etage: 3,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 2700,
      telephone: '0522 40 33 04',
      email: 'btp.ingenierie@gmail.com',
    },
    {
      numero: 305,
      nom: 'CloudSecure Technologies',
      etage: 3,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 2200,
      telephone: '0522 40 33 05',
      email: 'contact@cloudsecure.ma',
    },

    // Étage 4 — Commerce International & Services
    {
      numero: 401,
      nom: 'Horizon Trading International',
      etage: 4,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 3600,
      telephone: '0522 50 44 01',
      email: 'trading@horizon-group.ma',
    },
    {
      numero: 402,
      nom: 'Agence Immobilière Prestige Al Madina',
      etage: 4,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 2100,
      telephone: '0522 50 44 02',
      email: 'contact@almadina-prestige.ma',
    },
    {
      numero: 403,
      nom: "Cabinet d'Assurances Al Amana",
      etage: 4,
      type: 'individuel' as const,
      statut: 'actif' as const,
      cotisation: 2200,
      telephone: '0522 50 44 03',
      email: 'alamana.assurances@gmail.com',
    },
    {
      numero: 404,
      nom: 'Centre de Formation Continue ENSA Pro',
      etage: 4,
      type: 'centre' as const,
      statut: 'actif' as const,
      cotisation: 3100,
      telephone: '0522 50 44 04',
      email: 'contact@ensapro.ma',
    },
    {
      numero: 405,
      nom: 'Espace Coworking Les Lauriers (En aménagement)',
      etage: 4,
      type: 'centre' as const,
      statut: 'inactif' as const,
      cotisation: 3800,
      telephone: '',
      email: '',
    },
  ];

  const createdBureaux: any[] = [];
  for (const b of bureauxData) {
    const created = await prisma.bureau.create({ data: b });
    createdBureaux.push(created);
  }

  console.log(`✅ ${createdBureaux.length} bureaux créés.`);

  // Connect active bureaux to users
  if (users.length > 0) {
    const activeBureaux = createdBureaux.filter(b => b.statut === 'actif');
    for (let i = 0; i < activeBureaux.length; i++) {
      const u = users[i % users.length];
      await prisma.user.update({
        where: { id_user: u.id_user },
        data: { bureaux: { connect: { id_bureau: activeBureaux[i].id_bureau } } },
      });
    }
  }

  console.log('💳 Génération des paiements 2025 et 2026...');

  const activeBureaux = createdBureaux.filter(b => b.statut === 'actif');
  const paiementsToCreate: any[] = [];

  // --- Année 2025 (Tous les 12 mois pour historique et comparaison) ---
  for (const bureau of activeBureaux) {
    for (let m = 0; m < 12; m++) {
      // 95% paid in 2025
      const isUnpaid = (bureau.numero === 403 && m === 11) || (bureau.numero === 304 && m === 10);
      const day = 5 + (bureau.numero % 20);
      const safeMonth = String(m + 1).padStart(2, '0');
      const safeDay = String(day).padStart(2, '0');
      paiementsToCreate.push({
        id_bureau: bureau.id_bureau,
        montant: bureau.cotisation,
        date: new Date(`2025-${safeMonth}-${safeDay}T10:00:00.000Z`),
        etat: isUnpaid ? 'non_paye' : 'paye',
      });
    }
  }

  // --- Année 2026 (Janvier à Septembre 2026) ---
  // Nous sommes en Septembre 2026 (mois index 0 à 8)
  for (const bureau of activeBureaux) {
    for (let m = 0; m <= 8; m++) {
      let etat: 'paye' | 'non_paye' = 'paye';

      // 3 bureaux avec des retards précis pour peupler le recouvrement et "À Relancer":
      // 1) Bureau 204 (Audit & Conseil): impayé seulement pour Septembre (1 mois)
      if (bureau.numero === 204 && m === 8) {
        etat = 'non_paye';
      }
      // 2) Bureau 304 (BTP Ingénierie): impayé pour Août et Septembre (2 mois)
      if (bureau.numero === 304 && (m === 7 || m === 8)) {
        etat = 'non_paye';
      }
      // 3) Bureau 403 (Assurances Al Amana): impayé pour Juillet, Août et Septembre (3 mois)
      if (bureau.numero === 403 && (m === 6 || m === 7 || m === 8)) {
        etat = 'non_paye';
      }

      const day = 3 + (bureau.numero % 22);
      const safeMonth = String(m + 1).padStart(2, '0');
      const safeDay = String(day).padStart(2, '0');
      paiementsToCreate.push({
        id_bureau: bureau.id_bureau,
        montant: bureau.cotisation,
        date: new Date(`2026-${safeMonth}-${safeDay}T11:00:00.000Z`),
        etat,
      });
    }
  }

  // Insertion par lots
  for (const p of paiementsToCreate) {
    await prisma.paiement.create({ data: p });
  }

  console.log(`✅ ${paiementsToCreate.length} paiements créés.`);

  console.log('🧾 Création des dépenses réelles pour le syndic (2026)...');

  const expensesData = [
    {
      date: new Date('2026-09-08'),
      category: 'Nettoyage',
      description: 'Prestation mensuelle nettoyage parties communes et vitres',
      provider: 'Société CleanPro Maroc',
      amount: 2800.0,
    },
    {
      date: new Date('2026-09-04'),
      category: 'Électricité',
      description: 'Facture électricité des parties communes (minuterie & ascenseurs)',
      provider: 'ONEE Électricité',
      amount: 1750.5,
    },
    {
      date: new Date('2026-08-25'),
      category: 'Maintenance',
      description: 'Révision trimestrielle et contrôle sécurité des 2 ascenseurs',
      provider: 'Schindler Maroc',
      amount: 4500.0,
    },
    {
      date: new Date('2026-08-15'),
      category: 'Sécurité',
      description: 'Service de gardiennage et surveillance 24/7',
      provider: 'Atlas Sécurité Privée',
      amount: 3500.0,
    },
    {
      date: new Date('2026-08-02'),
      category: 'Nettoyage',
      description: 'Prestation mensuelle nettoyage & désinfection',
      provider: 'Société CleanPro Maroc',
      amount: 2800.0,
    },
    {
      date: new Date('2026-07-28'),
      category: 'Plomberie',
      description: 'Remplacement clapet anti-retour et vanne générale sous-sol',
      provider: 'Plomberie Express Casablanca',
      amount: 1450.0,
    },
    {
      date: new Date('2026-07-10'),
      category: 'Électricité',
      description: 'Remplacement éclairage couloirs par réglettes LED basse consommation',
      provider: 'BricoPro Fournitures',
      amount: 980.0,
    },
    {
      date: new Date('2026-06-20'),
      category: 'Assurance',
      description: 'Prime semestrielle assurance multirisque immeuble',
      provider: 'Wafa Assurance',
      amount: 6200.0,
    },
    {
      date: new Date('2026-06-05'),
      category: 'Espaces Verts',
      description: 'Entretien jardin d’accueil, taille des palmiers et arrosage',
      provider: 'Jardin & Nature',
      amount: 1200.0,
    },
    {
      date: new Date('2026-05-18'),
      category: 'Administration',
      description: 'Fournitures de bureau, papier et cartouches d’encre pour le syndic',
      provider: 'Papeterie Moderne',
      amount: 540.0,
    },
    {
      date: new Date('2026-04-12'),
      category: 'Sécurité',
      description: 'Maintenance des caméras de vidéosurveillance et contrôle d’accès',
      provider: 'HikVision Partenaire Maroc',
      amount: 1850.0,
    },
    {
      date: new Date('2026-03-22'),
      category: 'Peinture',
      description: 'Rafraîchissement peinture hall d’entrée et cage d’escalier',
      provider: 'Atlas Rénovation',
      amount: 3800.0,
    },
    {
      date: new Date('2026-02-14'),
      category: 'Maintenance',
      description: 'Entretien groupe hydrophore et surpresseur eau potable',
      provider: 'TechniPompe Maroc',
      amount: 2100.0,
    },
    {
      date: new Date('2026-01-20'),
      category: 'Assurance',
      description: 'Prime semestrielle assurance responsabilité civile syndic',
      provider: 'Wafa Assurance',
      amount: 6200.0,
    },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }

  console.log(`✅ ${expensesData.length} dépenses créées.`);

  console.log('📩 Création des demandes et réclamations récentes...');

  const demandesData = [
    {
      objet: 'reclamation' as const,
      created_by: 'Cabinet Dr. Benjelloun',
      bureauid: createdBureaux[0]?.id_bureau,
      userid: adminUser?.id_user,
      created_at: new Date('2026-09-17T14:30:00.000Z'),
    },
    {
      objet: 'creation' as const,
      created_by: 'Atlas Digital Solutions',
      bureauid: createdBureaux[9]?.id_bureau,
      userid: adminUser?.id_user,
      created_at: new Date('2026-09-15T11:00:00.000Z'),
    },
    {
      objet: 'reclamation' as const,
      created_by: 'Fiduciaire Al-Maghrib',
      bureauid: createdBureaux[6]?.id_bureau,
      userid: adminUser?.id_user,
      created_at: new Date('2026-09-10T09:15:00.000Z'),
    },
    {
      objet: 'creation' as const,
      created_by: 'Kettani Architecture',
      bureauid: createdBureaux[10]?.id_bureau,
      userid: adminUser?.id_user,
      created_at: new Date('2026-09-02T16:45:00.000Z'),
    },
    {
      objet: 'reclamation' as const,
      created_by: 'Pharmacie Al Shifa',
      bureauid: createdBureaux[1]?.id_bureau,
      userid: adminUser?.id_user,
      created_at: new Date('2026-08-28T10:20:00.000Z'),
    },
  ];

  for (const d of demandesData) {
    await prisma.demande.create({ data: d });
  }

  console.log(`✅ ${demandesData.length} demandes créées.`);
  console.log('🎉 Remplissage terminé avec succès !');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
