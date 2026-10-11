import type { PurchaseLog, WasteLogEntry } from '@/lib/tracking';

export interface ProductData {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: 'Makanan & Minuman' | 'Perawatan Diri' | 'Pembersih Rumah' | 'Dapur & Pantry';
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  carbonFootprint: number; // 0-1
  sourcingScore: number;
  packagingScore: number;
  certificationScore: number;
  transparencyScore: number;
  certifications: string[];
  imageUrl: string;
  price: number;
  unit: string;
  avgLifespanDays: number;
  description: string;
  origin: string;
  ingredients: string;
  packagingType: string;
  co2PerUnitKg: number;
}

export function calculateEcoScoreAndGrade(
  carbon: number,
  sourcing: number,
  packaging: number,
  cert: number,
  transparency: number
): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'E' } {
  // Formula: eco_score = 0.25*carbon + 0.20*sourcing + 0.20*packaging + 0.20*cert + 0.15*transparency (0-100)
  const score = Math.round(
    (0.25 * carbon +
      0.20 * sourcing +
      0.20 * packaging +
      0.20 * cert +
      0.15 * transparency) *
      100
  );

  let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
  if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';
  else grade = 'E';

  return { score, grade };
}

export const SEED_PRODUCTS: ProductData[] = [
  {
    id: 'prod-01',
    barcode: '8991001100011',
    name: 'Beras Organik',
    brand: 'Nusantara Organik',
    category: 'Makanan & Minuman',
    ecoScore: 92,
    grade: 'A',
    carbonFootprint: 0.92,
    sourcingScore: 0.95,
    packagingScore: 0.88,
    certificationScore: 0.95,
    transparencyScore: 0.90,
    certifications: ['Organik Indonesia', 'Fair Trade', 'Non-GMO'],
    imageUrl: '/api/product-image?q=organic%20rice&label=Beras%20Organik',
    price: 95000,
    unit: 'sak (5kg)',
    avgLifespanDays: 30,
    description: 'Beras pandan wangi pulen dari petani lokal Cianjur, ditanam tanpa pestisida kimia dengan irigasi alami pegunungan.',
    origin: 'Cianjur, Jawa Barat, Indonesia',
    ingredients: '100% Beras Pandan Wangi Organik',
    packagingType: 'Karung Goni Ramah Lingkungan & Biodegradable',
    co2PerUnitKg: 1.2
  },
  {
    id: 'prod-02',
    barcode: '8991001100028',
    name: 'Beras Premium',
    brand: 'Lumbung Jaya',
    category: 'Makanan & Minuman',
    ecoScore: 54,
    grade: 'C',
    carbonFootprint: 0.50,
    sourcingScore: 0.55,
    packagingScore: 0.40,
    certificationScore: 0.50,
    transparencyScore: 0.80,
    certifications: ['SNI'],
    imageUrl: '/api/product-image?q=white%20rice&label=Beras%20Premium',
    price: 72000,
    unit: 'sak (5kg)',
    avgLifespanDays: 30,
    description: 'Beras putih poles standar konsumsi harian keluarga.',
    origin: 'Karawang, Indonesia',
    ingredients: 'Beras Putih Non-Organik',
    packagingType: 'Plastik Polipropilena (PP) Sekali Pakai',
    co2PerUnitKg: 3.8
  },
  {
    id: 'prod-03',
    barcode: '8992002200035',
    name: 'Minyak Kelapa',
    brand: 'CocoNusa Eco',
    category: 'Makanan & Minuman',
    ecoScore: 89,
    grade: 'A',
    carbonFootprint: 0.88,
    sourcingScore: 0.92,
    packagingScore: 0.90,
    certificationScore: 0.85,
    transparencyScore: 0.90,
    certifications: ['RSPO Certified', 'Rainforest Alliance', 'BPOM'],
    imageUrl: '/api/product-image?q=coconut%20oil&label=Minyak%20Kelapa',
    price: 38000,
    unit: 'botol (1L)',
    avgLifespanDays: 25,
    description: 'Minyak kelapa murni tanpa proses hidrogenasi, dipanen dari kebun kelapa berkelanjutan di Sulawesi Utara.',
    origin: 'Manado, Sulawesi Utara',
    ingredients: '100% Minyak Kelapa Murni (Cocos Nucifera)',
    packagingType: 'Botol Kaca Daur Ulang dengan Segel Aluminium',
    co2PerUnitKg: 1.4
  },
  {
    id: 'prod-04',
    barcode: '8992002200042',
    name: 'Minyak Sawit',
    brand: 'Sawit Prima',
    category: 'Makanan & Minuman',
    ecoScore: 42,
    grade: 'D',
    carbonFootprint: 0.35,
    sourcingScore: 0.40,
    packagingScore: 0.30,
    certificationScore: 0.50,
    transparencyScore: 0.65,
    certifications: ['SNI', 'Halal'],
    imageUrl: '/api/product-image?q=palm%20oil&label=Minyak%20Sawit',
    price: 34000,
    unit: 'pouch (2L)',
    avgLifespanDays: 25,
    description: 'Minyak goreng kelapa sawit olahan dengan fortifikasi Vitamin A.',
    origin: 'Riau, Indonesia',
    ingredients: 'Minyak Kelapa Sawit, Antioksidan TBHQ',
    packagingType: 'Pouch Plastik Multi-layer (Non-recyclable)',
    co2PerUnitKg: 5.2
  },
  {
    id: 'prod-05',
    barcode: '8993003300059',
    name: 'Sabun Batang Alami',
    brand: 'Botanica Bali',
    category: 'Perawatan Diri',
    ecoScore: 96,
    grade: 'A',
    carbonFootprint: 0.95,
    sourcingScore: 0.98,
    packagingScore: 1.0,
    certificationScore: 0.92,
    transparencyScore: 0.95,
    certifications: ['Cruelty-Free', 'Zero Waste', 'EcoCert Vegan'],
    imageUrl: '/api/product-image?q=soap%20bar&label=Sabun%20Batang%20Alami',
    price: 28000,
    unit: 'bar (100g)',
    avgLifespanDays: 20,
    description: 'Sabun mandi buatan tangan dengan metode cold-process, kaya gliserin alami dan minyak atsiri serai wangi.',
    origin: 'Ubud, Bali',
    ingredients: 'Saponified Olive Oil, Coconut Oil, Lemongrass Essential Oil, Spring Water',
    packagingType: 'Kertas Daur Ulang Berbiji (Plantable Seed Paper)',
    co2PerUnitKg: 0.3
  },
  {
    id: 'prod-06',
    barcode: '8993003300066',
    name: 'Sabun Mandi Cair',
    brand: 'GlowFresh Body',
    category: 'Perawatan Diri',
    ecoScore: 48,
    grade: 'D',
    carbonFootprint: 0.45,
    sourcingScore: 0.50,
    packagingScore: 0.35,
    certificationScore: 0.55,
    transparencyScore: 0.60,
    certifications: ['BPOM', 'Halal'],
    imageUrl: '/api/product-image?q=liquid%20soap&label=Sabun%20Mandi%20Cair',
    price: 32000,
    unit: 'botol (450ml)',
    avgLifespanDays: 20,
    description: 'Sabun mandi cair dengan busa melimpah dan aroma floral sintetis.',
    origin: 'Cikarang, Indonesia',
    ingredients: 'Aqua, Sodium Laureth Sulfate (SLS), Cocamide DEA, Fragrance, Parabens',
    packagingType: 'Botol Plastik PET HDPE Tebal dengan Pump Pompa Campuran',
    co2PerUnitKg: 2.9
  },
  {
    id: 'prod-07',
    barcode: '8994004400076',
    name: 'Deterjen Ramah Lingkungan',
    brand: 'BumiBersih Lab',
    category: 'Pembersih Rumah',
    ecoScore: 94,
    grade: 'A',
    carbonFootprint: 0.93,
    sourcingScore: 0.96,
    packagingScore: 0.92,
    certificationScore: 0.90,
    transparencyScore: 0.98,
    certifications: ['USDA Biobased', 'Ecolabel', 'Dermatologist Tested'],
    imageUrl: '/api/product-image?q=laundry%20detergent&label=Deterjen%20Ramah%20Lingkungan',
    price: 45000,
    unit: 'botol (1L)',
    avgLifespanDays: 30,
    description: 'Deterjen cucian berbahan dasar buah lerak alami dan enzim tumbuhan, 100% aman untuk air tanah dan kulit sensitif.',
    origin: 'Yogyakarta, Indonesia',
    ingredients: 'Sapindus Rarak (Lerak) Extract, Plant-based Glucoside, Lavender Essential Oil',
    packagingType: 'Botol HDPE 100% Daur Ulang Paska Konsumen (PCR)',
    co2PerUnitKg: 0.6
  },
  {
    id: 'prod-08',
    barcode: '8994004400083',
    name: 'Deterjen Bubuk',
    brand: 'SuperSparkle Wash',
    category: 'Pembersih Rumah',
    ecoScore: 32,
    grade: 'E',
    carbonFootprint: 0.30,
    sourcingScore: 0.30,
    packagingScore: 0.25,
    certificationScore: 0.40,
    transparencyScore: 0.40,
    certifications: ['SNI'],
    imageUrl: '/api/product-image?q=washing%20powder&label=Deterjen%20Bubuk',
    price: 36000,
    unit: 'kantong (1.8kg)',
    avgLifespanDays: 30,
    description: 'Deterjen bubuk dengan pemutih optik klorin dan busa pekat.',
    origin: 'Tangerang, Indonesia',
    ingredients: 'Linear Alkylbenzene Sulfonate (LAS), Sodium Tripolyphosphate (STPP), Chlorine Bleach',
    packagingType: 'Kantong Plastik Laminated Non-biodegradable',
    co2PerUnitKg: 6.4
  },
  {
    id: 'prod-09',
    barcode: '8995005500093',
    name: 'Pasta Gigi Herbal',
    brand: 'HerbalPure Dental',
    category: 'Perawatan Diri',
    ecoScore: 91,
    grade: 'A',
    carbonFootprint: 0.90,
    sourcingScore: 0.92,
    packagingScore: 0.88,
    certificationScore: 0.90,
    transparencyScore: 0.96,
    certifications: ['EcoCert', 'Cruelty-Free', 'Halal MUI'],
    imageUrl: '/api/product-image?q=toothpaste&label=Pasta%20Gigi%20Herbal',
    price: 35000,
    unit: 'tube (100g)',
    avgLifespanDays: 45,
    description: 'Pasta gigi dengan ekstrak daun sirih, cengkeh, dan arang bambu aktif untuk nafas segar alami tanpa mikroplastik.',
    origin: 'Bandung, Jawa Barat',
    ingredients: 'Calcium Carbonate, Betel Leaf Extract, Clove Oil, Activated Bamboo Charcoal, Stevia',
    packagingType: 'Tube Aluminium 100% Dapat Didaur Ulang',
    co2PerUnitKg: 0.4
  },
  {
    id: 'prod-10',
    barcode: '8995005500109',
    name: 'Sikat Gigi Bambu',
    brand: 'EcoBamboo Smile',
    category: 'Perawatan Diri',
    ecoScore: 97,
    grade: 'A',
    carbonFootprint: 0.96,
    sourcingScore: 0.98,
    packagingScore: 1.0,
    certificationScore: 0.95,
    transparencyScore: 0.96,
    certifications: ['FSC Certified', 'Compostable', 'Zero Plastic'],
    imageUrl: '/api/product-image?q=bamboo%20toothbrush&label=Sikat%20Gigi%20Bambu',
    price: 24000,
    unit: 'pack (2 pcs)',
    avgLifespanDays: 90,
    description: 'Gagang dibuat dari bambu Moso berkelanjutan yang dapat dikomposkan di pekarangan rumah, bulu sikat dari minyak jarak.',
    origin: 'Garut, Jawa Barat',
    ingredients: 'Bambu Moso Organik, Bulu Sikat Castor Bean Oil',
    packagingType: 'Kotak Kertas Kraft Daur Ulang Tanpa Plastik',
    co2PerUnitKg: 0.15
  },
  {
    id: 'prod-11',
    barcode: '8996006600116',
    name: 'Sabun Cuci Piring',
    brand: 'BumiBersih Lab',
    category: 'Pembersih Rumah',
    ecoScore: 88,
    grade: 'A',
    carbonFootprint: 0.86,
    sourcingScore: 0.90,
    packagingScore: 0.85,
    certificationScore: 0.88,
    transparencyScore: 0.92,
    certifications: ['Biodegradable Formula', 'BPOM Safe', 'Plant-Powered'],
    imageUrl: '/api/product-image?q=dishwashing%20liquid&label=Sabun%20Cuci%20Piring',
    price: 22000,
    unit: 'botol (800ml)',
    avgLifespanDays: 30,
    description: 'Cairan pembersih lemak piring dengan ekstrak jeruk nipis asli dan surfaktan nabati yang cepat terurai di perairan.',
    origin: 'Malang, Jawa Timur',
    ingredients: 'Plant Glucoside Surfactant, Lime Juice Concentrate, Sea Salt, Purified Water',
    packagingType: 'Botol PET 100% R-PET (Recycled Polyethylene)',
    co2PerUnitKg: 0.8
  },
  {
    id: 'prod-12',
    barcode: '8996006600123',
    name: 'Sabun Cuci Piring',
    brand: 'SuperKilap Dish',
    category: 'Pembersih Rumah',
    ecoScore: 50,
    grade: 'C',
    carbonFootprint: 0.48,
    sourcingScore: 0.52,
    packagingScore: 0.45,
    certificationScore: 0.50,
    transparencyScore: 0.60,
    certifications: ['Kemenkes RI'],
    imageUrl: '/api/product-image?q=dish%20soap&label=Sabun%20Cuci%20Piring',
    price: 16000,
    unit: 'pouch (750ml)',
    avgLifespanDays: 30,
    description: 'Sabun cuci piring busa melimpah dengan pewangi artifisial dan agen antibakteri kimia.',
    origin: 'Surabaya, Indonesia',
    ingredients: 'Sodium Lauryl Ether Sulfate, Alkyl Benzene Sulfonate, Pewarna Tartrazine',
    packagingType: 'Plastik Pouch Refill Konvensional',
    co2PerUnitKg: 3.1
  },
  {
    id: 'prod-13',
    barcode: '8997007700133',
    name: 'Susu Oat',
    brand: 'OatHills Farm',
    category: 'Makanan & Minuman',
    ecoScore: 87,
    grade: 'A',
    carbonFootprint: 0.89,
    sourcingScore: 0.88,
    packagingScore: 0.82,
    certificationScore: 0.90,
    transparencyScore: 0.85,
    certifications: ['USDA Organic', 'Carbon Neutral Product', 'Vegan'],
    imageUrl: '/api/product-image?q=oat%20milk&label=Susu%20Oat',
    price: 42000,
    unit: 'karton (1L)',
    avgLifespanDays: 10,
    description: 'Susu gandum nabati tanpa tambahan gula pasir, jejak karbon 70% lebih rendah dibanding susu sapi hewani.',
    origin: 'Bandung Barat, Indonesia',
    ingredients: 'Water, Organic Whole Oats (12%), Dipotassium Phosphate, Sea Salt',
    packagingType: 'Tetra Pak FSC Certified Recyclable Carton',
    co2PerUnitKg: 0.9
  },
  {
    id: 'prod-14',
    barcode: '8997007700140',
    name: 'Susu UHT',
    brand: 'Dairy Moo',
    category: 'Makanan & Minuman',
    ecoScore: 49,
    grade: 'D',
    carbonFootprint: 0.40,
    sourcingScore: 0.50,
    packagingScore: 0.60,
    certificationScore: 0.50,
    transparencyScore: 0.50,
    certifications: ['BPOM', 'Halal'],
    imageUrl: '/api/product-image?q=milk&label=Susu%20UHT',
    price: 21000,
    unit: 'karton (1L)',
    avgLifespanDays: 10,
    description: 'Susu sapi UHT segar dari peternakan intensif komersial.',
    origin: 'Pasuruan, Jawa Timur',
    ingredients: 'Susu Sapi Segar (100%)',
    packagingType: 'Tetra Pak Multilayer Standar',
    co2PerUnitKg: 3.2
  },
  {
    id: 'prod-15',
    barcode: '8998008800150',
    name: 'Shampoo Bar',
    brand: 'Botanica Bali',
    category: 'Perawatan Diri',
    ecoScore: 95,
    grade: 'A',
    carbonFootprint: 0.94,
    sourcingScore: 0.95,
    packagingScore: 1.0,
    certificationScore: 0.92,
    transparencyScore: 0.95,
    certifications: ['Zero Waste', 'Cruelty Free', 'Palm Oil Free'],
    imageUrl: '/api/product-image?q=shampoo%20bar&label=Shampoo%20Bar',
    price: 36000,
    unit: 'bar (80g)',
    avgLifespanDays: 40,
    description: 'Shampoo padat konsentrat setara 3 botol shampoo cair. Membersihkan kulit kepala tanpa meninggalkan sampah plastik.',
    origin: 'Gianyar, Bali',
    ingredients: 'Sodium Cocoyl Isethionate, Organic Aloe Vera, Argan Oil, Rosemary Extract',
    packagingType: 'Kaleng Aluminium Reusable / Refill Kertas',
    co2PerUnitKg: 0.35
  },
  {
    id: 'prod-16',
    barcode: '8998008800167',
    name: 'Shampoo Cair',
    brand: 'HairClean Pro',
    category: 'Perawatan Diri',
    ecoScore: 44,
    grade: 'D',
    carbonFootprint: 0.42,
    sourcingScore: 0.45,
    packagingScore: 0.38,
    certificationScore: 0.50,
    transparencyScore: 0.50,
    certifications: ['BPOM'],
    imageUrl: '/api/product-image?q=shampoo&label=Shampoo%20Cair',
    price: 48000,
    unit: 'botol (340ml)',
    avgLifespanDays: 30,
    description: 'Shampoo anti ketombe berbasis zinc pyrithione dan silicone.',
    origin: 'Bekasi, Jawa Barat',
    ingredients: 'Aqua, Sodium Laureth Sulfate, Dimethiconol, Zinc Pyrithione, Parfum',
    packagingType: 'Botol Plastik Polietilena Multilayer Berwarna',
    co2PerUnitKg: 2.8
  },
  {
    id: 'prod-17',
    barcode: '8999009900177',
    name: 'Gula Aren',
    brand: 'Nusantara Organik',
    category: 'Dapur & Pantry',
    ecoScore: 93,
    grade: 'A',
    carbonFootprint: 0.92,
    sourcingScore: 0.95,
    packagingScore: 0.90,
    certificationScore: 0.94,
    transparencyScore: 0.95,
    certifications: ['Organik Indonesia', 'Fair Trade Certified', 'Low GI'],
    imageUrl: '/api/product-image?q=palm%20sugar&label=Gula%20Aren',
    price: 29000,
    unit: 'pouch (500g)',
    avgLifespanDays: 60,
    description: 'Gula aren organik hasil penderasan nira pohon aren liar hutan Lebak Banten oleh koperasi petani lokal.',
    origin: 'Lebak, Banten',
    ingredients: '100% Nira Aren Murni (Arenga Pinnata)',
    packagingType: 'Pouch Kertas Kraft Bio-Plastik Cassava Berkompos',
    co2PerUnitKg: 0.7
  },
  {
    id: 'prod-18',
    barcode: '8999009900184',
    name: 'Gula Pasir',
    brand: 'Manis Murni',
    category: 'Dapur & Pantry',
    ecoScore: 52,
    grade: 'C',
    carbonFootprint: 0.50,
    sourcingScore: 0.55,
    packagingScore: 0.45,
    certificationScore: 0.55,
    transparencyScore: 0.60,
    certifications: ['SNI', 'Halal'],
    imageUrl: '/api/product-image?q=sugar&label=Gula%20Pasir',
    price: 18000,
    unit: 'pack (1kg)',
    avgLifespanDays: 45,
    description: 'Gula pasir kristal putih rafinasi dari tebu monokultur.',
    origin: 'Lampung, Indonesia',
    ingredients: 'Gula Tebu Rafinasi',
    packagingType: 'Plastik PE Bening Sekali Pakai',
    co2PerUnitKg: 2.5
  },
  {
    id: 'prod-19',
    barcode: '8990110011198',
    name: 'Kopi Arabika',
    brand: 'Kopi Lestari Rainforest',
    category: 'Makanan & Minuman',
    ecoScore: 94,
    grade: 'A',
    carbonFootprint: 0.93,
    sourcingScore: 0.96,
    packagingScore: 0.90,
    certificationScore: 0.95,
    transparencyScore: 0.96,
    certifications: ['Rainforest Alliance', 'Shade-Grown Bird Friendly', 'Fair Trade'],
    imageUrl: '/api/product-image?q=coffee%20bean&label=Kopi%20Arabika',
    price: 68000,
    unit: 'pack (250g)',
    avgLifespanDays: 30,
    description: 'Biji kopi arabika specialty yang ditanam di bawah naungan pohon kanopi hutan lindung Dataran Tinggi Gayo.',
    origin: 'Takengon, Aceh Tengah',
    ingredients: '100% Biji Kopi Arabika Gayo Organik',
    packagingType: 'Kantong Kertas Daur Ulang dengan Valve Degassing Ramah Lingkungan',
    co2PerUnitKg: 1.1
  },
  {
    id: 'prod-20',
    barcode: '8990110011204',
    name: 'Kopi Instan',
    brand: 'FastBrew Daily',
    category: 'Makanan & Minuman',
    ecoScore: 36,
    grade: 'D',
    carbonFootprint: 0.35,
    sourcingScore: 0.38,
    packagingScore: 0.20,
    certificationScore: 0.40,
    transparencyScore: 0.50,
    certifications: ['BPOM', 'Halal'],
    imageUrl: '/api/product-image?q=instant%20coffee&label=Kopi%20Instan',
    price: 17000,
    unit: 'bag (10 sachet)',
    avgLifespanDays: 14,
    description: 'Kopi instan serbuk manis dengan krimer nabati hidrogenasi dan perisa sintetik.',
    origin: 'Semarang, Indonesia',
    ingredients: 'Gula, Krimer Nabati, Kopi Instan (8%), Perisa Karamel',
    packagingType: '10x Sachet Aluminium Foil Plastik Multi-layer (Sulit Didaur Ulang)',
    co2PerUnitKg: 4.8
  },
  {
    id: 'prod-21',
    barcode: '8990220022210',
    name: 'Spons Serat Kelapa',
    brand: 'EcoScrub Natural',
    category: 'Pembersih Rumah',
    ecoScore: 98,
    grade: 'A',
    carbonFootprint: 0.98,
    sourcingScore: 0.99,
    packagingScore: 1.0,
    certificationScore: 0.95,
    transparencyScore: 0.98,
    certifications: ['100% Compostable', 'Zero Microplastics', 'FSC Cardboard'],
    imageUrl: '/api/product-image?q=coconut%20fiber&label=Spons%20Serat%20Kelapa',
    price: 26000,
    unit: 'pack (3 pcs)',
    avgLifespanDays: 60,
    description: 'Spons dapur alami bebas mikroplastik. Sabut kelapa membersihkan noda kerak tanpa menggores permukaan teflon.',
    origin: 'Kulon Progo, DIY',
    ingredients: 'Serat Sabut Kelapa Alami & Selulosa Kayu Alami',
    packagingType: 'Lengan Karton Daur Ulang Tanpa Plastik',
    co2PerUnitKg: 0.1
  },
  {
    id: 'prod-22',
    barcode: '8990220022227',
    name: 'Spons Busa',
    brand: 'PolyClean Scrubber',
    category: 'Pembersih Rumah',
    ecoScore: 40,
    grade: 'D',
    carbonFootprint: 0.38,
    sourcingScore: 0.40,
    packagingScore: 0.35,
    certificationScore: 0.45,
    transparencyScore: 0.50,
    certifications: ['Kemenkes'],
    imageUrl: '/api/product-image?q=kitchen%20sponge&label=Spons%20Busa',
    price: 12000,
    unit: 'pack (3 pcs)',
    avgLifespanDays: 30,
    description: 'Spons busa poliuretan dengan bantalan abrasif sintetis yang melepaskan mikroplastik setiap kali dipakai.',
    origin: 'Bekasi, Jawa Barat',
    ingredients: 'Polyurethane Foam, Nylon Fibers, Chemical Adhesive',
    packagingType: 'Plastik Polipropilena Seal',
    co2PerUnitKg: 2.6
  },
  {
    id: 'prod-23',
    barcode: '8990330033234',
    name: 'Kecap Manis',
    brand: 'Nusantara Organik',
    category: 'Makanan & Minuman',
    ecoScore: 90,
    grade: 'A',
    carbonFootprint: 0.90,
    sourcingScore: 0.92,
    packagingScore: 0.88,
    certificationScore: 0.90,
    transparencyScore: 0.92,
    certifications: ['Non-GMO', 'Organik Indonesia', 'Tanpa Pengawet'],
    imageUrl: '/api/product-image?q=soy%20sauce&label=Kecap%20Manis',
    price: 31000,
    unit: 'botol (300ml)',
    avgLifespanDays: 45,
    description: 'Kecap manis gurih kental dibuat dari fermentasi kedelai hitam lokal Malika dan gula kelapa nira murni selama 6 bulan.',
    origin: 'Majalengka, Jawa Barat',
    ingredients: 'Kedelai Hitam Malika Lokal, Gula Kelapa Organik, Garam Laut Madura, Rempah Alami',
    packagingType: 'Botol Kaca dengan Tutup Logam Dapat Didaur Ulang',
    co2PerUnitKg: 0.8
  },
  {
    id: 'prod-24',
    barcode: '8990330033241',
    name: 'Kecap Manis',
    brand: 'Sedap Rasa',
    category: 'Makanan & Minuman',
    ecoScore: 56,
    grade: 'C',
    carbonFootprint: 0.54,
    sourcingScore: 0.58,
    packagingScore: 0.45,
    certificationScore: 0.60,
    transparencyScore: 0.65,
    certifications: ['BPOM', 'Halal'],
    imageUrl: '/api/product-image?q=soy%20sauce&label=Kecap%20Manis',
    price: 22000,
    unit: 'pouch (520ml)',
    avgLifespanDays: 45,
    description: 'Kecap manis dapur dengan pewarna karamel III dan pengawet natrium benzoat.',
    origin: 'Tangerang, Banten',
    ingredients: 'Gula Tebu, Ekstrak Kedelai Impor, Garam, Pengawet Natrium Benzoat, Karamel',
    packagingType: 'Plastik Laminated Pouch Sekali Pakai',
    co2PerUnitKg: 2.2
  },
  {
    id: 'prod-25',
    barcode: '8990440044257',
    name: 'Tisu Toilet Bambu',
    brand: 'TreeFree Living',
    category: 'Perawatan Diri',
    ecoScore: 96,
    grade: 'A',
    carbonFootprint: 0.95,
    sourcingScore: 0.98,
    packagingScore: 0.95,
    certificationScore: 0.96,
    transparencyScore: 0.96,
    certifications: ['FSC 100% Bamboo', 'Chlorine-Free (TCF)', 'Zero Deforestation'],
    imageUrl: '/api/product-image?q=bamboo%20toilet%20paper&label=Tisu%20Toilet%20Bambu',
    price: 48000,
    unit: 'pack (6 roll)',
    avgLifespanDays: 20,
    description: 'Tisu lembut 3 lapis dari serat bambu cepat tumbuh. Menyelamatkan hutan tropis dari penebangan kayu pulp kertas.',
    origin: 'Bogor, Jawa Barat',
    ingredients: '100% Pulp Bambu Murni Tanpa Klorin',
    packagingType: 'Kertas Pembungkus Satuan Daur Ulang',
    co2PerUnitKg: 0.45
  },
  {
    id: 'prod-26',
    barcode: '8990440044264',
    name: 'Tisu Toilet',
    brand: 'SoftTissue Mega',
    category: 'Perawatan Diri',
    ecoScore: 47,
    grade: 'D',
    carbonFootprint: 0.42,
    sourcingScore: 0.48,
    packagingScore: 0.38,
    certificationScore: 0.52,
    transparencyScore: 0.58,
    certifications: ['SNI'],
    imageUrl: '/api/product-image?q=toilet%20paper&label=Tisu%20Toilet',
    price: 39000,
    unit: 'pack (10 roll)',
    avgLifespanDays: 20,
    description: 'Tisu toilet berbahan bubur kayu pohon konvensional dengan pemutih optik.',
    origin: 'Riau, Indonesia',
    ingredients: 'Virgin Wood Pulp, Optical Brightener',
    packagingType: 'Bungkus Plastik Polyethylene Tebal',
    co2PerUnitKg: 3.4
  },
  {
    id: 'prod-27',
    barcode: '8990550055271',
    name: 'Garam Laut',
    brand: 'Kusamba Heritage Salt',
    category: 'Dapur & Pantry',
    ecoScore: 97,
    grade: 'A',
    carbonFootprint: 0.98,
    sourcingScore: 0.98,
    packagingScore: 0.95,
    certificationScore: 0.94,
    transparencyScore: 0.98,
    certifications: ['Geographical Indication (IG)', 'Traditional Craft', 'Unrefined'],
    imageUrl: '/api/product-image?q=sea%20salt&label=Garam%20Laut',
    price: 25000,
    unit: 'toples (500g)',
    avgLifespanDays: 90,
    description: 'Garam laut artisan yang diuapkan menggunakan batang pohon kelapa di pesisir pasir hitam Kusamba, kaya mineral alami.',
    origin: 'Kusamba, Klungkung, Bali',
    ingredients: '100% Garam Laut Alami Kusamba Tanpa Anti-kempal Kimia',
    packagingType: 'Toples Kaca Kedap Udara dengan Tutup Kayu Bambu',
    co2PerUnitKg: 0.05
  },
  {
    id: 'prod-28',
    barcode: '8990660066288',
    name: 'Teh Hijau',
    brand: 'Gunung Mas Biodynamic',
    category: 'Makanan & Minuman',
    ecoScore: 95,
    grade: 'A',
    carbonFootprint: 0.94,
    sourcingScore: 0.96,
    packagingScore: 0.95,
    certificationScore: 0.96,
    transparencyScore: 0.95,
    certifications: ['Demeter Biodynamic', 'USDA Organic', 'Plastic-Free Teabags'],
    imageUrl: '/api/product-image?q=green%20tea&label=Teh%20Hijau',
    price: 38000,
    unit: 'box (25 kantong)',
    avgLifespanDays: 25,
    description: 'Teh hijau pucuk peko dipetik tangan dari kebun biodinamik bebas pestisida di lereng Gunung Mas Puncak.',
    origin: 'Puncak, Bogor, Indonesia',
    ingredients: '100% Daun Teh Hijau Organik Pilihan',
    packagingType: 'Kantong Teh Serat Jagung Tanpa Plastik & Kawat Stapler',
    co2PerUnitKg: 0.3
  },
  {
    id: 'prod-29',
    barcode: '8990770077295',
    name: 'Pembersih Lantai',
    brand: 'BumiBersih Lab',
    category: 'Pembersih Rumah',
    ecoScore: 91,
    grade: 'A',
    carbonFootprint: 0.89,
    sourcingScore: 0.92,
    packagingScore: 0.90,
    certificationScore: 0.90,
    transparencyScore: 0.94,
    certifications: ['Natural Anti-Bacterial', 'Pet Safe', 'Greywater Safe'],
    imageUrl: '/api/product-image?q=floor%20cleaner&label=Pembersih%20Lantai',
    price: 33000,
    unit: 'botol (1L)',
    avgLifespanDays: 30,
    description: 'Pembersih lantai antibakteri alami dengan aroma serai wangi pengusir serangga, ramah untuk hewan peliharaan & balita.',
    origin: 'Solo, Jawa Tengah',
    ingredients: 'Citronella Oil, Pine Oil, Bio-surfactants from Corn, Purified Water',
    packagingType: 'Botol HDPE Daur Ulang dengan Tutup Takar Ergonomis',
    co2PerUnitKg: 0.7
  },
  {
    id: 'prod-30',
    barcode: '8990880088301',
    name: 'Kedelai Organik',
    brand: 'Nusantara Organik',
    category: 'Dapur & Pantry',
    ecoScore: 96,
    grade: 'A',
    carbonFootprint: 0.96,
    sourcingScore: 0.97,
    packagingScore: 0.94,
    certificationScore: 0.96,
    transparencyScore: 0.97,
    certifications: ['Non-GMO Verified', 'Organik Indonesia', 'Direct Farm'],
    imageUrl: '/api/product-image?q=soybean&label=Kedelai%20Organik',
    price: 32000,
    unit: 'pack (1kg)',
    avgLifespanDays: 60,
    description: 'Kedelai lokal varietas Anjasmoro budidaya organik oleh kelompok tani Grobogan. Cocok untuk tempe, tahu, & susu kedelai.',
    origin: 'Grobogan, Jawa Tengah',
    ingredients: '100% Kedelai Lokal Non-GMO Organik',
    packagingType: 'Kantong Kertas Berpori Ramah Lingkungan',
    co2PerUnitKg: 0.5
  }
];

