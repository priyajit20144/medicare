import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Activity,
} from 'lucide-react';
import { api } from '../../api/client';
import { Facility } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';

export const FacilityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: facility, isLoading } = useQuery({
    queryKey: ['facility', id],
    queryFn: () => api.get<Facility>(`/facilities/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState message="Loading healthcare facility details..." minHeight="min-h-[60vh]" />;
  }

  if (!facility) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Facility Not Found</h2>
        <Link
          to="/facilities"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Facilities Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/facilities" className="hover:text-emerald-600">Facilities</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{facility.name}</span>
      </nav>

      {/* Main Showcase */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold inline-block">
            {facility.type.replace(/_/g, ' ')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {facility.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {facility.description}
          </p>

          <div className="space-y-2 pt-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{facility.address}, {facility.city}, {facility.state} {facility.postalCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{facility.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{facility.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{facility.openingHours}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 shadow-inner">
          <img
            src={facility.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600'}
            alt={facility.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Services and Clinical Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Available Services & Testing Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facility.services?.map((srv, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{srv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map / Directions Placeholder */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Facility Location & Access</h2>
          <div className="aspect-video rounded-2xl bg-emerald-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-2">
            <MapPin className="w-8 h-8 text-emerald-400" />
            <h4 className="text-sm font-bold">{facility.name}</h4>
            <p className="text-xs text-slate-400 max-w-xs">{facility.address}, {facility.city}</p>
            <span className="text-[11px] text-emerald-300 font-semibold pt-1">
              Parking & Wheelchair Accessible Entrance Available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
