export interface TransitStation {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  lineId: string;
  lineName: string;
  lineColor: string;
  operator: 'KTMB' | 'Rapid KL' | 'ERL';
  interchanges?: string[];
  nextArrivalMins: number;
  status: 'Normal' | 'Arriving' | 'Departing';
  fareEst?: string;
  facilities?: string[];
}

export interface TransitLine {
  id: string;
  name: string;
  shortName: string;
  type: 'ktm' | 'lrt' | 'mrt' | 'monorail' | 'express';
  operator: 'KTMB' | 'Rapid KL' | 'ERL';
  color: string;
  borderColor: string;
  frequency: string;
  operatingHours: string;
  coordinates: { lat: number; lng: number }[];
  stations: TransitStation[];
}

export interface TrackingStep {
  id: string;
  order: number;
  title: string;
  locationName: string;
  lat: number;
  lng: number;
  timeEstimate: string;
  distanceKm: number;
  status: 'completed' | 'active' | 'upcoming';
  transitMode: string;
  notes: string;
  arrivalWindow: string;
}

export const TRANSIT_LINES: TransitLine[] = [
  // -------------------------------------------------------------
  // 1. KTM KOMUTER: Batu Caves - Pulau Sebang Line (Line 1)
  // -------------------------------------------------------------
  {
    id: 'ktm-batu-caves',
    name: 'KTM Komuter: Batu Caves - Pulau Sebang (Line 1)',
    shortName: 'KTM Batu Caves Line',
    type: 'ktm',
    operator: 'KTMB',
    color: '#1e3799',
    borderColor: '#0c2461',
    frequency: 'Every 15-30 mins',
    operatingHours: '05:30 - 23:30',
    coordinates: [
      { lat: 3.2374, lng: 101.6814 }, // Batu Caves
      { lat: 3.2260, lng: 101.6765 },
      { lat: 3.2145, lng: 101.6719 }, // Taman Wahyu
      { lat: 3.2040, lng: 101.6738 }, // Kampung Batu (interchange MRT Putrajaya)
      { lat: 3.1956, lng: 101.6795 }, // Batu Kentonmen
      { lat: 3.1786, lng: 101.6908 }, // Sentul KTM
      { lat: 3.1666, lng: 101.6917 }, // Putra
      { lat: 3.1550, lng: 101.6934 }, // Bank Negara
      { lat: 3.1396, lng: 101.6936 }, // Kuala Lumpur (Old Station)
      { lat: 3.1342, lng: 101.6865 }, // KL Sentral
      { lat: 3.1186, lng: 101.6784 }, // Mid Valley
      { lat: 3.1135, lng: 101.6812 }, // Seputeh
      { lat: 3.1046, lng: 101.7058 }, // Salak Selatan KTM
      { lat: 3.0768, lng: 101.7118 }, // Bandar Tasik Selatan (TBS)
      { lat: 3.0232, lng: 101.7168 }, // Serdang
      { lat: 2.9831, lng: 101.7909 }, // Kajang KTM
      { lat: 2.9431, lng: 101.7852 }, // UKM Bangi
      { lat: 2.8126, lng: 101.7981 }, // Nilai
      { lat: 2.7198, lng: 101.9405 }, // Seremban
    ],
    stations: [
      {
        id: 'st-ktm-batu-caves',
        name: 'Batu Caves KTM',
        code: 'KC05',
        lat: 3.2374,
        lng: 101.6814,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['Tourist Cave Entrance', 'Bus Shuttle'],
        nextArrivalMins: 8,
        status: 'Normal',
        fareEst: 'RM 2.60 from KL Sentral',
        facilities: ['Touch n Go Card', 'Park & Ride', 'ATM', 'Escalator'],
      },
      {
        id: 'st-ktm-kampung-batu',
        name: 'Kampung Batu KTM & MRT Interchange',
        code: 'KC03',
        lat: 3.2040,
        lng: 101.6738,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['MRT Putrajaya Line (PY13)'],
        nextArrivalMins: 14,
        status: 'Normal',
        fareEst: 'RM 2.00',
        facilities: ['Seamless Inter-platform Bridge', 'Lift'],
      },
      {
        id: 'st-ktm-bank-negara',
        name: 'Bank Negara KTM',
        code: 'KA03',
        lat: 3.1550,
        lng: 101.6934,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['KTM Port Klang Line', 'LRT Bandaraya link (AG6/SP6)'],
        nextArrivalMins: 5,
        status: 'Normal',
        fareEst: 'RM 1.60',
        facilities: ['Covered Pedestrian Walkway to SOGO'],
      },
      {
        id: 'st-ktm-kuala-lumpur',
        name: 'Kuala Lumpur Heritage Railway Station',
        code: 'KA02',
        lat: 3.1396,
        lng: 101.6936,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['KTM Port Klang Line', 'KTM ETS Intercity', 'LRT/MRT Pasar Seni link'],
        nextArrivalMins: 3,
        status: 'Arriving',
        fareEst: 'RM 1.20',
        facilities: ['Historic Moorish Building', 'Post Office', 'Hotel Link'],
      },
      {
        id: 'st-ktm-kl-sentral',
        name: 'KL Sentral KTM Concourse',
        code: 'KA01',
        lat: 3.1342,
        lng: 101.6865,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['LRT Kelana Jaya', 'MRT Muzium Negara', 'KL Monorail', 'KLIA Ekspres', 'KTM Port Klang Line'],
        nextArrivalMins: 2,
        status: 'Departing',
        fareEst: 'Base Hub',
        facilities: ['Full Transit Hub', 'Luggage Storage', 'Food Court', 'Nu Sentral Mall'],
      },
      {
        id: 'st-ktm-mid-valley',
        name: 'Mid Valley KTM',
        code: 'KB01',
        lat: 3.1186,
        lng: 101.6784,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['Mid Valley Megamall', 'The Gardens', 'LRT Abdullah Hukum link bridge'],
        nextArrivalMins: 6,
        status: 'Normal',
        fareEst: 'RM 1.80 from KL Sentral',
        facilities: ['Direct Mall Concourse Link', 'Air-conditioned Bridge'],
      },
      {
        id: 'st-ktm-bts',
        name: 'Bandar Tasik Selatan (TBS Hub)',
        code: 'KB04',
        lat: 3.0768,
        lng: 101.7118,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['LRT Sri Petaling (SP15)', 'KLIA Transit (ER2)', 'TBS Intercity Bus Terminal'],
        nextArrivalMins: 9,
        status: 'Normal',
        fareEst: 'RM 2.40 from KL Sentral',
        facilities: ['Nationwide Bus Terminal', 'Ticket Counters', 'Food & Rest Hub'],
      },
      {
        id: 'st-ktm-kajang',
        name: 'Kajang KTM & MRT Hub',
        code: 'KB06',
        lat: 2.9831,
        lng: 101.7909,
        lineId: 'ktm-batu-caves',
        lineName: 'KTM Batu Caves Line (Line 1)',
        lineColor: '#1e3799',
        operator: 'KTMB',
        interchanges: ['MRT Kajang Line (KG35)', 'KTM ETS Intercity'],
        nextArrivalMins: 11,
        status: 'Normal',
        fareEst: 'RM 3.30 from KL Sentral',
        facilities: ['Park & Ride', 'Bus Feeder', 'Kajang Satay belt link'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. KTM KOMUTER: Tanjung Malim - Port Klang Line (Line 2)
  // -------------------------------------------------------------
  {
    id: 'ktm-port-klang',
    name: 'KTM Komuter: Tanjung Malim - Port Klang (Line 2)',
    shortName: 'KTM Port Klang Line',
    type: 'ktm',
    operator: 'KTMB',
    color: '#c0392b',
    borderColor: '#962d22',
    frequency: 'Every 20-30 mins',
    operatingHours: '05:40 - 23:15',
    coordinates: [
      { lat: 3.3195, lng: 101.5752 }, // Rawang
      { lat: 3.2578, lng: 101.5548 }, // Kuang
      { lat: 3.2062, lng: 101.5812 }, // Sungai Buloh
      { lat: 3.2089, lng: 101.6288 }, // Kepong Sentral
      { lat: 3.2012, lng: 101.6425 }, // Kepong
      { lat: 3.1856, lng: 101.6635 }, // Segambut
      { lat: 3.1666, lng: 101.6917 }, // Putra
      { lat: 3.1550, lng: 101.6934 }, // Bank Negara
      { lat: 3.1396, lng: 101.6936 }, // Kuala Lumpur
      { lat: 3.1342, lng: 101.6865 }, // KL Sentral
      { lat: 3.1192, lng: 101.6738 }, // Abdullah Hukum
      { lat: 3.1118, lng: 101.6728 }, // Angkasapuri
      { lat: 3.0975, lng: 101.6685 }, // Pantai Dalam
      { lat: 3.0886, lng: 101.6642 }, // Petaling
      { lat: 3.0845, lng: 101.6568 }, // Jalan Templer
      { lat: 3.0842, lng: 101.6112 }, // Seri Setia
      { lat: 3.0825, lng: 101.6045 }, // Setia Jaya (BRT)
      { lat: 3.0812, lng: 101.5912 }, // Subang Jaya
      { lat: 3.0768, lng: 101.5555 }, // Batu Tiga
      { lat: 3.0645, lng: 101.5272 }, // Shah Alam
      { lat: 3.0538, lng: 101.4912 }, // Padang Jawa
      { lat: 3.0428, lng: 101.4495 }, // Klang
      { lat: 3.0008, lng: 101.3985 }, // Pelabuhan Klang (Port Klang)
    ],
    stations: [
      {
        id: 'st-ktm-rawang',
        name: 'Rawang KTM Interchange Hub',
        code: 'KA10',
        lat: 3.3195,
        lng: 101.5752,
        lineId: 'ktm-port-klang',
        lineName: 'KTM Port Klang Line (Line 2)',
        lineColor: '#c0392b',
        operator: 'KTMB',
        interchanges: ['KTM Shuttle Tanjung Malim', 'KTM ETS'],
        nextArrivalMins: 12,
        status: 'Normal',
        fareEst: 'RM 3.80 from KL Sentral',
        facilities: ['Park & Ride', 'Bus Feeder'],
      },
      {
        id: 'st-ktm-sungai-buloh',
        name: 'Sungai Buloh KTM & MRT',
        code: 'KA08',
        lat: 3.2062,
        lng: 101.5812,
        lineId: 'ktm-port-klang',
        lineName: 'KTM Port Klang Line (Line 2)',
        lineColor: '#c0392b',
        operator: 'KTMB',
        interchanges: ['MRT Putrajaya Line (PY04)'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 2.50',
        facilities: ['Direct concourse transfer', 'Park & Ride'],
      },
      {
        id: 'st-ktm-abdullah-hukum',
        name: 'Abdullah Hukum KTM & LRT',
        code: 'KD01',
        lat: 3.1192,
        lng: 101.6738,
        lineId: 'ktm-port-klang',
        lineName: 'KTM Port Klang Line (Line 2)',
        lineColor: '#c0392b',
        operator: 'KTMB',
        interchanges: ['LRT Kelana Jaya (KJ17)', 'KL Eco City link', 'Mid Valley Bridge'],
        nextArrivalMins: 2,
        status: 'Arriving',
        fareEst: 'RM 1.60',
        facilities: ['Integrated Station', 'Pedestrian Walkway'],
      },
      {
        id: 'st-ktm-subang-jaya',
        name: 'Subang Jaya KTM & LRT Hub',
        code: 'KD09',
        lat: 3.0812,
        lng: 101.5912,
        lineId: 'ktm-port-klang',
        lineName: 'KTM Port Klang Line (Line 2)',
        lineColor: '#c0392b',
        operator: 'KTMB',
        interchanges: ['LRT Kelana Jaya Line (KJ28)', 'Subang Parade Concourse'],
        nextArrivalMins: 7,
        status: 'Normal',
        fareEst: 'RM 2.80 from KL Sentral',
        facilities: ['Park & Ride', 'Shopping Mall Access', 'Feeder Buses'],
      },
      {
        id: 'st-ktm-shah-alam',
        name: 'Shah Alam KTM Station',
        code: 'KD11',
        lat: 3.0645,
        lng: 101.5272,
        lineId: 'ktm-port-klang',
        lineName: 'KTM Port Klang Line (Line 2)',
        lineColor: '#c0392b',
        operator: 'KTMB',
        interchanges: ['Shah Alam Feeder Bus', 'Section 19 Terminal'],
        nextArrivalMins: 15,
        status: 'Normal',
        fareEst: 'RM 3.40',
        facilities: ['Park & Ride', 'OKU Friendly'],
      },
      {
        id: 'st-ktm-port-klang',
        name: 'Pelabuhan Klang (Port Klang Terminal)',
        code: 'KD19',
        lat: 3.0008,
        lng: 101.3985,
        lineId: 'ktm-port-klang',
        lineName: 'KTM Port Klang Line (Line 2)',
        lineColor: '#c0392b',
        operator: 'KTMB',
        interchanges: ['Pulau Ketam Ferry Terminal', 'Port Jetty'],
        nextArrivalMins: 18,
        status: 'Normal',
        fareEst: 'RM 4.80 from KL Sentral',
        facilities: ['Ferry connection to Crab Island (Pulau Ketam)'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. LRT: Kelana Jaya Line (Line 5)
  // -------------------------------------------------------------
  {
    id: 'lrt-kelana-jaya',
    name: 'Kelana Jaya LRT Line (Line 5)',
    shortName: 'LRT Kelana Jaya',
    type: 'lrt',
    operator: 'Rapid KL',
    color: '#d63031',
    borderColor: '#b71540',
    frequency: 'Every 3 mins (Peak: 2 mins)',
    operatingHours: '06:00 - 23:55',
    coordinates: [
      { lat: 3.2312, lng: 101.7342 }, // Gombak
      { lat: 3.2241, lng: 101.7285 }, // Taman Melati
      { lat: 3.2058, lng: 101.7317 }, // Wangsa Maju
      { lat: 3.1978, lng: 101.7372 }, // Sri Rampai
      { lat: 3.1762, lng: 101.7358 }, // Setiawangsa
      { lat: 3.1672, lng: 101.7328 }, // Jelatek
      { lat: 3.1652, lng: 101.7248 }, // Dato' Keramat
      { lat: 3.1648, lng: 101.7215 }, // Damai
      { lat: 3.1605, lng: 101.7190 }, // Ampang Park
      { lat: 3.1593, lng: 101.7126 }, // KLCC
      { lat: 3.1578, lng: 101.7032 }, // Kampung Baru
      { lat: 3.1565, lng: 101.7015 }, // Dang Wangi
      { lat: 3.1492, lng: 101.6963 }, // Masjid Jamek
      { lat: 3.1423, lng: 101.6953 }, // Pasar Seni
      { lat: 3.1342, lng: 101.6865 }, // KL Sentral
      { lat: 3.1275, lng: 101.6782 }, // Bangsar
      { lat: 3.1192, lng: 101.6738 }, // Abdullah Hukum
      { lat: 3.1152, lng: 101.6688 }, // Kerinchi
      { lat: 3.1142, lng: 101.6618 }, // Universiti (UM)
      { lat: 3.1042, lng: 101.6495 }, // Taman Jaya
      { lat: 3.1048, lng: 101.6378 }, // Asia Jaya
      { lat: 3.1072, lng: 101.6232 }, // Taman Paramount
      { lat: 3.1118, lng: 101.6115 }, // Taman Bahagia
      { lat: 3.1128, lng: 101.6035 }, // Kelana Jaya
      { lat: 3.0955, lng: 101.5902 }, // Glenmarie
      { lat: 3.0812, lng: 101.5912 }, // Subang Jaya
      { lat: 3.0762, lng: 101.5895 }, // SS15
      { lat: 3.0552, lng: 101.5915 }, // USJ 7
      { lat: 3.0482, lng: 101.5888 }, // Taipan
      { lat: 3.0035, lng: 101.5721 }, // Putra Heights
    ],
    stations: [
      {
        id: 'st-gombak',
        name: 'Gombak LRT Terminal',
        code: 'KJ1',
        lat: 3.2312,
        lng: 101.7342,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['Genting Express Coach', 'Park & Ride Hub'],
        nextArrivalMins: 3,
        status: 'Departing',
        fareEst: 'RM 3.70 to KL Sentral',
        facilities: ['Genting Skyway bus connection', 'Multi-storey parking'],
      },
      {
        id: 'st-klcc',
        name: 'KLCC Station (Petronas Twin Towers)',
        code: 'KJ10',
        lat: 3.1593,
        lng: 101.7126,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['Suria KLCC Concourse', 'Avenue K Underground link'],
        nextArrivalMins: 2,
        status: 'Arriving',
        fareEst: 'RM 2.10 from KL Sentral',
        facilities: ['Underground Mall Access', 'Air-conditioned Tunnel to Pavillion'],
      },
      {
        id: 'st-dang-wangi',
        name: 'Dang Wangi Station',
        code: 'KJ12',
        lat: 3.1565,
        lng: 101.7015,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['Bukit Nanas Monorail (300m link)', 'Jalan Ampang'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 1.80',
        facilities: ['Covered pedestrian bridge to Monorail'],
      },
      {
        id: 'st-masjid-jamek',
        name: 'Masjid Jamek Interchange',
        code: 'KJ13',
        lat: 3.1492,
        lng: 101.6963,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['LRT Ampang Line (AG7)', 'LRT Sri Petaling Line (SP7)'],
        nextArrivalMins: 1,
        status: 'Arriving',
        fareEst: 'RM 1.60',
        facilities: ['Cross-platform transfer', 'River of Life Boardwalk'],
      },
      {
        id: 'st-pasar-seni-lrt',
        name: 'Pasar Seni LRT (Central Market & Chinatown)',
        code: 'KJ14',
        lat: 3.1423,
        lng: 101.6953,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['MRT Kajang Line (KG16)', 'KTM Kuala Lumpur Station Link Bridge'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 1.30',
        facilities: ['Air-conditioned transfer link to MRT', 'Bus Hub'],
      },
      {
        id: 'st-kl-sentral-lrt',
        name: 'KL Sentral LRT Hub',
        code: 'KJ15',
        lat: 3.1342,
        lng: 101.6865,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['KTM Komuter', 'MRT Muzium Negara', 'KL Monorail', 'KLIA Ekspres'],
        nextArrivalMins: 2,
        status: 'Normal',
        fareEst: 'Base Hub',
        facilities: ['Direct access to all city rail lines'],
      },
      {
        id: 'st-bangsar',
        name: 'Bangsar LRT',
        code: 'KJ16',
        lat: 3.1275,
        lng: 101.6782,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['Bangsar Telawi Cafes & Dining', 'Mid Valley Shuttle Bus'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 1.60',
        facilities: ['Feeder Bus to APW Bangsar and Telawi'],
      },
      {
        id: 'st-universiti',
        name: 'Universiti (KL Gateway & Universiti Malaya)',
        code: 'KJ19',
        lat: 3.1142,
        lng: 101.6618,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['Universiti Malaya (UM) Campus Shuttle', 'KL Gateway Mall'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 2.20',
        facilities: ['Direct bridge to KL Gateway Mall', 'UM bus pickup bay'],
      },
      {
        id: 'st-usj7',
        name: 'USJ 7 LRT & BRT Interchange',
        code: 'KJ31',
        lat: 3.0552,
        lng: 101.5915,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['BRT Sunway Line (B7)', 'The Summit USJ'],
        nextArrivalMins: 5,
        status: 'Normal',
        fareEst: 'RM 3.50',
        facilities: ['Elevated cross-transfer to BRT Sunway Lagoon'],
      },
      {
        id: 'st-putra-heights',
        name: 'Putra Heights Terminal',
        code: 'KJ37',
        lat: 3.0035,
        lng: 101.5721,
        lineId: 'lrt-kelana-jaya',
        lineName: 'LRT Kelana Jaya (Line 5)',
        lineColor: '#d63031',
        operator: 'Rapid KL',
        interchanges: ['LRT Sri Petaling Line (SP31) Cross-Platform'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 4.10 from KL Sentral',
        facilities: ['Cross-platform direct transfer between Line 5 and Line 4'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. LRT: Ampang & Sri Petaling Lines (Lines 3 & 4)
  // -------------------------------------------------------------
  {
    id: 'lrt-ampang-sripetaling',
    name: 'Ampang & Sri Petaling LRT Lines (Lines 3 & 4)',
    shortName: 'LRT Ampang / Sri Petaling',
    type: 'lrt',
    operator: 'Rapid KL',
    color: '#e67e22',
    borderColor: '#d35400',
    frequency: 'Every 3-6 mins',
    operatingHours: '06:00 - 23:45',
    coordinates: [
      { lat: 3.1862, lng: 101.6998 }, // Sentul Timur
      { lat: 3.1785, lng: 101.6978 }, // Sentul
      { lat: 3.1738, lng: 101.6955 }, // Titiwangsa (Hub)
      { lat: 3.1672, lng: 101.6938 }, // PWTC
      { lat: 3.1605, lng: 101.6952 }, // Sultan Ismail
      { lat: 3.1555, lng: 101.6948 }, // Bandaraya
      { lat: 3.1492, lng: 101.6963 }, // Masjid Jamek
      { lat: 3.1448, lng: 101.7018 }, // Plaza Rakyat
      { lat: 3.1402, lng: 101.7065 }, // Hang Tuah
      { lat: 3.1368, lng: 101.7125 }, // Pudu
      { lat: 3.1285, lng: 101.7148 }, // Chan Sow Lin
      // Branch to TBS & Bukit Jalil & Putra Heights
      { lat: 3.1132, lng: 101.7155 }, // Cheras
      { lat: 3.0768, lng: 101.7118 }, // Bandar Tasik Selatan (TBS)
      { lat: 3.0645, lng: 101.7078 }, // Sungai Besi
      { lat: 3.0585, lng: 101.6872 }, // Bukit Jalil (National Stadium)
      { lat: 3.0615, lng: 101.6775 }, // Sri Petaling
      { lat: 3.0505, lng: 101.6425 }, // Kinrara BK5
      { lat: 3.0475, lng: 101.6215 }, // IOI Puchong Jaya
      { lat: 3.0035, lng: 101.5721 }, // Putra Heights
    ],
    stations: [
      {
        id: 'st-titiwangsa-lrt',
        name: 'Titiwangsa Interchange Mega Hub',
        code: 'AG3/SP3',
        lat: 3.1738,
        lng: 101.6955,
        lineId: 'lrt-ampang-sripetaling',
        lineName: 'LRT Ampang / Sri Petaling (Lines 3/4)',
        lineColor: '#e67e22',
        operator: 'Rapid KL',
        interchanges: ['KL Monorail (MR11)', 'MRT Putrajaya Line (PY17)', 'Pekeliling Bus Terminal'],
        nextArrivalMins: 2,
        status: 'Arriving',
        fareEst: 'RM 2.00',
        facilities: ['Quadruple transit interchange', 'Elevated transfer deck'],
      },
      {
        id: 'st-pwtc',
        name: 'PWTC (World Trade Centre KL)',
        code: 'AG4/SP4',
        lat: 3.1672,
        lng: 101.6938,
        lineId: 'lrt-ampang-sripetaling',
        lineName: 'LRT Ampang / Sri Petaling (Lines 3/4)',
        lineColor: '#e67e22',
        operator: 'Rapid KL',
        interchanges: ['Sunway Putra Mall', 'KTM Putra Station Link Bridge'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 1.80',
        facilities: ['Direct covered bridge to Sunway Putra Mall'],
      },
      {
        id: 'st-hang-tuah',
        name: 'Hang Tuah Interchange (BBCC & Lalaport)',
        code: 'AG9/SP9',
        lat: 3.1402,
        lng: 101.7065,
        lineId: 'lrt-ampang-sripetaling',
        lineName: 'LRT Ampang / Sri Petaling (Lines 3/4)',
        lineColor: '#e67e22',
        operator: 'Rapid KL',
        interchanges: ['KL Monorail (MR4)', 'Lalaport BBCC Mall'],
        nextArrivalMins: 1,
        status: 'Departing',
        fareEst: 'RM 1.40',
        facilities: ['Direct entrance to Mitsui Shopping Park LaLaport BBCC'],
      },
      {
        id: 'st-chan-sow-lin',
        name: 'Chan Sow Lin Interchange',
        code: 'AG11/SP11',
        lat: 3.1285,
        lng: 101.7148,
        lineId: 'lrt-ampang-sripetaling',
        lineName: 'LRT Ampang / Sri Petaling (Lines 3/4)',
        lineColor: '#e67e22',
        operator: 'Rapid KL',
        interchanges: ['MRT Putrajaya Line (PY24)', 'Branch point to Ampang/Sri Petaling'],
        nextArrivalMins: 2,
        status: 'Normal',
        fareEst: 'RM 1.70',
        facilities: ['Underground direct walkway to MRT'],
      },
      {
        id: 'st-bukit-jalil',
        name: 'Bukit Jalil (National Stadium Hub)',
        code: 'SP17',
        lat: 3.0585,
        lng: 101.6872,
        lineId: 'lrt-ampang-sripetaling',
        lineName: 'LRT Sri Petaling (Line 4)',
        lineColor: '#e67e22',
        operator: 'Rapid KL',
        interchanges: ['Bukit Jalil National Sports Complex', 'Axiata Arena'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 2.80 from KL Sentral',
        facilities: ['Concert & Match crowd management concourse', 'Plaza walk'],
      },
      {
        id: 'st-ioi-puchong',
        name: 'IOI Puchong Jaya',
        code: 'SP24',
        lat: 3.0475,
        lng: 101.6215,
        lineId: 'lrt-ampang-sripetaling',
        lineName: 'LRT Sri Petaling (Line 4)',
        lineColor: '#e67e22',
        operator: 'Rapid KL',
        interchanges: ['IOI Mall Puchong Bridge', 'Puchong Commercial Belt'],
        nextArrivalMins: 5,
        status: 'Normal',
        fareEst: 'RM 3.30',
        facilities: ['Direct bridge into IOI Mall Puchong'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 5. MRT: Kajang Line (Line 9)
  // -------------------------------------------------------------
  {
    id: 'mrt-kajang',
    name: 'Kajang MRT Line (Line 9)',
    shortName: 'MRT Kajang',
    type: 'mrt',
    operator: 'Rapid KL',
    color: '#009432',
    borderColor: '#006266',
    frequency: 'Every 4 mins (Peak: 3 mins)',
    operatingHours: '06:00 - 23:50',
    coordinates: [
      { lat: 3.1762, lng: 101.5725 }, // Kwasa Damansara
      { lat: 3.1515, lng: 101.5792 }, // Kota Damansara
      { lat: 3.1502, lng: 101.5942 }, // Surian
      { lat: 3.1558, lng: 101.6085 }, // Mutiara Damansara (The Curve / IKEA)
      { lat: 3.1505, lng: 101.6162 }, // Bandar Utama (1 Utama)
      { lat: 3.1365, lng: 101.6285 }, // TTDI
      { lat: 3.1282, lng: 101.6415 }, // Phileo Damansara
      { lat: 3.1435, lng: 101.6625 }, // Pusat Bandar Damansara
      { lat: 3.1512, lng: 101.6660 }, // Semantan
      { lat: 3.1378, lng: 101.6892 }, // Muzium Negara (KL Sentral link)
      { lat: 3.1423, lng: 101.6962 }, // Pasar Seni MRT
      { lat: 3.1438, lng: 101.7018 }, // Merdeka (PNB 118)
      { lat: 3.1466, lng: 101.7115 }, // Bukit Bintang
      { lat: 3.1430, lng: 101.7196 }, // Tun Razak Exchange (TRX)
      { lat: 3.1360, lng: 101.7285 }, // Cochrane (MyTOWN / IKEA)
      { lat: 3.1255, lng: 101.7312 }, // Maluri (Sunway Velocity)
      { lat: 3.0785, lng: 101.7425 }, // Taman Connaught (Cheras)
      { lat: 2.9831, lng: 101.7909 }, // Kajang
    ],
    stations: [
      {
        id: 'st-bandar-utama',
        name: 'Bandar Utama MRT (1 Utama Megamall)',
        code: 'KG09',
        lat: 3.1505,
        lng: 101.6162,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['1 Utama Shopping Centre', 'LRT Shah Alam Line link (upcoming)'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 3.10 from KL Sentral',
        facilities: ['Direct air-conditioned bridge to 1 Utama Mall', 'Park & Ride'],
      },
      {
        id: 'st-muzium-negara',
        name: 'Muzium Negara (KL Sentral Underground Link)',
        code: 'KG15',
        lat: 3.1378,
        lng: 101.6892,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['KL Sentral (240m air-conditioned underground tunnel)'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 1.20',
        facilities: ['Underground moving travellator to KL Sentral', 'National Museum'],
      },
      {
        id: 'st-pasar-seni-mrt',
        name: 'Pasar Seni MRT',
        code: 'KG16',
        lat: 3.1423,
        lng: 101.6962,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['LRT Kelana Jaya (KJ14)', 'Central Market', 'Petaling Street'],
        nextArrivalMins: 2,
        status: 'Arriving',
        fareEst: 'RM 1.30',
        facilities: ['Direct integration with LRT and city buses'],
      },
      {
        id: 'st-merdeka-mrt',
        name: 'Merdeka MRT (Merdeka 118 & Stadium)',
        code: 'KG17',
        lat: 3.1438,
        lng: 101.7018,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['Merdeka 118 Tower', 'LRT Plaza Rakyat link (AG8/SP8)'],
        nextArrivalMins: 5,
        status: 'Normal',
        fareEst: 'RM 1.50',
        facilities: ['Underground link to Merdeka 118 and Plaza Rakyat'],
      },
      {
        id: 'st-bukit-bintang-mrt',
        name: 'Bukit Bintang MRT (Pavilion KL & Lot 10)',
        code: 'KG18',
        lat: 3.1466,
        lng: 101.7115,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['KL Monorail Bukit Bintang (MR6)', 'Pavilion KL', 'Fahrenheit88'],
        nextArrivalMins: 1,
        status: 'Arriving',
        fareEst: 'RM 1.80 from KL Sentral',
        facilities: ['5 street exits in the golden triangle', 'Direct mall concourse access'],
      },
      {
        id: 'st-trx-mrt',
        name: 'Tun Razak Exchange (TRX Super Interchange)',
        code: 'KG20',
        lat: 3.1430,
        lng: 101.7196,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['MRT Putrajaya Line (PY23)', 'The Exchange TRX Mall & Rooftop Park'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 2.00',
        facilities: ['Stacked cross-platform MRT interchange', 'Direct mall & park entry'],
      },
      {
        id: 'st-maluri',
        name: 'Maluri MRT & LRT Interchange',
        code: 'KG22',
        lat: 3.1255,
        lng: 101.7312,
        lineId: 'mrt-kajang',
        lineName: 'MRT Kajang Line (Line 9)',
        lineColor: '#009432',
        operator: 'Rapid KL',
        interchanges: ['LRT Ampang Line (AG13)', 'Sunway Velocity Mall', 'Aeon Maluri'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 2.40',
        facilities: ['Direct covered bridge to Sunway Velocity Mall'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 6. MRT: Putrajaya Line (Line 12)
  // -------------------------------------------------------------
  {
    id: 'mrt-putrajaya',
    name: 'Putrajaya MRT Line (Line 12)',
    shortName: 'MRT Putrajaya',
    type: 'mrt',
    operator: 'Rapid KL',
    color: '#eab308',
    borderColor: '#ca8a04',
    frequency: 'Every 4-5 mins',
    operatingHours: '06:00 - 23:55',
    coordinates: [
      { lat: 3.1762, lng: 101.5725 }, // Kwasa Damansara
      { lat: 3.2062, lng: 101.5812 }, // Sungai Buloh
      { lat: 3.1975, lng: 101.6052 }, // Sri Damansara Barat
      { lat: 3.2089, lng: 101.6288 }, // Kepong Sentral
      { lat: 3.2040, lng: 101.6738 }, // Kampung Batu (KTM interchange)
      { lat: 3.1812, lng: 101.6845 }, // Sentul Barat
      { lat: 3.1738, lng: 101.6955 }, // Titiwangsa (Hub)
      { lat: 3.1710, lng: 101.7088 }, // Hospital Kuala Lumpur (HKL)
      { lat: 3.1652, lng: 101.7145 }, // Raja Uda
      { lat: 3.1605, lng: 101.7190 }, // Ampang Park
      { lat: 3.1562, lng: 101.7158 }, // Persiaran KLCC
      { lat: 3.1485, lng: 101.7175 }, // Conlay (Pavilion East)
      { lat: 3.1425, lng: 101.7198 }, // TRX
      { lat: 3.1285, lng: 101.7148 }, // Chan Sow Lin
      { lat: 3.0910, lng: 101.6912 }, // Kuchai
      { lat: 3.0645, lng: 101.7078 }, // Sungai Besi
      { lat: 3.0035, lng: 101.7115 }, // UPM Serdang
      { lat: 2.9245, lng: 101.6685 }, // Cyberjaya City Centre
      { lat: 2.9312, lng: 101.6795 }, // Putrajaya Sentral
    ],
    stations: [
      {
        id: 'st-persiaran-klcc',
        name: 'Persiaran KLCC MRT',
        code: 'PY21',
        lat: 3.1562,
        lng: 101.7158,
        lineId: 'mrt-putrajaya',
        lineName: 'MRT Putrajaya Line (Line 12)',
        lineColor: '#eab308',
        operator: 'Rapid KL',
        interchanges: ['KLCC East Park', 'Ilham Tower', 'Troika'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'RM 2.20 from KL Sentral',
        facilities: ['Underground concourse', 'Park access'],
      },
      {
        id: 'st-ampang-park-mrt',
        name: 'Ampang Park MRT & LRT Interchange',
        code: 'PY20',
        lat: 3.1605,
        lng: 101.7190,
        lineId: 'mrt-putrajaya',
        lineName: 'MRT Putrajaya Line (Line 12)',
        lineColor: '#eab308',
        operator: 'Rapid KL',
        interchanges: ['LRT Kelana Jaya (KJ9)', 'Intermark Mall'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 2.10',
        facilities: ['Underground direct passenger transfer concourse'],
      },
      {
        id: 'st-hkl',
        name: 'Hospital Kuala Lumpur (HKL) MRT',
        code: 'PY18',
        lat: 3.1710,
        lng: 101.7088,
        lineId: 'mrt-putrajaya',
        lineName: 'MRT Putrajaya Line (Line 12)',
        lineColor: '#eab308',
        operator: 'Rapid KL',
        interchanges: ['General Hospital KL', 'National Blood Centre'],
        nextArrivalMins: 2,
        status: 'Arriving',
        fareEst: 'RM 2.30',
        facilities: ['Air-conditioned moving walkway directly into hospital'],
      },
      {
        id: 'st-putrajaya-sentral',
        name: 'Putrajaya Sentral Terminal',
        code: 'PY41',
        lat: 2.9312,
        lng: 101.6795,
        lineId: 'mrt-putrajaya',
        lineName: 'MRT Putrajaya Line (Line 12)',
        lineColor: '#eab308',
        operator: 'Rapid KL',
        interchanges: ['KLIA Transit (ER3)', 'Putrajaya Administrative Feeder', 'Cyberjaya Bus'],
        nextArrivalMins: 6,
        status: 'Normal',
        fareEst: 'RM 4.30 from KL Sentral via MRT',
        facilities: ['Federal government administrative gateway hub', 'Park & Ride'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 7. RAPID KL MONORAIL: Line 8
  // -------------------------------------------------------------
  {
    id: 'kl-monorail',
    name: 'KL Monorail Line (Line 8)',
    shortName: 'Rapid KL Monorail',
    type: 'monorail',
    operator: 'Rapid KL',
    color: '#84cc16',
    borderColor: '#4d7c0f',
    frequency: 'Every 5 mins',
    operatingHours: '06:00 - 23:45',
    coordinates: [
      { lat: 3.1338, lng: 101.6872 }, // KL Sentral Monorail
      { lat: 3.1315, lng: 101.6918 }, // Tun Sambanthan (Brickfields)
      { lat: 3.1415, lng: 101.6998 }, // Maharajalela (Chinatown south)
      { lat: 3.1402, lng: 101.7065 }, // Hang Tuah (LRT interchange)
      { lat: 3.1435, lng: 101.7099 }, // Imbi (Times Square)
      { lat: 3.1475, lng: 101.7128 }, // Bukit Bintang Monorail (Lot 10)
      { lat: 3.1518, lng: 101.7108 }, // Raja Chulan (Pavilion)
      { lat: 3.1568, lng: 101.7065 }, // Bukit Nanas (KL Tower link)
      { lat: 3.1610, lng: 101.7012 }, // Medan Tuanku
      { lat: 3.1662, lng: 101.6980 }, // Chow Kit
      { lat: 3.1738, lng: 101.6955 }, // Titiwangsa
    ],
    stations: [
      {
        id: 'st-monorail-kl-sentral',
        name: 'KL Sentral Monorail Concourse',
        code: 'MR1',
        lat: 3.1338,
        lng: 101.6872,
        lineId: 'kl-monorail',
        lineName: 'KL Monorail (Line 8)',
        lineColor: '#84cc16',
        operator: 'Rapid KL',
        interchanges: ['Nu Sentral Mall Concourse', 'Main KL Sentral Hub'],
        nextArrivalMins: 3,
        status: 'Normal',
        fareEst: 'Base Hub',
        facilities: ['Direct air-conditioned mall link to KL Sentral concourse'],
      },
      {
        id: 'st-monorail-hang-tuah',
        name: 'Hang Tuah Monorail & LRT',
        code: 'MR4',
        lat: 3.1402,
        lng: 101.7065,
        lineId: 'kl-monorail',
        lineName: 'KL Monorail (Line 8)',
        lineColor: '#84cc16',
        operator: 'Rapid KL',
        interchanges: ['LRT Lines 3 & 4 (AG9/SP9)', 'LaLaport BBCC'],
        nextArrivalMins: 2,
        status: 'Arriving',
        fareEst: 'RM 1.60',
        facilities: ['Seamless cross bridge to LRT concourse'],
      },
      {
        id: 'st-monorail-imbi',
        name: 'Imbi Monorail (Berjaya Times Square)',
        code: 'MR5',
        lat: 3.1435,
        lng: 101.7099,
        lineId: 'kl-monorail',
        lineName: 'KL Monorail (Line 8)',
        lineColor: '#84cc16',
        operator: 'Rapid KL',
        interchanges: ['Berjaya Times Square 1st Floor Bridge'],
        nextArrivalMins: 1,
        status: 'Departing',
        fareEst: 'RM 1.80 from KL Sentral',
        facilities: ['Direct 1st-floor entrance into Berjaya Times Square Mall'],
      },
      {
        id: 'st-monorail-bb',
        name: 'Bukit Bintang Monorail (Lot 10 & Sungei Wang)',
        code: 'MR6',
        lat: 3.1475,
        lng: 101.7128,
        lineId: 'kl-monorail',
        lineName: 'KL Monorail (Line 8)',
        lineColor: '#84cc16',
        operator: 'Rapid KL',
        interchanges: ['MRT Kajang Line (KG18)', 'Lot 10 Don Don Donki', 'Pavilion KL'],
        nextArrivalMins: 2,
        status: 'Normal',
        fareEst: 'RM 2.10 from KL Sentral',
        facilities: ['Elevated skybridge over Bukit Bintang crossroads'],
      },
      {
        id: 'st-monorail-bukit-nanas',
        name: 'Bukit Nanas Monorail (KL Tower & Forest Eco Park)',
        code: 'MR8',
        lat: 3.1568,
        lng: 101.7065,
        lineId: 'kl-monorail',
        lineName: 'KL Monorail (Line 8)',
        lineColor: '#84cc16',
        operator: 'Rapid KL',
        interchanges: ['LRT Dang Wangi (KJ12 link walkway)', 'KL Tower Shuttle'],
        nextArrivalMins: 4,
        status: 'Normal',
        fareEst: 'RM 2.40',
        facilities: ['Shuttle access to Menara KL observation tower'],
      },
      {
        id: 'st-monorail-titiwangsa',
        name: 'Titiwangsa Monorail Terminal',
        code: 'MR11',
        lat: 3.1738,
        lng: 101.6955,
        lineId: 'kl-monorail',
        lineName: 'KL Monorail (Line 8)',
        lineColor: '#84cc16',
        operator: 'Rapid KL',
        interchanges: ['LRT Ampang/Sri Petaling (AG3/SP3)', 'MRT Putrajaya (PY17)'],
        nextArrivalMins: 5,
        status: 'Normal',
        fareEst: 'RM 2.60 from KL Sentral',
        facilities: ['Direct connection to MRT Putrajaya and LRT'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 8. AIRPORT RAIL: KLIA Ekspres & Transit (Lines 6 & 7)
  // -------------------------------------------------------------
  {
    id: 'klia-ekspres',
    name: 'KLIA Ekspres & Transit (Lines 6 & 7)',
    shortName: 'Airport Rail Link',
    type: 'express',
    operator: 'ERL',
    color: '#0284c7',
    borderColor: '#0369a1',
    frequency: 'Every 15-20 mins (28 mins direct to KLIA)',
    operatingHours: '05:00 - 00:00',
    coordinates: [
      { lat: 3.1342, lng: 101.6865 }, // KL Sentral
      { lat: 3.0768, lng: 101.7118 }, // Bandar Tasik Selatan (TBS Hub)
      { lat: 2.9315, lng: 101.6800 }, // Putrajaya & Cyberjaya
      { lat: 2.8055, lng: 101.7375 }, // Salak Tinggi
      { lat: 2.7535, lng: 101.7015 }, // KLIA Terminal 1
      { lat: 2.7445, lng: 101.6865 }, // KLIA Terminal 2
    ],
    stations: [
      {
        id: 'st-klia-exp-kl-sentral',
        name: 'KL Sentral City Air Terminal (CAT)',
        code: 'ER1',
        lat: 3.1342,
        lng: 101.6865,
        lineId: 'klia-ekspres',
        lineName: 'KLIA Ekspres & Transit',
        lineColor: '#0284c7',
        operator: 'ERL',
        interchanges: ['In-Town Airline Flight Check-In', 'Malaysia Airlines', 'Batik Air'],
        nextArrivalMins: 8,
        status: 'Normal',
        fareEst: 'RM 55.00 (Ekspres to KLIA)',
        facilities: ['Flight check-in baggage drop counters', 'VIP lounge'],
      },
      {
        id: 'st-tbs-erl',
        name: 'Bandar Tasik Selatan (TBS) Transit',
        code: 'ER2',
        lat: 3.0768,
        lng: 101.7118,
        lineId: 'klia-ekspres',
        lineName: 'KLIA Transit',
        lineColor: '#0284c7',
        operator: 'ERL',
        interchanges: ['KTM Komuter', 'LRT Sri Petaling (SP15)', 'TBS Central Bus Terminal'],
        nextArrivalMins: 11,
        status: 'Normal',
        fareEst: 'RM 4.20 from KL Sentral',
        facilities: ['Interstate bus connections'],
      },
      {
        id: 'st-klia-t1',
        name: 'KLIA Terminal 1 Station',
        code: 'ER5',
        lat: 2.7535,
        lng: 101.7015,
        lineId: 'klia-ekspres',
        lineName: 'KLIA Ekspres & Transit',
        lineColor: '#0284c7',
        operator: 'ERL',
        interchanges: ['KLIA Main Airport Terminal', 'Aerotrain Transfer', 'Arrivals/Departures'],
        nextArrivalMins: 14,
        status: 'Normal',
        fareEst: 'RM 55.00',
        facilities: ['Direct level 1 airport terminal concourse link'],
      },
      {
        id: 'st-klia-t2',
        name: 'KLIA Terminal 2 Station (Gateway@klia2)',
        code: 'ER6',
        lat: 2.7445,
        lng: 101.6865,
        lineId: 'klia-ekspres',
        lineName: 'KLIA Ekspres & Transit',
        lineColor: '#0284c7',
        operator: 'ERL',
        interchanges: ['AirAsia Hub', 'Gateway@klia2 Shopping Mall'],
        nextArrivalMins: 18,
        status: 'Normal',
        fareEst: 'RM 55.00',
        facilities: ['Direct mall concourse link to AirAsia departures'],
      },
    ],
  },
];

export const INITIAL_TRACKING_STEPS: TrackingStep[] = [
  {
    id: 'track-1',
    order: 1,
    title: 'Depart from KL Sentral Transport Hub',
    locationName: 'KL Sentral Transit Hub',
    lat: 3.1342,
    lng: 101.6865,
    timeEstimate: '09:00 AM - 09:30 AM',
    distanceKm: 0,
    status: 'completed',
    transitMode: 'Departure Point (Hub of KTM, LRT, MRT, Monorail, ERL)',
    notes: 'Bought Touch n Go NFC card and grabbed morning teh tarik at station kopitiam.',
    arrivalWindow: 'Checked in at 09:00 AM',
  },
  {
    id: 'track-2',
    order: 2,
    title: 'Heritage & Souvenirs at Central Market',
    locationName: 'Central Market (Pasar Seni)',
    lat: 3.1453,
    lng: 101.6953,
    timeEstimate: '09:45 AM - 11:30 AM',
    distanceKm: 1.8,
    status: 'completed',
    transitMode: 'Kelana Jaya LRT (1 stop to Pasar Seni KJ14)',
    notes: 'Walked through batik shops and crossed the Kasturi Walk outdoor canopy.',
    arrivalWindow: 'Checked in at 09:50 AM',
  },
  {
    id: 'track-3',
    order: 3,
    title: 'Iconic Sights: Petronas Twin Towers & Suria KLCC',
    locationName: 'Petronas Twin Towers & KLCC Park',
    lat: 3.1579,
    lng: 101.7116,
    timeEstimate: '12:00 PM - 02:30 PM',
    distanceKm: 2.7,
    status: 'active',
    transitMode: 'LRT Kelana Jaya from Pasar Seni to KLCC Station (KJ10)',
    notes: 'Live tracking active! Walk through Suria KLCC air-conditioned concourse to Esplanade.',
    arrivalWindow: 'Expected arrival in 12 mins',
  },
  {
    id: 'track-4',
    order: 4,
    title: 'Street Dining & Satay at Jalan Alor',
    locationName: 'Jalan Alor Night Food Street',
    lat: 3.1460,
    lng: 101.7088,
    timeEstimate: '06:00 PM - 08:30 PM',
    distanceKm: 1.6,
    status: 'upcoming',
    transitMode: 'Bukit Bintang MRT (KG18) or KL Monorail (MR6)',
    notes: 'Sample grilled chicken wings, char kway teow, and coconut ice cream.',
    arrivalWindow: 'Estimated 06:15 PM',
  },
  {
    id: 'track-5',
    order: 5,
    title: 'Skyline Panorama at Merdeka Square',
    locationName: 'Merdeka Square & Sultan Abdul Samad',
    lat: 3.1487,
    lng: 101.6938,
    timeEstimate: '09:00 PM - 10:15 PM',
    distanceKm: 2.1,
    status: 'upcoming',
    transitMode: 'LRT to Masjid Jamek (KJ13/AG7) or evening Grab',
    notes: 'View illuminated Moorish clock tower across the historic heritage field.',
    arrivalWindow: 'Estimated 09:10 PM',
  },
];

/**
 * Helper to get all stations across all lines with deduplication
 */
export function getAllTransitStations(): TransitStation[] {
  const map = new Map<string, TransitStation>();
  TRANSIT_LINES.forEach((line) => {
    line.stations.forEach((station) => {
      if (!map.has(station.id)) {
        map.set(station.id, station);
      }
    });
  });
  return Array.from(map.values());
}
