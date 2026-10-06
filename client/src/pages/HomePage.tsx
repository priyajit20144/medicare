import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  ShoppingBag,
  Upload,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Activity,
  Star,
  Clock,
  Building2,
  Crown,
  FileCheck,
  ChevronRight,
  Plus,
  PhoneCall,
  Check,
  Stethoscope,
  Pill,
  ChevronDown,
  Lock,
  ThermometerSnowflake,
  UserCheck,
  Truck,
  Play,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Medicine, Doctor, HealthCheckupPackage } from '../types';
import { useCartStore } from '../store/cartStore';
import { useIntroStore } from '../store/introStore';
import { HealthcareDisclaimer } from '../components/common/HealthcareDisclaimer';
import { MedicineSection } from '../components/medicines/MedicineSection';
import { GRID_MEDICINES, TRENDING_PRODUCTS } from '../components/medicines/medicineData';
import { ScrollReveal, ScrollTimelineNav } from '../components/scroll';

// Curated static fallback data ensuring 100% visual uptime on all devices
const STATIC_MEDICINES: Medicine[] = [
  {
    _id: '6abc4035e9e7e2d4928549b0',
    slug: 'melatonin-5mg-dual-release',
    name: 'Melatonin 5mg Dual-Release Sleep Aid',
    genericName: 'Melatonin Micronized',
    brand: 'RestWell Nocturne',
    description: 'Immediate release layer helps fall asleep faster while extended release layer supports undisturbed night-time sleep cycles.',
    shortDescription: 'Dual-action fast and sustained natural circadian sleep support.',
    category: 'Vitamins & Dietary Supplements',
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'],
    price: 14.99,
    discountPrice: 11.99,
    stock: 260,
    sku: 'MED-MELA-005',
    manufacturer: 'HealthGuard Consumer',
    dosageForm: 'Dual Layer Tablet',
    strength: '5mg',
    packSize: 'Bottle of 100 Tablets',
    requiresPrescription: false,
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 140,
  },
  {
    _id: '6abc4035e9e7e2d4928549af',
    slug: 'montelukast-10mg',
    name: 'Montelukast Sodium 10mg Chewable',
    genericName: 'Montelukast',
    brand: 'SingulAir Care',
    description: 'Leukotriene receptor antagonist for prophylaxis and chronic treatment of bronchial asthma and relief of allergic rhinitis.',
    shortDescription: 'Leukotriene inhibitor for asthma prevention and seasonal rhinitis.',
    category: 'Respiratory & Allergy',
    images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400'],
    price: 29.00,
    discountPrice: 22.00,
    stock: 80,
    sku: 'MED-MONT-010',
    manufacturer: 'PulmoMed Technologies',
    dosageForm: 'Chewable Tablet',
    strength: '10mg',
    packSize: 'Box of 30 Tablets',
    requiresPrescription: true,
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 57,
  },
  {
    _id: '6abc4035e9e7e2d4928549a1',
    slug: 'paracetamol-500mg-rapid-release',
    name: 'Paracetamol 500mg Rapid Release Tablets',
    genericName: 'Paracetamol',
    brand: 'Panadol Advance',
    description: 'Fast acting fever and mild-to-moderate pain relief for headaches, musculoskeletal pain, and cold symptoms.',
    shortDescription: 'Fast acting fever reducer and pain relief.',
    category: 'Pain Relief & Fever',
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=400'],
    price: 9.99,
    discountPrice: 7.99,
    stock: 150,
    sku: 'MED-PARA-500',
    manufacturer: 'GSK Consumer Health',
    dosageForm: 'Film-Coated Tablet',
    strength: '500mg',
    packSize: 'Box of 32 Tablets',
    requiresPrescription: false,
    status: 'ACTIVE',
    rating: 4.9,
    reviewCount: 210,
  },
  {
    _id: '6abc4035e9e7e2d4928549a2',
    slug: 'amoxicillin-500mg-capsules',
    name: 'Amoxicillin 500mg Broad-Spectrum Capsules',
    genericName: 'Amoxicillin Trihydrate',
    brand: 'Amoxil Care',
    description: 'Broad-spectrum beta-lactam antibiotic for bacterial infections of the respiratory tract, ear, nose, throat, and skin.',
    shortDescription: 'Broad-spectrum antibiotic for bacterial infections.',
    category: 'Antibiotics & Anti-Infectives',
    images: ['https://images.unsplash.com/photo-1576073719676-aa955fc1bda9?auto=format&fit=crop&q=80&w=400'],
    price: 24.50,
    discountPrice: 19.99,
    stock: 95,
    sku: 'MED-AMOX-500',
    manufacturer: 'Sandoz Pharma',
    dosageForm: 'Hard Gelatin Capsule',
    strength: '500mg',
    packSize: 'Pack of 21 Capsules',
    requiresPrescription: true,
    status: 'ACTIVE',
    rating: 4.8,
    reviewCount: 145,
  },
  ...TRENDING_PRODUCTS,
  ...GRID_MEDICINES,
];