export interface InventoryItem {
  id: string;
  userId: string;
  productId: string;
  product: ProductData;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date
  purchasedAt: string;
  location: 'Pantry' | 'Kulkas' | 'Kamar Mandi' | 'Dapur';
  avgDailyConsumption: number;
}

export interface PredictionItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  product: ProductData;
  currentStock: number;
  avgDailyConsumption: number;
  daysRemaining: number;
  predictedEmptyDate: string;
  confidence: number; // 0.0 - 1.0
  urgency: 'high' | 'medium' | 'low';
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  isAiRecommended: boolean;
  priority: 'high' | 'medium' | 'low';
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  checked: boolean;
  carbonSavedKg: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  householdSize: number;
  dietaryPreference: string;
  greenPoints: number;
  badges: Array<{ id: string; name: string; description: string; icon: string; unlockedAt: string }>;
}

export const INITIAL_USER: UserProfile = {
  id: 'usr-001',
  name: 'Keluarga Bima & Lestari',
  email: 'bima.eco@example.com',
  householdSize: 4,
  dietaryPreference: 'Organik & Minim Plastik',
  greenPoints: 120,
  badges: [],
};

// Current date anchor for calculations
const NOW = new Date('2026-09-28T00:00:00Z');
function addDays(days: number): string {
  const d = new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-01',
    userId: 'usr-001',
    productId: 'prod-01',
    product: SEED_PRODUCTS[0],
    quantity: 1.2, // ~1.2 kg left
    unit: 'kg',
    expiryDate: addDays(45),
    purchasedAt: addDays(-20),
    location: 'Dapur',
    avgDailyConsumption: 0.35 // habis dalam ~3.4 hari
  },
  {
    id: 'inv-02',
    userId: 'usr-001',
    productId: 'prod-03',
    product: SEED_PRODUCTS[2],
    quantity: 0.25, // 250 ml left
    unit: 'liter',
    expiryDate: addDays(60),
    purchasedAt: addDays(-22),
    location: 'Dapur',
    avgDailyConsumption: 0.08 // habis dalam ~3.1 hari
  },
  {
    id: 'inv-03',
    userId: 'usr-001',
    productId: 'prod-07',
    product: SEED_PRODUCTS[6],
    quantity: 0.15, // 150 ml left
    unit: 'liter',
    expiryDate: addDays(180),
    purchasedAt: addDays(-26),
    location: 'Pantry',
    avgDailyConsumption: 0.06 // habis dalam ~2.5 hari
  },
  {
    id: 'inv-04',
    userId: 'usr-001',
    productId: 'prod-13',
    product: SEED_PRODUCTS[12],
    quantity: 0.3, // 300 ml left
    unit: 'liter',
    expiryDate: addDays(2), // EXPIRING SOON!
    purchasedAt: addDays(-6),
    location: 'Kulkas',
    avgDailyConsumption: 0.18 // habis dalam ~1.6 hari
  },
  {
    id: 'inv-05',
    userId: 'usr-001',
    productId: 'prod-09',
    product: SEED_PRODUCTS[8],
    quantity: 0.8,
    unit: 'tube',
    expiryDate: addDays(120),
    purchasedAt: addDays(-15),
    location: 'Kamar Mandi',
    avgDailyConsumption: 0.02
  },
  {
    id: 'inv-06',
    userId: 'usr-001',
    productId: 'prod-11',
    product: SEED_PRODUCTS[10],
    quantity: 0.45,
    unit: 'botol',
    expiryDate: addDays(90),
    purchasedAt: addDays(-10),
    location: 'Dapur',
    avgDailyConsumption: 0.04
  },
  {
    id: 'inv-07',
    userId: 'usr-001',
    productId: 'prod-19',
    product: SEED_PRODUCTS[18],
    quantity: 0.1, // 100g left
    unit: 'pack',
    expiryDate: addDays(40),
    purchasedAt: addDays(-18),
    location: 'Dapur',
    avgDailyConsumption: 0.03 // habis dalam ~3.3 hari
  },
  {
    id: 'inv-08',
    userId: 'usr-001',
    productId: 'prod-25',
    product: SEED_PRODUCTS[24],
    quantity: 1, // 1 roll left
    unit: 'roll',
    expiryDate: addDays(365),
    purchasedAt: addDays(-16),
    location: 'Kamar Mandi',
    avgDailyConsumption: 0.3 // habis dalam ~3 hari
  }
];

