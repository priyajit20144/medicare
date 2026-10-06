import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Star,
  Calendar,
  Video,
  MapPin,
  Clock,
  ArrowRight,
  Stethoscope,
  Award,
} from 'lucide-react';
import { api } from '../../api/client';
import { Doctor } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const DoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const specialization = searchParams.get('specialization') || '';
  const consultationType = searchParams.get('consultationType') || '';
  const sort = searchParams.get('sort') || 'rating';

  // Fetch specialties
  const { data: specialties } = useQuery({
    queryKey: ['doctorSpecialties'],
    queryFn: () => api.get<string[]>('/doctors/meta/specialties'),
  });

  // Fetch doctors
  const { data: doctorsResponse, isLoading, isError } = useQuery({
    queryKey: ['doctors', { search, specialization, consultationType, sort }],
    queryFn: () =>
      api.get<{ doctors: Doctor[]; pagination: any }>('/doctors', {
        search,
        specialization,
        consultationType,
        sort,
      }),
  });

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-md">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Certified Specialist Physicians
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Consult With Board-Certified Doctors
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Schedule convenient private telehealth video visits or in-person consultations across all primary healthcare specialties.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="doctors-search-input"
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value || null)}
            placeholder="Search by physician name or hospital..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Specialty Dropdown */}
          <select
            id="doctors-specialty-select"
            value={specialization}
            onChange={(e) => updateParam('specialization', e.target.value || null)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Specialties</option>
            {specialties?.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Consultation Type */}
          <select
            id="doctors-consult-type-select"
            value={consultationType}
            onChange={(e) => updateParam('consultationType', e.target.value || null)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Visit Types</option>
            <option value="VIDEO">Video Telehealth</option>
            <option value="IN_PERSON">In-Person Clinic</option>
          </select>

          {/* Sort */}
          <select
            id="doctors-sort-select"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="rating">Top Rated</option>
            <option value="fee_asc">Fee: Low to High</option>
            <option value="fee_desc">Fee: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <LoadingState message="Finding certified physicians..." />
      ) : isError || !doctorsResponse?.doctors || doctorsResponse.doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No Doctors Found"
          description="No specialists matched your filter criteria. Try adjusting your specialty or search keywords."
          actionText="Reset Filters"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorsResponse.doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doc.avatar || 'https://images.unsplash.com/photo-1594824813511-19d452093e9a?auto=format&fit=crop&q=80&w=200'}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">{doc.name}</h3>
                    <p className="text-xs font-bold text-emerald-600 truncate">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.qualifications?.join(', ')}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-slate-700">{doc.rating}</span>
                      <span className="text-slate-400">({doc.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {doc.biography}
                </p>

                <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Award className="w-3.5 h-3.5" /> Experience
                    </span>
                    <span className="font-semibold text-slate-800">{doc.experienceYears}+ Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" /> Affiliation
                    </span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {doc.hospitalAffiliation || 'Medicare Medical Center'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Video className="w-3.5 h-3.5" /> Modes
                    </span>
                    <span className="font-semibold text-slate-800">
                      {doc.consultationTypes?.join(' & ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Consultation Fee</span>
                  <span className="text-xl font-black text-slate-900">
                    ${doc.consultationFee}
                  </span>
                </div>

                <Link
                  to={`/doctors/${doc._id}`}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Visit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
