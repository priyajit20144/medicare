import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, ShieldCheck, ArrowRight, CheckCircle2, HeartPulse } from 'lucide-react';
import { api } from '../../api/client';
import { HealthCheckupPackage } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';

export const HealthCheckupsPage: React.FC = () => {
  const { data: packages, isLoading } = useQuery({
    queryKey: ['checkupPackages'],
    queryFn: () => api.get<HealthCheckupPackage[]>('/health-checkups/packages'),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-md">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Preventative Pathology & Diagnostics
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Comprehensive Preventative Health Checkups
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Early detection saves lives. Choose certified full-body screening panels analyzed in high-precision automated clinical laboratories with protected diagnostic report access.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading diagnostic checkup packages..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages?.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-cyan-300 transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {pkg.testCount} Laboratory Tests
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-0.5">Recommended For:</span>
                  <span>{pkg.recommendedFor}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Package Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ${pkg.discountPrice || pkg.price}
                    </span>
                    {pkg.discountPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${pkg.price}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/health-checkups/${pkg.slug || pkg._id}`}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  View Tests <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