/**
 * Contoh catatan sampah (empiris, milik pengguna). Setiap entri punya berat & satuan
 * nyata yang dikonversi ke kg lewat tabel referensi. Tidak ada angka proyeksi.
 */
export const INITIAL_WASTE_LOGS: WasteLogEntry[] = [
  {
    id: 'w-01',
    productName: 'Sisa sayuran bayam',
    categoryId: 'organik',
    quantity: 0.6,
    unit: 'kg',
    reason: 'Layu di kulkas',
    date: addDays(-4),
    source: 'sisa',
  },
  {
    id: 'w-02',
    productName: 'Roti gandum (berjamur)',
    categoryId: 'organik',
    quantity: 0.3,
    unit: 'kg',
    reason: 'Melewati kedaluwarsa',
    date: addDays(-12),
    source: 'stok',
  },
  {
    id: 'w-03',
    productName: 'Botol PET minuman',
    categoryId: 'anorganik_daur',
    quantity: 6,
    unit: 'botol',
    reason: 'Kemasan sekali pakai',
    date: addDays(-9),
    source: 'kemasan',
  },
  {
    id: 'w-04',
    productName: 'Sachet kopi (foil multilayer)',
    categoryId: 'residu',
    quantity: 10,
    unit: 'sachet',
    reason: 'Kemasan sulit didaur',
    date: addDays(-7),
    source: 'kemasan',
  },
];

