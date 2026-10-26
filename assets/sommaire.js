/**
 * SOMMAIRE DU LIVRE — source unique de vérité pour tout le site.
 *
 * Convention de nommage des fichiers (à respecter sur GitHub) :
 *   - Page d'un livre      : kitab-N/index.html
 *   - Page d'un chapitre   : kitab-N/sub-N-M.html   (N = n° du livre, M = n° du chapitre)
 *
 * Pour ajouter / renommer un chapitre, modifiez uniquement ce fichier.
 * Les pages (accueil, livres, menu latéral, recherche, précédent/suivant) se mettent à jour toutes seules.
 */
window.SITE = {
  // true : le site teste automatiquement quels fichiers existent sur le dépôt
  //        et affiche « bientôt » pour les chapitres pas encore ajoutés.
  checkAvailability: true
};

window.SOMMAIRE = [
  {
    id: 1,
    titleAr: 'كتاب الطهارة',
    titleFr: 'Livre de la Purification',
    chapters: [
      { id: '1-1', titleAr: 'المقدمة', titleFr: 'Introduction' },
      { id: '1-2', titleAr: 'فضل التفقه في الدين', titleFr: "Le mérite de l'apprentissage profond de la religion" },
      { id: '1-3', titleAr: 'فهرس كتاب الطهارة', titleFr: 'Table des matières du Livre de la Purification' },
      { id: '1-4', titleAr: 'باب أحكام الطهارة والمياه', titleFr: 'Règles de la purification et des eaux' },
      { id: '1-5', titleAr: 'باب الآنية وثياب الكفار', titleFr: 'Règles des récipients et des vêtements des non-musulmans' },
      { id: '1-6', titleAr: 'باب آداب قضاء الحاجة', titleFr: 'Règles de bienséance (Adab) pour satisfaire ses besoins naturels' },
      { id: '1-7', titleAr: 'باب السواك وخصال الفطرة', titleFr: 'Le Siwâk et les caractéristiques de la saine nature (Al-Fitrah)' },
      { id: '1-8', titleAr: 'باب الوضوء', titleFr: "Règles de l'ablution (Al-Woudou')" },
      { id: '1-9', titleAr: 'باب صفة الوضوء', titleFr: "Description de la manière de faire les ablutions" },
      { id: '1-10', titleAr: 'باب المسح على الخفين', titleFr: "Règles de l'essuyage sur les chaussons (Al-Khouffayn) et autres protections" },
      { id: '1-11', titleAr: 'باب نواقض الوضوء', titleFr: "Les annulateurs de l'ablution" },
      { id: '1-12', titleAr: 'باب الغسل', titleFr: 'Règles du grand lavage rituel (Al-Ghousl)' },
      { id: '1-13', titleAr: 'باب التيمم', titleFr: "Règles de l'ablution sèche (At-Tayammoum)" },
      { id: '1-14', titleAr: 'باب إزالة النجاسة', titleFr: "Règles de l'élimination de l'impureté (An-Najasah)" },
      { id: '1-15', titleAr: 'باب الحيض والنفاس', titleFr: 'Règles des menstrues et des lochies' }
    ]
  },
  {
    id: 2,
    titleAr: 'كتاب الصلاة',
    titleFr: 'Livre de la Prière',
    chapters: [
      { id: '2-1', titleAr: '', titleFr: 'Table des matières du Livre de la Prière' },
      { id: '2-2', titleAr: '', titleFr: "L'obligation des cinq prières" },
      { id: '2-3', titleAr: '', titleFr: "Règles de l'Adhân et de l'Iqâmah" },
      { id: '2-4', titleAr: '', titleFr: 'Les conditions de la prière' },
      { id: '2-5', titleAr: '', titleFr: 'Règles de bienséance pour se rendre à la prière' },
      { id: '2-6', titleAr: '', titleFr: 'Les piliers de la prière, ses obligations et ses actes recommandés (Sunan)' },
      { id: '2-7', titleAr: '', titleFr: 'Description de la prière' },
      { id: '2-8', titleAr: '', titleFr: 'Ce qui est détestable dans la prière' },
      { id: '2-9', titleAr: '', titleFr: "Ce qu'il est recommandé ou autorisé de faire durant la prière" },
      { id: '2-10', titleAr: '', titleFr: "La prosternation de l'oubli (Sujûd as-Sahw)" },
      { id: '2-11', titleAr: '', titleFr: "L'évocation (Dhikr) après la prière" },
      { id: '2-12', titleAr: '', titleFr: "La prière surérogatoire (At-Tatawwu')" },
      { id: '2-13', titleAr: '', titleFr: 'La prière du Witr et ses règles' },
      { id: '2-14', titleAr: '', titleFr: 'La prière des Tarawih et ses règles' },
      { id: '2-15', titleAr: '', titleFr: 'Les Sunan régulières (Ar-Rawâtib) liées aux prières obligatoires' },
      { id: '2-16', titleAr: '', titleFr: 'La prière de Douhâ' },
      { id: '2-17', titleAr: '', titleFr: 'La prosternation de la récitation' },
      { id: '2-18', titleAr: '', titleFr: 'La prière surérogatoire absolue' },
      { id: '2-19', titleAr: '', titleFr: 'Les moments où il est interdit de prier' },
      { id: '2-20', titleAr: '', titleFr: "L'obligation de la prière en groupe et ses mérites" },
      { id: '2-21', titleAr: '', titleFr: 'Règles relatives à celui qui a manqué une partie de la prière (Al-Masbûq)' },
      { id: '2-22', titleAr: '', titleFr: 'Statut juridique de la présence des femmes dans les mosquées' },
      { id: '2-23', titleAr: '', titleFr: "Les règles de l'imamat" },
      { id: '2-24', titleAr: '', titleFr: "Ceux dont l'imamat n'est pas valide pour la prière" },
      { id: '2-25', titleAr: '', titleFr: "Ce qui est prescrit pour l'imam durant la prière" },
      { id: '2-26', titleAr: '', titleFr: 'La prière des gens ayant des excuses légales (malades, voyageurs…)' },
      { id: '2-27', titleAr: '', titleFr: 'Règles de la prière du Vendredi' },
      { id: '2-28', titleAr: '', titleFr: 'Règles de la prière des deux Aïds' },
      { id: '2-29', titleAr: '', titleFr: "Règles de la prière de l'éclipse" },
      { id: '2-30', titleAr: '', titleFr: "Règles de la prière pour la demande de la pluie (Al-Istisqâ')" },
      { id: '2-31', titleAr: '', titleFr: 'Règles des funérailles (Janâzah)' }
    ]
  },
  {
    id: 3,
    titleAr: 'كتاب الزكاة',
    titleFr: 'Livre de la Zakât',
    chapters: [
      { id: '3-1', titleAr: '', titleFr: 'Table des matières du Livre de la Zakât' },
      { id: '3-2', titleAr: '', titleFr: 'Légitimité de la Zakât et son importance' },
      { id: '3-3', titleAr: '', titleFr: 'Zakât du bétail' },
      { id: '3-4', titleAr: '', titleFr: 'Zakât des grains, des fruits, du miel, des minerais et des trésors enfouis (Rikâz)' },
      { id: '3-5', titleAr: '', titleFr: "Zakât des deux monnaies (l'or et l'argent)" },
      { id: '3-6', titleAr: '', titleFr: 'Zakât des marchandises destinées au commerce' },
      { id: '3-7', titleAr: '', titleFr: 'Zakât de rupture du jeûne (Zakât Al-Fitr)' },
      { id: '3-8', titleAr: '', titleFr: "L'acquittement de la Zakât" },
      { id: '3-9', titleAr: '', titleFr: "Les bénéficiaires de la Zakât et ceux à qui il n'est pas permis de la donner" },
      { id: '3-10', titleAr: '', titleFr: "L'aumône recommandée (As-Sadaqah)" }
    ]
  },
  {
    id: 4,
    titleAr: 'كتاب الصيام',
    titleFr: 'Livre du Jeûne',
    chapters: [
      { id: '4-1', titleAr: '', titleFr: 'Table des matières du Livre du Jeûne' },
      { id: '4-2', titleAr: '', titleFr: "L'obligation du jeûne de Ramadan et son moment" },
      { id: '4-3', titleAr: '', titleFr: 'Le début et la fin de la journée de jeûne' },
      { id: '4-4', titleAr: '', titleFr: 'Les choses qui annulent le jeûne' },
      { id: '4-5', titleAr: '', titleFr: "Règles du rattrapage (Al-Qadâ') du jeûne" },
      { id: '4-6', titleAr: '', titleFr: 'Ce qui incombe à celui qui rompt le jeûne en raison de la vieillesse ou de la maladie' }
    ]
  },
  {
    id: 5,
    titleAr: 'كتاب الحج والعمرة',
    titleFr: "Livre du Pèlerinage",
    chapters: [
      { id: '5-1', titleAr: '', titleFr: 'Table des matières du Livre du Pèlerinage' },
      { id: '5-2', titleAr: '', titleFr: 'Le pèlerinage et à qui il est obligatoire' },
      { id: '5-3', titleAr: '', titleFr: "Conditions d'obligation du Hajj pour la femme et règles du remplacement (An-Niyâbah)" },
      { id: '5-4', titleAr: '', titleFr: 'Le mérite du Hajj et sa préparation' },
      { id: '5-5', titleAr: '', titleFr: 'Les temps et lieux fixés (Mawâqît) du Hajj' },
      { id: '5-6', titleAr: '', titleFr: "La manière d'entrer en état de sacralisation (Ihrâm)" },
      { id: '5-7', titleAr: '', titleFr: "Les interdits de l'état de sacralisation" },
      { id: '5-8', titleAr: '', titleFr: "Les actes du jour d'At-Tarwiya et du jour de 'Arafa" },
      { id: '5-9', titleAr: '', titleFr: "Le départ vers Mouzdalifa, la nuitée, le départ vers Mina et les actes du jour de l'Aïd" },
      { id: '5-10', titleAr: '', titleFr: "Les règles des jours d'At-Tashrîq et le tawâf d'adieu" },
      { id: '5-11', titleAr: '', titleFr: "Règles de l'offrande (Al-Hady) et du sacrifice (Al-Oudhiyah)" },
      { id: '5-12', titleAr: '', titleFr: "Règles de la 'Aqîqah" }
    ]
  },
  {
    id: 6,
    titleAr: 'كتاب الجهاد',
    titleFr: 'Livre du Jihâd',
    chapters: [
      { id: '6-1', titleAr: '', titleFr: 'Les règles du Jihâd' }
    ]
  },
  {
    id: 7,
    titleAr: 'كتاب البيوع',
    titleFr: 'Livre des Ventes',
    chapters: [
      { id: '7-1', titleAr: '', titleFr: 'Table des matières du Livre des Ventes' },
      { id: '7-2', titleAr: '', titleFr: 'Les règles des ventes' },
      { id: '7-3', titleAr: '', titleFr: 'Les ventes interdites' },
      { id: '7-4', titleAr: '', titleFr: 'Règles relatives aux conditions dans la vente' },
      { id: '7-5', titleAr: '', titleFr: "Le droit d'option (Al-Khiyâr) dans la vente" },
      { id: '7-6', titleAr: '', titleFr: 'Disposition du bien vendu avant sa prise de possession et résiliation de la vente (Al-Iqâlah)' },
      { id: '7-7', titleAr: '', titleFr: "L'usure (Ar-Ribâ) et son statut juridique" },
      { id: '7-8', titleAr: '', titleFr: 'La vente des biens immobiliers et des capitaux fixes (Al-Usûl)' },
      { id: '7-9', titleAr: '', titleFr: 'La vente des fruits' },
      { id: '7-10', titleAr: '', titleFr: "L'exonération des calamités (Wad' al-Jawâ'ih)" },
      { id: '7-11', titleAr: '', titleFr: "Ce qui est inclus (par suivi) dans la marchandise vendue et ce qui ne l'est pas" },
      { id: '7-12', titleAr: '', titleFr: 'La vente à terme (As-Salam)' },
      { id: '7-13', titleAr: '', titleFr: 'Le prêt (Al-Qard)' },
      { id: '7-14', titleAr: '', titleFr: 'Le gage (Ar-Rahn)' },
      { id: '7-15', titleAr: '', titleFr: 'La garantie (Ad-Damân)' },
      { id: '7-16', titleAr: '', titleFr: "La Kafâlah (cautionnement d'une personne)" },
      { id: '7-17', titleAr: '', titleFr: 'Le transfert de dette (Al-Hawâlah)' },
      { id: '7-18', titleAr: '', titleFr: 'Le mandat (Al-Wakâlah)' },
      { id: '7-19', titleAr: '', titleFr: 'La mise sous tutelle, interdiction légale (Al-Hajr)' }
    ]
  },
  {
    id: 8,
    titleAr: '',
    titleFr: 'Chapitres divers 1',
    chapters: [
      { id: '8-1', titleAr: '', titleFr: 'Les règles de la réconciliation (As-Sulh)' },
      { id: '8-2', titleAr: '', titleFr: 'Les règles relatives au voisinage et aux voies publiques' },
      { id: '8-3', titleAr: '', titleFr: "Les règles du droit de préemption (Ash-Shouf'ah)" }
    ]
  },
  {
    id: 9,
    titleAr: '',
    titleFr: 'Livre des Sociétés (ou des Associations)',
    chapters: [
      { id: '9-1', titleAr: '', titleFr: 'Table des matières du Livre des Sociétés' },
      { id: '9-2', titleAr: '', titleFr: 'Règles du partenariat et différents types de sociétés' },
      { id: '9-3', titleAr: '', titleFr: "La société d'association contractuelle (Sharikat Al-'Inân)" },
      { id: '9-4', titleAr: '', titleFr: 'La société de Mudârabah (commandite)' },
      { id: '9-5', titleAr: '', titleFr: "Sociétés basées sur la notoriété (Al-Wujûh), le travail corporel (Al-Abdân) et l'association universelle (Al-Mufâwadhah)" }
    ]
  },
  {
    id: 10,
    titleAr: '',
    titleFr: "Livre du métayage (Al-Muzâra'ah), de l'irrigation (Al-Musâqâh) et du louage (Al-Ijârah)",
    chapters: [
      { id: '10-1', titleAr: '', titleFr: "Table des matières du Livre du métayage, de l'irrigation et du louage" },
      { id: '10-2', titleAr: '', titleFr: "Règles du métayage (Al-Muzâra'ah) et de l'irrigation partagée (Al-Musâqât)" },
      { id: '10-3', titleAr: '', titleFr: 'Règles du louage (Al-Ijârah)' }
    ]
  },
  {
    id: 11,
    titleAr: '',
    titleFr: 'Chapitres divers 2',
    chapters: [
      { id: '11-1', titleAr: '', titleFr: 'Table des matières du livre Chapitres divers 2' },
      { id: '11-2', titleAr: '', titleFr: 'Les règles de la course (et des compétitions)' },
      { id: '11-3', titleAr: '', titleFr: "Les règles du prêt à usage (Al-'Âriyyah)" },
      { id: '11-4', titleAr: '', titleFr: "Les règles de l'usurpation (Al-Ghasb)" },
      { id: '11-5', titleAr: '', titleFr: 'Les règles relatives aux dégradations et destructions de biens (Al-Itlâfât)' },
      { id: '11-6', titleAr: '', titleFr: "Les règles du dépôt (Al-Wadî'ah)" }
    ]
  },
  {
    id: 12,
    titleAr: '',
    titleFr: "Chapitres de la revitalisation des terres mortes et de l'appropriation des biens licites",
    chapters: [
      { id: '12-1', titleAr: '', titleFr: "Table des matières des chapitres de la revitalisation des terres mortes et de l'appropriation des biens licites" },
      { id: '12-2', titleAr: '', titleFr: "Règles de la revitalisation des terres mortes (Ihyâ' al-Mawât)" },
      { id: '12-3', titleAr: '', titleFr: "Règles de la Ja'âlah (promesse de récompense pour un travail déterminé)" },
      { id: '12-4', titleAr: '', titleFr: 'Règles relatives aux objets trouvés (Al-Luqatah)' },
      { id: '12-5', titleAr: '', titleFr: "Règles relatives à l'enfant trouvé (Al-Laqît)" },
      { id: '12-6', titleAr: '', titleFr: 'Règles du Waqf' },
      { id: '12-7', titleAr: '', titleFr: "Règles de la donation (Al-Hibah) et du cadeau (Al-'Atiyyah)" }
    ]
  },
  {
    id: 13,
    titleAr: 'كتاب الفرائض',
    titleFr: "Livre de l'Héritage (Al-Farâ'id)",
    chapters: [
      // Traduction en cours : les chapitres seront ajoutés ici (ids '13-1', '13-2', …)
    ]
  },
  {
    id: 14,
    titleAr: 'كتاب النكاح',
    titleFr: 'Livre du Mariage',
    chapters: [
      { id: '14-1', titleAr: '', titleFr: 'Table des matières du Livre du Mariage' },
      { id: '14-2', titleAr: '', titleFr: 'Les règles du mariage' },
      { id: '14-3', titleAr: '', titleFr: 'La demande en mariage (Al-Khitbah)' },
      { id: '14-4', titleAr: '', titleFr: 'Le contrat de mariage, ses piliers et ses conditions' },
      { id: '14-5', titleAr: '', titleFr: "L'équivalence (Al-Kafâ'ah) dans le mariage" },
      { id: '14-6', titleAr: '', titleFr: 'Les femmes interdites au mariage' },
      { id: '14-7', titleAr: '', titleFr: 'Les conditions dans le mariage' },
      { id: '14-8', titleAr: '', titleFr: 'Les défauts dans le mariage' },
      { id: '14-10', titleAr: '', titleFr: 'Le mariage des non-musulmans' },
      { id: '14-11', titleAr: '', titleFr: 'La dot (As-Sadâq)' },
      { id: '14-12', titleAr: '', titleFr: "Le repas de noces (Walîmat al-'Urs)" },
      { id: '14-13', titleAr: '', titleFr: 'Le bon comportement (la cohabitation) avec les femmes' },
      { id: '14-14', titleAr: '', titleFr: "Ce qui annule la prise en charge financière (Nafaqah) de l'épouse, et le partage des nuits (Qasm)" }
    ]
  },
  {
    id: 15,
    titleAr: 'كتاب الطلاق',
    titleFr: 'Livre du Divorce',
    chapters: [
      { id: '15-1', titleAr: '', titleFr: 'Table des matières du Livre du Divorce' },
      { id: '15-2', titleAr: '', titleFr: "Les règles du Khoul' (répudiation moyennant compensation)" },
      { id: '15-3', titleAr: '', titleFr: 'Les règles du divorce' },
      { id: '15-4', titleAr: '', titleFr: "Le divorce conforme à la Sunnah (Sounnî) et le divorce innové (Bid'î)" },
      { id: '15-5', titleAr: '', titleFr: "La reprise conjugale (Ar-Raj'ah)" },
      { id: '15-6', titleAr: '', titleFr: "Les règles du serment de continence (Al-Îlâ')" },
      { id: '15-7', titleAr: '', titleFr: 'Les règles du Zhihâr' },
      { id: '15-8', titleAr: '', titleFr: "Les règles du serment d'anathème réciproque (Al-Li'ân)" },
      { id: '15-9', titleAr: '', titleFr: 'La filiation (An-Nasab) : affiliation et non-affiliation' },
      { id: '15-10', titleAr: '', titleFr: "La période de viduité (Al-'Iddah)" },
      { id: '15-11', titleAr: '', titleFr: "La viduité légale (Al-Istibrâ')" }
    ]
  },
  {
    id: 16,
    titleAr: '',
    titleFr: 'Chapitres divers 3',
    chapters: [
      { id: '16-1', titleAr: '', titleFr: 'Table des matières — Chapitres divers 3' },
      { id: '16-2', titleAr: '', titleFr: "Les règles de l'allaitement" },
      { id: '16-3', titleAr: '', titleFr: 'Les règles de la garde des enfants (Al-Hadânah)' },
      { id: '16-4', titleAr: '', titleFr: 'Les empêchements à la garde des enfants' },
      { id: '16-5', titleAr: '', titleFr: "La prise en charge financière de l'épouse" },
      { id: '16-6', titleAr: '', titleFr: "L'entretien financier des proches et des personnes ou animaux à charge (Al-Mamâlîk)" }
    ]
  },
  {
    id: 17,
    titleAr: 'كتاب الجنايات',
    titleFr: 'Livre du Talion (Al-Qisâs) et des infractions criminelles (Al-Jinâyât)',
    chapters: [
      { id: '17-1', titleAr: '', titleFr: 'Table des matières — Livre du Talion (Al-Qisâs) et des infractions criminelles (Al-Jinâyât)' },
      { id: '17-2', titleAr: '', titleFr: 'Les règles du meurtre et ses différentes catégories' },
      { id: '17-3', titleAr: '', titleFr: 'Les règles du talion (Al-Qisâs)' },
      { id: '17-4', titleAr: '', titleFr: 'Le talion concernant les membres (et les blessures)' },
      { id: '17-5', titleAr: '', titleFr: "Le talion appliqué à un groupe pour le meurtre d'une seule personne" },
      { id: '17-6', titleAr: '', titleFr: 'Les règles des prix du sang (Ad-Diyât)' },
      { id: '17-7', titleAr: '', titleFr: 'Le montant des prix du sang' },
      { id: '17-8', titleAr: '', titleFr: 'Le prix du sang des membres et des facultés' },
      { id: '17-9', titleAr: '', titleFr: 'Les blessures à la tête (Ash-Shijâj) et les fractures des os' },
      { id: '17-10', titleAr: '', titleFr: "L'expiation du meurtre (Kaffârat al-Qatl)" },
      { id: '17-11', titleAr: '', titleFr: 'Les règles de la Qasâmah (le serment collectif)' }
    ]
  },
  {
    id: 18,
    titleAr: 'كتاب الحدود',
    titleFr: "Livre des Peines légales (Al-Hudûd) et des peines discrétionnaires (At-Ta'zîrât)",
    chapters: [
      { id: '18-1', titleAr: '', titleFr: "Table des matières — Livre des Peines légales (Al-Hudûd) et des peines discrétionnaires (At-Ta'zîrât)" },
      { id: '18-2', titleAr: '', titleFr: 'Les règles relatives aux peines légales (Al-Hudûd)' },
      { id: '18-3', titleAr: '', titleFr: "La peine légale de la fornication et de l'adultère (Zinâ)" },
      { id: '18-4', titleAr: '', titleFr: 'La peine légale de la calomnie (Al-Qadhf)' },
      { id: '18-5', titleAr: '', titleFr: "Les règles du Ta'zîr (la peine discrétionnaire)" },
      { id: '18-6', titleAr: '', titleFr: 'La peine légale du vol' },
      { id: '18-7', titleAr: '', titleFr: 'La peine légale applicable aux coupeurs de route (brigands)' },
      { id: '18-8', titleAr: '', titleFr: 'Le combat contre les rebelles (Ahl al-Baghy)' },
      { id: '18-9', titleAr: '', titleFr: "Les règles de l'apostasie" }
    ]
  },
  {
    id: 19,
    titleAr: 'كتاب الأطعمة',
    titleFr: 'Livre des Nourritures',
    chapters: [
      { id: '19-1', titleAr: '', titleFr: 'Table des matières — Livre des Nourritures' },
      { id: '19-2', titleAr: '', titleFr: 'Les règles relatives aux nourritures' },
      { id: '19-3', titleAr: '', titleFr: "Les règles de l'égorgement rituel" },
      { id: '19-4', titleAr: '', titleFr: 'Les règles de la chasse' }
    ]
  },
  {
    id: 20,
    titleAr: 'كتاب الأيمان والنذور',
    titleFr: 'Livre des Serments et des Vœux',
    chapters: [
      { id: '20-1', titleAr: '', titleFr: 'Table des matières — Livre des Serments et des Vœux' },
      { id: '20-2', titleAr: '', titleFr: 'Les règles relatives aux serments' },
      { id: '20-3', titleAr: '', titleFr: "L'expiation du serment" },
      { id: '20-4', titleAr: '', titleFr: 'Les règles du vœu solennel (An-Nadhr)' }
    ]
  },
  {
    id: 21,
    titleAr: 'كتاب القضاء',
    titleFr: 'Livre de la Magistrature',
    chapters: [
      { id: '21-1', titleAr: '', titleFr: 'Table des matières — Livre de la Magistrature' },
      { id: '21-2', titleAr: '', titleFr: 'Les règles de la magistrature en Islam' },
      { id: '21-3', titleAr: '', titleFr: "L'éthique du juge" },
      { id: '21-4', titleAr: '', titleFr: 'La démarche du jugement et sa description' },
      { id: '21-5', titleAr: '', titleFr: "Les conditions de validité de la plainte (ou de l'action en justice)" },
      { id: '21-6', titleAr: '', titleFr: 'Le partage entre les associés' },
      { id: '21-7', titleAr: '', titleFr: 'Les actions en justice (les prétentions) et les preuves' },
      { id: '21-8', titleAr: '', titleFr: 'Les témoignages (Ash-Shahâdât)' },
      { id: '21-9', titleAr: '', titleFr: "La correspondance d'un juge à un autre, le témoignage sur un témoignage et la rétractation des témoins" },
      { id: '21-10', titleAr: '', titleFr: 'Le serment dans les actions en justice (les revendications)' },
      { id: '21-11', titleAr: '', titleFr: "Les règles de la confession (l'aveu, Al-Iqrâr)" }
    ]
  }
];
