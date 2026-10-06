import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  DollarSign,
  Building2,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  Video,
  Globe,
  Star,
  Check,
  Lock,
} from 'lucide-react';
import { api } from '../../api/client';
import { Doctor } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

const SPECIALTY_OPTIONS = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Psychiatry',
  'Oncology',
  'Gynecology & Obstetrics',
  'Endocrinology',
  'Ophthalmology',
  'Pulmonology',
  'Gastroenterology',
];

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

const AVATAR_PRESETS = [
  {
    label: 'Dr. Sarah (Cardiology)',
    url: 'https://images.unsplash.com/photo-1594824813689-ff8f943fcfd0?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Dr. Marcus (Surgery)',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Dr. Elena (Pediatrics)',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Dr. David (Neurology)',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Dr. Maya (Dermatology)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
];

interface AdminDoctorListResponse {
  doctors: Doctor[];
  total: number;
  stats?: {
    totalDoctors: number;
    activeDoctors: number;
    verifiedDoctors: number;
    specialtiesCount: number;
  };
}

export const AdminDoctorsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, filter & view state
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'new');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Doctor@2026!');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState<number>(8);
  const [consultationFee, setConsultationFee] = useState<number>(100);
  const [hospitalAffiliation, setHospitalAffiliation] = useState('Medicare Central Medical Hospital');
  const [consultationTypes, setConsultationTypes] = useState<('IN_PERSON' | 'VIDEO')[]>(['IN_PERSON', 'VIDEO']);
  const [availableDays, setAvailableDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [availableSlots, setAvailableSlots] = useState<string[]>([
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ]);
  const [languages, setLanguages] = useState('English, Spanish');
  const [biography, setBiography] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url);
  const [isVerified, setIsVerified] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Fetch admin doctors list
  const { data, isLoading } = useQuery({
    queryKey: ['adminDoctors', specialtyFilter, statusFilter, sortBy],
    queryFn: () =>
      api.get<AdminDoctorListResponse>(
        `/doctors/admin/all?specialization=${specialtyFilter}&status=${statusFilter}&sort=${sortBy}`
      ),
  });

  // Save / Register Doctor Mutation
  const saveDoctorMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingDoctor) {
        return api.patch(`/doctors/admin/${editingDoctor._id}`, payload);
      }
      return api.post('/doctors/admin', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalyticsOverview'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to register physician. Please check information.');
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (vars: { id: string; isActive: boolean }) =>
      api.patch(`/doctors/admin/${vars.id}`, { isActive: vars.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
    },
  });

  // Delete doctor mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalyticsOverview'] });
      setDeleteDoctorId(null);
    },
  });

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setName('');
    setEmail('');
    setPassword('Doctor@2026!');
    setPhone('+1 555-010-8822');
    setSpecialization('Cardiology');
    setCustomSpecialty('');
    setQualifications('MBBS, MD - Cardiology');
    setExperienceYears(8);
    setConsultationFee(120);
    setHospitalAffiliation('Medicare Central Medical Hospital');
    setConsultationTypes(['IN_PERSON', 'VIDEO']);
    setAvailableDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setAvailableSlots(['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']);
    setLanguages('English, Spanish');
    setBiography('Board-certified specialist dedicated to comprehensive diagnostic and patient-centered clinical care.');
    setAvatar(AVATAR_PRESETS[0].url);
    setIsVerified(true);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setEmail(doc.email);
    setPassword(''); // Leave blank unless updating
    setPhone(doc.phone || '');
    if (SPECIALTY_OPTIONS.includes(doc.specialization)) {
      setSpecialization(doc.specialization);
      setCustomSpecialty('');
    } else {
      setSpecialization('OTHER');
      setCustomSpecialty(doc.specialization);
    }
    setQualifications(doc.qualifications?.join(', ') || 'MBBS');
    setExperienceYears(doc.experienceYears || 0);
    setConsultationFee(doc.consultationFee || 0);
    setHospitalAffiliation(doc.hospitalAffiliation || 'Medicare Central Medical Hospital');
    setConsultationTypes(doc.consultationTypes || ['IN_PERSON', 'VIDEO']);
    setAvailableDays(doc.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setAvailableSlots(doc.availableSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']);
    setLanguages(doc.languages?.join(', ') || 'English');
    setBiography(doc.biography || '');
    setAvatar(doc.avatar || AVATAR_PRESETS[0].url);
    setIsVerified(doc.isVerified !== false);
    setIsActive(doc.isActive !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setFormError(null);
    if (searchParams.has('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  };

  const handleToggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleSlot = (slot: string) => {
    setAvailableSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleToggleType = (type: 'IN_PERSON' | 'VIDEO') => {
    setConsultationTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const actualSpecialty = specialization === 'OTHER' ? customSpecialty.trim() : specialization;
    if (!actualSpecialty) {
      setFormError('Please specify the medical specialization.');
      return;
    }

    if (!name.trim()) {
      setFormError('Physician name is required.');
      return;
    }

    if (!email.trim()) {
      setFormError('Physician email is required.');
      return;
    }

    const payload: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      specialization: actualSpecialty,
      qualifications,
      experienceYears: Number(experienceYears) || 0,
      consultationFee: Number(consultationFee) || 0,
      hospitalAffiliation: hospitalAffiliation.trim(),
      consultationTypes,
      availableDays,
      availableSlots,
      languages,
      biography: biography.trim(),
      avatar,
      isVerified,
      isActive,
    };

    if (!editingDoctor && password) {
      payload.password = password;
    }

    saveDoctorMutation.mutate(payload);
  };

  const doctorsList = data?.doctors || [];

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        doc.name.toLowerCase().includes(term) ||
        doc.email.toLowerCase().includes(term) ||
        doc.specialization.toLowerCase().includes(term) ||
        (doc.phone && doc.phone.toLowerCase().includes(term)) ||
        (doc.hospitalAffiliation && doc.hospitalAffiliation.toLowerCase().includes(term));
      return matchSearch;
    });
  }, [doctorsList, searchTerm]);

  const stats = data?.stats || {
    totalDoctors: doctorsList.length,
    activeDoctors: doctorsList.filter((d) => d.isActive).length,
    verifiedDoctors: doctorsList.filter((d) => d.isVerified).length,
    specialtiesCount: new Set(doctorsList.map((d) => d.specialization)).size,
  };

  if (isLoading) {
    return <LoadingState message="Loading administrative medical staff directory..." minHeight="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">Physicians & Clinical Directory</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Register and manage medical doctors manually, configure clinical specialties, consultation rates, and appointment availability.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Physician Manually</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Physicians</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Stethoscope className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.totalDoctors}</p>
          <span className="text-[11px] text-slate-500">Board staff enrolled</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Staff</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{stats.activeDoctors}</p>
          <span className="text-[11px] text-slate-500">Available for bookings</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Doctors</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-400 mt-2">{stats.verifiedDoctors}</p>
          <span className="text-[11px] text-slate-500">Credentials approved</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialties</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">{stats.specialtiesCount}</p>
          <span className="text-[11px] text-slate-500">Clinical departments</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by physician name, specialty, email, phone, or hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Specialty Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Specialties</option>
              {SPECIALTY_OPTIONS.map((spec) => (
                <option key={spec} value={spec} className="bg-slate-900">
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900">Active Only</option>
              <option value="INACTIVE" className="bg-slate-900">Inactive Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900">Newest First</option>
              <option value="rating" className="bg-slate-900">Highest Rated</option>
              <option value="experience" className="bg-slate-900">Most Experienced</option>
              <option value="fee_asc" className="bg-slate-900">Lowest Fee</option>
              <option value="fee_desc" className="bg-slate-900">Highest Fee</option>
              <option value="name" className="bg-slate-900">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Physician Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          title="No physicians found"
          description="There are currently no doctors matching your filters. You can register a new doctor manually anytime."
          icon={Stethoscope}
          actionText="Add Physician Manually"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className={`bg-slate-950 border rounded-3xl p-5 flex flex-col justify-between transition hover:border-slate-700 relative overflow-hidden group ${
                doc.isActive ? 'border-slate-800/80' : 'border-rose-900/30 opacity-75'
              }`}
            >
              {/* Card Header & Avatar */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.avatar || AVATAR_PRESETS[0].url}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800 shadow-md group-hover:border-emerald-500/40 transition"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = AVATAR_PRESETS[0].url;
                      }}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                        doc.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      title={doc.isActive ? 'Active' : 'Inactive'}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-white text-base truncate group-hover:text-emerald-400 transition">
                        {doc.name}
                      </h3>
                      {doc.isVerified && (
                        <span title="Board Certified & Verified">
                          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">
                      {doc.specialization}
                    </p>

                    <p className="text-[11px] text-slate-400 truncate">
                      {doc.qualifications?.join(', ') || 'MBBS'}
                    </p>
                  </div>
                </div>

                {/* Key Meta Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/70 text-xs">
                  <span className="inline-flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 font-medium border border-slate-800">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{doc.experienceYears}+ yrs exp</span>
                  </span>

                  <span className="inline-flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg text-emerald-400 font-bold border border-slate-800">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>${doc.consultationFee.toFixed(2)}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg text-amber-300 text-[11px] font-semibold border border-slate-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{doc.rating?.toFixed(1) || '4.9'}</span>
                  </span>

                  {doc.consultationTypes?.includes('VIDEO') && (
                    <span className="inline-flex items-center gap-1 bg-indigo-950/60 px-2 py-0.5 rounded-md text-indigo-300 text-[11px] border border-indigo-800/40">
                      <Video className="w-3 h-3" /> Telehealth
                    </span>
                  )}
                </div>

                {/* Hospital Affiliation & Contact */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{doc.hospitalAffiliation || 'Medicare Central Medical Hospital'}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate text-slate-300">{doc.email}</span>
                  </div>
                  {doc.phone && (
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{doc.phone}</span>
                    </div>
                  )}
                </div>

                {/* Available Days Chip Summary */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Available Days
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {doc.availableDays && doc.availableDays.length > 0 ? (
                      doc.availableDays.map((day) => (
                        <span
                          key={day}
                          className="text-[10px] font-semibold bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Mon - Fri (Default)</span>
                    )}
                  </div>
                </div>

                {/* Biography snippet */}
                {doc.biography && (
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 italic bg-slate-900/50 p-2 rounded-xl border border-slate-900">
                    "{doc.biography}"
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-800">
                <button
                  onClick={() =>
                    toggleActiveMutation.mutate({
                      id: doc._id,
                      isActive: !doc.isActive,
                    })
                  }
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                    doc.isActive
                      ? 'bg-slate-900 text-slate-300 hover:text-white border-slate-700'
                      : 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/60'
                  }`}
                >
                  {doc.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(doc)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                    title="Edit Physician Profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteDoctorId(doc._id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 transition"
                    title="Remove Physician"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Physician Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full my-8 p-5 sm:p-7 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingDoctor ? 'Edit Physician Profile' : 'Add Physician Manually'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingDoctor
                      ? `Update credentials & consultation parameters for ${editingDoctor.name}`
                      : 'Enroll a medical doctor and automatically provision their clinician account.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notification */}
            {formError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Identification & Basic Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> 1. Doctor Credentials & Account
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name (e.g. Dr. Sarah Jenkins) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address (Login Identity) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah.jenkins@medicare.health"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {!editingDoctor && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-slate-400" /> Initial Account Password
                      </label>
                      <input
                        type="text"
                        placeholder="Doctor@2026!"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Medical Specialization *
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      {SPECIALTY_OPTIONS.map((spec) => (
                        <option key={spec} value={spec} className="bg-slate-900">
                          {spec}
                        </option>
                      ))}
                      <option value="OTHER" className="bg-slate-900">Other (Custom Specialization)</option>
                    </select>

                    {specialization === 'OTHER' && (
                      <input
                        type="text"
                        placeholder="Enter custom specialty (e.g. Rheumatology)"
                        value={customSpecialty}
                        onChange={(e) => setCustomSpecialty(e.target.value)}
                        className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Qualifications (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="MBBS, MD - Cardiology, FACC"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Consultation Fee ($ USD) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      placeholder="English, Spanish"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hospital / Clinical Affiliation
                  </label>
                  <input
                    type="text"
                    value={hospitalAffiliation}
                    onChange={(e) => setHospitalAffiliation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Clinical Formats & Availability */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 2. Consultation Modes & Scheduling
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Supported Consultation Formats
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleType('IN_PERSON')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        consultationTypes.includes('IN_PERSON')
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> In-Clinic Examination
                      {consultationTypes.includes('IN_PERSON') && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleType('VIDEO')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        consultationTypes.includes('VIDEO')
                          ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Telehealth Video Consultation
                      {consultationTypes.includes('VIDEO') && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Active Clinical Consultation Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                      const isSelected = availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Standard Appointment Slots
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {availableSlots.length} slots active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {DEFAULT_SLOTS.map((slot) => {
                      const isSelected = availableSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleSlot(slot)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                            isSelected
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Profile Photo & Clinical Bio */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> 3. Profile Media & Clinical Bio
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Profile Avatar Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {AVATAR_PRESETS.map((preset) => {
                      const isSelected = avatar === preset.url;
                      return (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setAvatar(preset.url)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <span className="text-[10px] text-slate-400 truncate w-full text-center">
                            {preset.label.split(' ')[1]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Or Custom Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Clinical Biography & Background
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter physician clinical summary, fellowship background, and patient care philosophies..."
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Board Certified / Verified License
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Active for Public Appointments
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveDoctorMutation.isPending}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                >
                  {saveDoctorMutation.isPending
                    ? 'Saving...'
                    : editingDoctor
                    ? 'Update Physician'
                    : 'Register Physician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDoctorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Remove Physician Profile?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to remove this physician from the administrative registry? They will no longer be bookable for clinical consultations.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteDoctorId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteDoctorMutation.isPending}
                onClick={() => deleteDoctorMutation.mutate(deleteDoctorId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                {deleteDoctorMutation.isPending ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorsPage;