/**
 * Contoh catatan pembelian (empiris). Beberapa produk punya ≥2 pembelian
 * agar estimator bisa menghitung laju konsumsi nyata; sisanya sengaja tunggal
 * untuk mendemonstrasikan status "data belum cukup".
 */
export const INITIAL_PURCHASES: PurchaseLog[] = [
  { id: 'p-01', productName: 'Beras Pandan Wangi 5kg', category: 'Dapur & Pantry', quantity: 5, unit: 'kg', price: 95000, purchasedAt: addDays(-56) },
  { id: 'p-02', productName: 'Beras Pandan Wangi 5kg', category: 'Dapur & Pantry', quantity: 5, unit: 'kg', price: 95000, purchasedAt: addDays(-28) },
  { id: 'p-03', productName: 'Beras Pandan Wangi 5kg', category: 'Dapur & Pantry', quantity: 5, unit: 'kg', price: 95000, purchasedAt: addDays(-2) },
  { id: 'p-04', productName: 'Minyak Goreng 2L', category: 'Dapur & Pantry', quantity: 2, unit: 'liter', price: 34000, purchasedAt: addDays(-40) },
  { id: 'p-05', productName: 'Minyak Goreng 2L', category: 'Dapur & Pantry', quantity: 2, unit: 'liter', price: 34000, purchasedAt: addDays(-7) },
  { id: 'p-06', productName: 'Sabun Mandi Cair 450ml', category: 'Perawatan Diri', quantity: 1, unit: 'botol', price: 32000, purchasedAt: addDays(-10) },
  { id: 'p-07', productName: 'Deterjen Lerak 1L', category: 'Pembersih Rumah', quantity: 1, unit: 'botol', price: 45000, purchasedAt: addDays(-20) },
  { id: 'p-08', productName: 'Telur Ayam 1kg', category: 'Makanan & Minuman', quantity: 1, unit: 'kg', price: 30000, purchasedAt: addDays(-5) },
];