const STATIC_DOCTORS: Doctor[] = [
  {
    _id: '6abc4033e9e7e2d49285498e',
    name: 'Dr. Clara Zimmerman, MD',
    email: 'clara.z@medicare.demo',
    phone: '+1 (555) 200-0005',
    specialization: 'Pediatrics',
    qualifications: ['MD Pediatrics', 'FAAP'],
    experienceYears: 12,
    consultationFee: 95,
    biography: 'Caring, compassionate child healthcare from infancy through adolescence, growth milestones, vaccinations, and nutrition.',
    avatar: 'https://images.unsplash.com/photo-1594824813511-19d452093e9a?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'German'],
    consultationTypes: ['IN_PERSON', 'VIDEO'],
    rating: 5.0,
    reviewCount: 185,
    isVerified: true,
    isActive: true,
    hospitalAffiliation: 'Medicare Children’s Wellness Center',
  },
  {
    _id: '6abc4033e9e7e2d492854992',
    name: 'Dr. Hiba Zahra, MD',
    email: 'hiba.z@medicare.demo',
    phone: '+1 (555) 200-0009',
    specialization: 'Psychiatry',
    qualifications: ['MD Psychiatry', 'Board Certified in Adult Psychiatry'],
    experienceYears: 13,
    consultationFee: 150,
    biography: 'Empathetic, evidence-informed mental wellness, anxiety, depression therapy management, and cognitive behavioral consultations.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Arabic'],
    consultationTypes: ['VIDEO'],
    rating: 5.0,
    reviewCount: 160,
    isVerified: true,
    isActive: true,
    hospitalAffiliation: 'Medicare Mental Health & Behavioral Sciences',
  },
  {
    _id: '6abc4033e9e7e2d49285498a',
    name: 'Dr. Eliza Reed, MD',
    email: 'eliza.reed@medicare.demo',
    phone: '+1 (555) 200-0001',
    specialization: 'Cardiology',
    qualifications: ['MD Cardiology', 'FACC'],
    experienceYears: 16,
    consultationFee: 140,
    biography: 'Preventative cardiovascular care, hypertension management, lipid disorders, and non-invasive diagnostic evaluations.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Spanish'],
    consultationTypes: ['IN_PERSON', 'VIDEO'],
    rating: 4.9,
    reviewCount: 220,
    isVerified: true,
    isActive: true,
    hospitalAffiliation: 'Metropolitan Heart & Vascular Institute',
  },
  {
    _id: '6abc4033e9e7e2d49285498c',
    name: 'Dr. Julian Hayes, MD',
    email: 'julian.h@medicare.demo',
    phone: '+1 (555) 200-0003',
    specialization: 'Dermatology',
    qualifications: ['MD Dermatology', 'FAAD'],
    experienceYears: 14,
    consultationFee: 125,
    biography: 'Specializing in inflammatory skin disorders, eczema, acne therapies, mole surveillance, and clinical dermatosurgery.',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    languages: ['English'],
    consultationTypes: ['IN_PERSON', 'VIDEO'],
    rating: 4.9,
    reviewCount: 195,
    isVerified: true,
    isActive: true,
    hospitalAffiliation: 'Advanced Dermatology & Laser Clinic',
  }
];

