import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Search,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../api/client';
import { Facility } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';

export const FacilitiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || '';

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities', { search, type }],
    queryFn: () => api.get<Facility[]>('/facilities', { search, type }),
  });

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const facilityTypes = [
    { label: 'All Centers', value: '' },
    { label: 'Diagnostic Hubs', value: 'DIAGNOSTIC_CENTER' },
    { label: 'Partner Clinics', value: 'PARTNER_CLINIC' },
    { label: 'Health Checkup Centers', value: 'HEALTH_CHECKUP_CENTER' },
    { label: 'Pharmacies', value: 'PHARMACY' },
    { label: 'Collection Centers', value: 'COLLECTION_CENTER' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-md">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Certified Clinical Facilities Network
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Our Healthcare Facilities & Centers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Locate accredited diagnostic laboratories, express phlebotomy hubs, partner specialty clinics, and community pharmacies.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="facilities-search-input"
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value || null)}
            placeholder="Search facility by name or address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {facilityTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => updateParam('type', t.value || null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                type === t.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Locating certified facilities..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities?.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-slate-100 text-slate-700">
                    {f.type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{f.rating}</span>
                    <span className="text-slate-400 font-normal">({f.reviewCount})</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{f.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.description}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 py-3 border-y border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{f.address}, {f.city}, {f.state} {f.postalCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{f.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{f.openingHours}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {f.services?.slice(0, 3).map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold"
                    >
                      {srv}
                    </span>
                  ))}
                  {f.services && f.services.length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                      +{f.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Certified Partner
                </span>

                <Link
                  to={`/facilities/${f.slug || f._id}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                >
                  View Center <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