const STATIC_PACKAGES: HealthCheckupPackage[] = [
  {
    _id: '6abc4034e9e7e2d4928549a0',
    name: 'Executive Comprehensive Health Checkup',
    slug: 'executive-health-checkup',
    description: 'Comprehensive full-body preventative diagnostic panel including CBC, Lipid Profile, Liver and Renal Function, and HbA1c.',
    price: 249,
    discountPrice: 189,
    duration: '1 - 2 hours',
    testCount: 24,
    recommendedFor: 'Adults aged 25+ seeking thorough yearly baseline screening.',
    status: 'ACTIVE',
  },
  {
    _id: '6abc4034e9e7e2d4928549a1',
    name: 'Cardiac Wellness & Lipid Risk Panel',
    slug: 'cardiac-wellness-screening',
    description: 'Advanced biomarker profiling for cardiovascular risk, high-sensitivity Troponin, CRP, Homocysteine, and full lipid subfractions.',
    price: 199,
    discountPrice: 149,
    duration: '45 mins',
    testCount: 18,
    recommendedFor: 'Individuals with hypertension, family history, or high stress levels.',
    status: 'ACTIVE',
  },
  {
    _id: '6abc4034e9e7e2d4928549a2',
    name: 'Advanced Diabetes & Metabolic Care Panel',
    slug: 'diabetes-advanced-care-panel',
    description: 'Complete glycemic evaluation including Fasting Glucose, HbA1c, Insulin resistance index, and microalbuminuria screening.',
    price: 159,
    discountPrice: 119,
    duration: '30 mins',
    testCount: 14,
    recommendedFor: 'Routine diabetic monitoring or preventative metabolic screening.',
    status: 'ACTIVE',
  }
];

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'medicines' | 'doctors' | 'checkups'>('medicines');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedCheckupSlug, setSelectedCheckupSlug] = useState('executive-health-checkup');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [addingId, setAddingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { playIntro, autoPlayOnVisit, toggleAutoPlayOnVisit } = useIntroStore();

  // Fetch featured medicines with static fallback
  const { data: medicinesData } = useQuery({
    queryKey: ['featuredMedicines'],
    queryFn: () => api.get<{ medicines: Medicine[] }>('/medicines?limit=8'),
  });

  // Fetch top doctors with static fallback
  const { data: doctorsData } = useQuery({
    queryKey: ['featuredDoctors'],
    queryFn: () => api.get<{ doctors: Doctor[] }>('/doctors?limit=4'),
  });

  // Fetch checkup packages with static fallback
  const { data: packagesData } = useQuery({
    queryKey: ['featuredPackages'],
    queryFn: () => api.get<HealthCheckupPackage[]>('/health-checkups/packages'),
  });

  // Resilient data resolution: API data first, static curated fallback second
  const displayMedicines: Medicine[] =
    medicinesData?.medicines && medicinesData.medicines.length > 0
      ? medicinesData.medicines
      : STATIC_MEDICINES;

  const displayDoctors: Doctor[] =
    doctorsData?.doctors && doctorsData.doctors.length > 0
      ? doctorsData.doctors
      : STATIC_DOCTORS;

  const displayPackages: HealthCheckupPackage[] =
    packagesData && packagesData.length > 0
      ? packagesData
      : STATIC_PACKAGES;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'medicines') {
      if (searchTerm.trim()) {
        navigate(`/medicines?search=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate('/medicines');
      }
    } else if (activeTab === 'doctors') {
      if (selectedSpecialty !== 'All') {
        navigate(`/doctors?specialization=${encodeURIComponent(selectedSpecialty)}`);
      } else {
        navigate('/doctors');
      }
    } else {
      navigate('/health-checkups');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, medId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAddingId(medId);
      await addToCart(medId, 1);
    } catch {
      // Handled
    } finally {
      setAddingId(null);
    }
  };

  const specialtiesList = [
    'All Specialties',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Psychiatry',
    'Neurology',
    'Orthopedics',
  ];

  const services = [
    {
      title: 'Digital Pharmacy & Cold Chain',
      desc: '100% genuine medications, temperature-controlled delivery, and automated refill tracking.',
      icon: ShoppingBag,
      link: '/medicines',
      accent: 'from-emerald-500 to-teal-600',
      badge: '2-Hr Delivery ⚡',
    },
    {
      title: 'Board Pharmacist Review',
      desc: 'Upload doctor prescriptions for clinical safety, drug-interaction checks, and rapid approval.',
      icon: FileCheck,
      link: '/prescriptions/upload',
      accent: 'from-blue-500 to-indigo-600',
      badge: 'Under 5 Min',
    },
    {
      title: 'Specialist Telehealth & Clinics',
      desc: 'Connect with verified board-certified physicians via HD encrypted video or in-person visits.',
      icon: Stethoscope,
      link: '/doctors',
      accent: 'from-violet-500 to-purple-600',
      badge: 'Zero Wait',
    },
    {
      title: 'Preventative Health Checkups',
      desc: 'Executive wellness screening with 20+ laboratory tests, home sample collection, and digital reports.',
      icon: Activity,
      link: '/health-checkups',
      accent: 'from-cyan-500 to-blue-600',
      badge: 'Accredited Labs',
    },
    {
      title: 'Certified Healthcare Facilities',
      desc: 'State-of-the-art diagnostic imaging hubs, collection centers, and licensed pharmacy hubs.',
      icon: Building2,
      link: '/facilities',
      accent: 'from-amber-500 to-orange-600',
      badge: 'Verified Centers',
    },
    {
      title: 'VIP 1-Year Healthcare Pass',
      desc: 'Complimentary annual executive checkup, unlimited free delivery, and priority specialist booking.',
      icon: Crown,
      link: '/premium',
      accent: 'from-rose-500 to-pink-600',
      badge: 'Save $450/Yr',
    },
  ];

  const trustMetrics = [
    { value: '50,000+', label: 'Prescriptions Verified & Delivered', icon: Pill },
    { value: '150+', label: 'Board-Certified Specialists', icon: Stethoscope },
    { value: '99.8%', label: 'Clinical Verification Accuracy', icon: ShieldCheck },
    { value: '< 15 Mins', label: 'Average Specialist Response Time', icon: Clock },
  ];

  const whyChooseUs = [
    {
      title: 'Cold-Chain Assured Delivery',
      desc: 'Insulated medical packaging maintains rigorous temperature integrity from pharmacy to your doorstep.',
      icon: ThermometerSnowflake,
    },
    {
      title: 'Strict Licensed Pharmacist Oversight',
      desc: 'Every prescription medication requires formal clinical approval by certified human pharmacists.',
      icon: UserCheck,
    },
    {
      title: '256-Bit Encrypted Health Records',
      desc: 'Full HIPAA-aligned cryptographic security protecting your lab tests, prescriptions, and consultations.',
      icon: Lock,
    },
    {
      title: 'Express Rapid Dispensing',
      desc: 'Strategic micro-fulfillment centers ensure critical medications reach patients in record time.',
      icon: Truck,
    },
  ];

  const faqs = [
    {
      q: 'How does the prescription review workflow protect patient safety?',
      a: 'When you upload your prescription (PDF, JPG, or PNG), our licensed clinical pharmacists independently verify physician credentials, active dosage requirements, potential contraindications, and expiry dates. Once verified, medications are instantly unlocked for secure delivery.',
    },
    {
      q: 'Are your doctors licensed and board-certified?',
      a: 'Every medical practitioner on Medicare undergoes stringent credential verification, including state medical board license verification, clinical residency history, malpractice checks, and hospital affiliations.',
    },
    {
      q: 'How does home sample collection work for health checkups?',
      a: 'Once you book a checkup package, an accredited certified phlebotomist visits your home or office at your scheduled time. Your specimens are transported via sealed cold-chain transit to certified diagnostic laboratories, and verified digital reports appear in your patient portal within 24 hours.',
    },
    {
      q: 'What is included in the 1-Year VIP Healthcare Membership?',
      a: 'VIP members enjoy a complimentary annual executive full-body health checkup ($229 value), unlimited free express delivery on all orders, two free specialist video visits, and 10% instant discounts on all medications.',
    },
    {
      q: 'What should I do in case of a medical emergency?',
      a: 'Medicare is an on-demand telehealth and outpatient pharmacy platform. If you are experiencing a life-threatening medical emergency, please immediately call 911 or your local emergency response service.',
    },
  ];

  const testimonials = [
    {
      name: 'Eleanor Vance',
      role: 'Chronic Asthma Patient',
      text: 'Having my Montelukast prescription verified within 4 minutes and delivered the same afternoon in a cold-chain pouch gave me incredible peace of mind. Truly world-class healthcare.',
      rating: 5,
      city: 'Seattle, WA',
    },
    {
      name: 'Dr. Marcus Vance, MD',
      role: 'Family Medicine Physician',
      text: 'The seamless coordination between doctor consultations and the pharmacist review queue sets a new industry benchmark for patient safety and clinical adherence.',
      rating: 5,
      city: 'Austin, TX',
    },
    {
      name: 'Sophia Chen',
      role: 'VIP Member',
      text: 'The Executive Health Checkup with home collection was effortless. The lab results were delivered with physician notes straight to my dashboard before dinner!',
      rating: 5,
      city: 'Boston, MA',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 sm:pb-24 w-full overflow-x-hidden relative">
      {/* Floating Section Timeline HUD Navigation (Interactive Quick Scroll Navigator) */}
      <ScrollTimelineNav />

      {/* 1. HERO SECTION (CONTAINED, STATIC & RESPONSIVE FOR ALL DEVICES) */}
      <section id="hero" className="relative pt-6 sm:pt-16 pb-14 sm:pb-24 bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 border-b border-slate-200/60 overflow-hidden w-full">
        {/* Ambient Gradient Halos */}
        <div className="absolute top-0 right-1/4 -mt-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-5 sm:left-10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />

        {/* Medical Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-medical-grid opacity-75 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Description & Tabbed Search Hub */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-7">
              
              {/* Trust Badge & Watch Intro Action */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300/70 text-emerald-900 text-xs font-bold shadow-sm backdrop-blur-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  <span className="tracking-wide">HIPAA & FDA Compliant Healthcare Ecosystem</span>
                </div>

                <button
                  type="button"
                  id="home-badge-watch-intro"
                  onClick={playIntro}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-[#0d9488] text-white text-xs font-bold shadow-sm transition group"
                  title="Watch Medicare Platform Intro Animation"
                >
                  <Play className="w-3 h-3 fill-current text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Watch Intro ▶</span>
                </button>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Healthcare Made{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  Simple
                </span>
                , Trusted & On-Demand.
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal">
                Experience unified healthcare: order genuine cold-chain medications, get prescriptions approved by licensed clinical pharmacists in minutes, schedule specialist telehealth consultations, and book diagnostic checkups.
              </p>

              {/* Interactive Multi-Tab Search & Discovery Hub */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl shadow-slate-200/80 border border-slate-200/90 relative w-full">
                {/* Search Mode Tabs - Evenly distributed for mobile, tablet, and desktop */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-xl sm:rounded-2xl mb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('medicines')}
                    className={`min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'medicines'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Medicines</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('doctors')}
                    className={`min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'doctors'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Doctors</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('checkups')}
                    className={`min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      activeTab === 'checkups'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 flex-shrink-0" />
                    <span className="truncate">Checkups</span>
                  </button>
                </div>

                {/* Tab 1: Medicines Search */}
                {activeTab === 'medicines' && (
                  <form onSubmit={handleSearchSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-50 rounded-xl sm:rounded-2xl p-1.5 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition gap-2">
                      <div className="flex items-center flex-1 px-2">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                        <input
                          id="home-search-input"
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search medicines (e.g., Paracetamol, Melatonin)..."
                          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400 font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        id="home-search-btn"
                        className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl transition shadow-md shadow-emerald-600/20 flex-shrink-0 flex items-center justify-center"
                      >
                        Search Store
                      </button>
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Trending:
                      </span>
                      {['Paracetamol', 'Melatonin', 'Montelukast', 'Amoxicillin', 'Vitamins'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => navigate(`/medicines?search=${encodeURIComponent(item)}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-600 transition font-semibold text-[11px] sm:text-xs"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </form>
                )}

                {/* Tab 2: Doctor Specialty Selector */}
                {activeTab === 'doctors' && (
                  <form onSubmit={handleSearchSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="w-full relative">
                        <select
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full min-h-[44px] py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                        >
                          {specialtiesList.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                      </div>
                      <button
                        type="submit"
                        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition shadow-md flex-shrink-0 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Find Specialist</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      All physicians offer both secure encrypted video telehealth and in-person visits.
                    </p>
                  </form>
                )}

                {/* Tab 3: Checkups Selector */}
                {activeTab === 'checkups' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select
                        value={selectedCheckupSlug}
                        onChange={(e) => setSelectedCheckupSlug(e.target.value)}
                        className="w-full min-h-[44px] py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      >
                        <option value="executive-health-checkup">Executive Health Checkup (24 Tests)</option>
                        <option value="cardiac-wellness-screening">Cardiac Risk Panel (18 Tests)</option>
                        <option value="diabetes-advanced-care-panel">Diabetes Care Panel (14 Tests)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => navigate('/health-checkups')}
                        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition shadow-md flex-shrink-0 flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Explore Packages</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Includes certified home specimen collection with guaranteed digital report within 24h.
                    </p>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <Link
                  to="/medicines"
                  id="home-cta-shop-medicines"
                  className="min-h-[44px] px-5 sm:px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group flex-1 sm:flex-initial"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Shop Medicines</span>
                </Link>

                <Link
                  to="/doctors"
                  id="home-cta-book-doctor"
                  className="min-h-[44px] px-5 sm:px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-slate-200 transition shadow-sm hover:border-emerald-300 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Consult Doctor</span>
                </Link>

                <Link
                  to="/prescriptions/upload"
                  id="home-cta-upload-rx"
                  className="min-h-[44px] px-5 sm:px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-emerald-200 transition shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload Rx</span>
                </Link>

                <button
                  type="button"
                  id="home-cta-intro-btn"
                  onClick={playIntro}
                  className="min-h-[44px] px-5 sm:px-6 py-3 bg-slate-900 hover:bg-[#0d9488] text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition shadow-md flex items-center justify-center gap-2 group flex-1 sm:flex-initial"
                  title="Watch Platform Intro Animation"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Platform Intro</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Showcase & Safely Positioned Badges */}
            <div className="lg:col-span-5 relative w-full mt-4 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border-4 border-white/90 bg-white">
                <img
                  src="/images/hero_banner.jpg"
                  alt="Medicare Medical Team with Advanced Clinical Technology"
                  className="w-full h-[320px] sm:h-[440px] object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-[10px] sm:text-[11px] font-bold mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    <span>Advanced Clinical Care Network</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-200 font-medium">
                    Integrated pharmacy, specialist telehealth & laboratory diagnostics.
                  </p>
                </div>
              </div>

              {/* Floating Badge 1: Top-Left (Contained safely on mobile) */}
              <div className="absolute top-2 left-2 sm:-top-4 sm:-left-6 p-2.5 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-20 animate-float">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-900">Rx Verified</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                    Avg 4-min Review
                  </p>
                </div>
              </div>

              {/* Floating Badge 2: Bottom-Right (Contained safely on mobile) */}
              <div className="absolute bottom-14 sm:-bottom-5 right-2 sm:-right-4 p-2.5 sm:p-3.5 bg-slate-950/90 text-white backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 z-20 animate-float-delayed">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">18 Doctors Online</span>
                  <p className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold">
                    Instant HD Video
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE HEALTH METRICS TICKER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-14 relative z-20 w-full">
        <ScrollReveal effect="fade-up" duration={0.5}>
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {trustMetrics.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="pt-3 sm:pt-0 sm:px-6 first:pt-0 first:pl-0 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {item.value}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-semibold leading-snug">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. EMERGENCY CARE & TELE-TRIAGE ALERT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up" delay={0.1}>
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-800">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
              <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  24/7 Hotline
                </span>
                <span className="text-xs text-emerald-400 font-bold hidden sm:inline">On-Duty Doctors Available</span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-white">
                Urgent Medical Consultation or Prescription Refill Needed?
              </h3>
              <p className="text-xs text-slate-300">
                Call toll-free <strong className="text-white">1-800-MEDICARE</strong> or start an expedited tele-triage session.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto flex-shrink-0">
            <a
              href="tel:18006334227"
              className="min-h-[44px] flex-1 md:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs text-center transition shadow-md shadow-rose-600/30 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
            <Link
              to="/doctors"
              className="min-h-[44px] flex-1 md:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs text-center transition border border-white/20 flex items-center justify-center"
            >
              Start Video Visit
            </Link>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* 4. HEALTHCARE SERVICES BENTO-GRID */}
      <section id="quick-services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Comprehensive Clinical Care
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Healthcare Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              From verified pharmaceutical dispensing to certified diagnostic checkups, experience clinical excellence at every step.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={idx} effect="fade-up" staggerIndex={idx}>
                <Link
                  to={s.link}
                  className="group relative p-6 sm:p-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${s.accent} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      {s.badge && (
                        <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                    <span>Explore Service</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 5. 3-STEP PRESCRIPTION VERIFICATION JOURNEY */}
      {/* 5. 3-STEP PRESCRIPTION VERIFICATION JOURNEY */}
      <section id="prescription-upload" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-emerald-950 rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <FileCheck className="w-4 h-4" /> Board-Certified Pharmacist Verification
                </span>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Have a Doctor’s Prescription? We Verify & Dispense in 3 Simple Steps.
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  Upload your medical prescription file in high resolution (PDF, JPG, or PNG). Our licensed clinical pharmacists review and verify dosage, check safety interactions, and deliver genuine medications straight to your home.
                </p>

                {/* 3 Step Visual Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-white">Upload File</h4>
                    <p className="text-[11px] text-slate-400">PDF, PNG or JPG encrypted transfer</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="w-6 h-6 rounded-lg bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-xs font-bold text-white">Clinical Review</h4>
                    <p className="text-[11px] text-slate-400">Licensed pharmacist checks dosage</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-xs font-bold text-white">Fast Delivery</h4>
                    <p className="text-[11px] text-slate-400">Cold-chain express to your door</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/prescriptions/upload"
                    className="min-h-[44px] px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 group flex-1 sm:flex-initial"
                  >
                    <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Upload Prescription Document</span>
                  </Link>
                  <Link
                    to="/medicines"
                    className="min-h-[44px] px-4 py-3 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-1"
                  >
                    Browse Pharmacy Catalog <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Interactive Upload Dropzone Preview */}
              <div className="lg:col-span-5 w-full">
                <div
                  onClick={() => navigate('/prescriptions/upload')}
                  className="cursor-pointer group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border-2 border-dashed border-emerald-400/40 hover:border-emerald-400 hover:bg-white/10 transition-all text-center space-y-3.5"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Click to Upload Doctor Prescription
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      Supports PDF, JPG, PNG files up to 10MB
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-semibold border border-emerald-500/30">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-Bit HIPAA Compliant Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. POPULAR MEDICATIONS CATALOG SHOWCASE (ANIMATED RESPONSIVE BENTO & TRENDING) */}
      <MedicineSection />

      {/* 7. TOP SPECIALIST DOCTORS SHOWCASE */}
      <section id="doctors-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Expert Clinical Consultation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Book Certified Specialists
              </h2>
            </div>
            <Link
              to="/doctors"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Browse all physicians <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayDoctors.map((doc, idx) => (
            <ScrollReveal key={doc._id} effect="zoom-in" staggerIndex={idx}>
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={doc.avatar || 'https://images.unsplash.com/photo-1594824813511-19d452093e9a?auto=format&fit=crop&q=80&w=200'}
                      alt={doc.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{doc.name}</h3>
                      <p className="text-xs font-bold text-emerald-600 truncate">{doc.specialization}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-bold text-slate-700 text-xs">{doc.rating}</span>
                        <span className="text-slate-400 text-[11px]">({doc.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {doc.biography}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 pb-3 border-b border-slate-100">
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold text-slate-700">{doc.experienceYears}+ Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultation:</span>
                      <span className="font-black text-slate-900">${doc.consultationFee}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/doctors/${doc._id}`}
                  className="min-h-[40px] mt-4 w-full py-2.5 text-center bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center"
                >
                  Book Consultation
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 8. PREVENTATIVE CHECKUP PACKAGES */}
      <section id="checkups-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Preventative Diagnostic Screening
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Health Checkup Packages
              </h2>
            </div>
            <Link
              to="/health-checkups"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {displayPackages.slice(0, 3).map((pkg, idx) => (
            <ScrollReveal key={pkg._id} effect="fade-up" staggerIndex={idx}>
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between h-full">
                <div>
                  <span className="px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-3">
                    {pkg.testCount} Clinical Tests Included
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3.5">{pkg.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Est. Duration: {pkg.duration}</span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      ${pkg.discountPrice || pkg.price}
                    </span>
                    {pkg.discountPrice && (
                      <span className="ml-1.5 text-xs text-slate-400 line-through">
                        ${pkg.price}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/health-checkups/${pkg.slug || pkg._id}`}
                    className="min-h-[38px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center"
                  >
                    Book Package
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 9. VIP 1-YEAR MEMBERSHIP LUXURY SPOTLIGHT */}
      <section id="premium-care" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-600 rounded-2xl sm:rounded-3xl p-6 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-xl space-y-3.5 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                <Crown className="w-4 h-4" /> Medicare VIP Care
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                One Full Year of Total Healthcare Peace of Mind.
              </h2>
              <p className="text-xs sm:text-sm text-amber-50 leading-relaxed">
                Includes an annual executive health checkup ($229 value), unlimited free cold-chain medicine delivery, two complimentary specialist video visits, and 10% instant discounts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-amber-50">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-white flex-shrink-0" /> Free Annual Executive Checkup
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-white flex-shrink-0" /> Unlimited Free Express Delivery
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-white flex-shrink-0" /> 2 Free Specialist Video Consults
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-white flex-shrink-0" /> 10% Storewide Pharmacy Discount
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/20 text-center w-full sm:w-auto min-w-[260px] sm:min-w-[280px] space-y-3">
              <span className="text-xs uppercase font-extrabold text-amber-100 tracking-wider">
                1-Year All-Inclusive Membership
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white">
                $149 <span className="text-xs font-normal text-amber-100">/ 1 Year</span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Saves over $450 in direct annual healthcare expenses
              </p>
              <Link
                to="/premium"
                id="home-vip-subscribe-btn"
                className="min-h-[44px] block w-full py-3.5 px-6 bg-white hover:bg-amber-50 text-amber-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center"
              >
                Join Medicare VIP Now
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 10. WHY PATIENTS TRUST MEDICARE (SECURITY & CLINICAL QUALITY) */}
      <section id="trust-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Uncompromising Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Patients Trust Medicare
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {whyChooseUs.map((w, idx) => {
            const Icon = w.icon;
            return (
              <ScrollReveal key={idx} effect="fade-up" staggerIndex={idx}>
                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-2.5 hover:border-emerald-300 transition h-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{w.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 11. VERIFIED PATIENT STORIES & TESTIMONIALS */}
      <section id="reviews-hub" className="bg-slate-100/70 py-12 sm:py-16 border-y border-slate-200/80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollReveal effect="fade-up">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Real Patient Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Trusted by 18,400+ Patients
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, idx) => (
              <ScrollReveal key={idx} effect="blur-reveal" staggerIndex={idx}>
                <div className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3.5 flex flex-col justify-between h-full">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                      <p className="text-[11px] text-slate-400">{t.role}</p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      Verified
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 12. INTERACTIVE PLATFORM INTRO & NEXT VISIT TOUR CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" id="intro">
        <ScrollReveal effect="fade-up">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
              <div className="max-w-xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Platform Intro</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Experience the Medicare Intro Animation
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Watch our real-time 256-bit encrypted ECG heartbeat monitor, cold-chain formulary verification, and board-certified clinical review sequence in action.
                </p>

                {/* Next Time Preference Toggle (User Request) */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 cursor-pointer select-none transition group">
                    <input
                      type="checkbox"
                      id="home-intro-autoplay-toggle"
                      checked={autoPlayOnVisit}
                      onChange={() => toggleAutoPlayOnVisit()}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      Show intro animation automatically on my next visit
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 ${
                      autoPlayOnVisit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {autoPlayOnVisit ? 'Enabled ✓' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
                <button
                  type="button"
                  id="home-play-intro-section-btn"
                  onClick={playIntro}
                  className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 group"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Play Intro Animation Now</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 13. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section id="faq-hub" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ScrollReveal effect="fade-up">
          <div className="text-center mb-8 sm:mb-10 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Patient Clarity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-2.5 sm:space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <ScrollReveal key={i} effect="fade-up" staggerIndex={i}>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="min-h-[44px] w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100"
                      >
                        {f.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 13. REGULATORY MEDICAL SAFETY DISCLAIMER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <HealthcareDisclaimer type="general" />
      </section>
    </div>
  );
};
