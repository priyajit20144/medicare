import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, PhoneCall, Award, Lock, FileText } from 'lucide-react';
import { HealthcareDisclaimer } from './HealthcareDisclaimer';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Medical emergency warning banner */}
        <div className="mb-12">
          <HealthcareDisclaimer type="emergency" className="bg-red-950/40 border-red-900 text-red-200" />
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                MEDI<span className="text-emerald-400">CARE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Medicare is a modern full-stack healthcare ecosystem uniting certified digital pharmacy fulfillment, licensed pharmacist reviews, specialist consultations, and preventive health screenings.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Licensed Pharmacists
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Lock className="w-4 h-4 text-emerald-400" />
                Protected Health Records
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Award className="w-4 h-4 text-emerald-400" />
                Certified Labs
              </span>
            </div>
          </div>

          {/* Healthcare Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Healthcare Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/medicines" className="hover:text-emerald-400 transition">Online Pharmacy</Link>
              </li>
              <li>
                <Link to="/prescriptions/upload" className="hover:text-emerald-400 transition">Prescription Review</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-emerald-400 transition">Doctor Consultations</Link>
              </li>
              <li>
                <Link to="/health-checkups" className="hover:text-emerald-400 transition">Preventive Checkups</Link>
              </li>
              <li>
                <Link to="/facilities" className="hover:text-emerald-400 transition">Diagnostic Centers</Link>
              </li>
              <li>
                <Link to="/premium" className="hover:text-amber-400 transition text-amber-300 font-semibold">1-Year VIP Membership</Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Patient Access
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/user/dashboard" className="hover:text-emerald-400 transition">Patient Dashboard</Link>
              </li>
              <li>
                <Link to="/user/orders" className="hover:text-emerald-400 transition">Order Tracking</Link>
              </li>
              <li>
                <Link to="/user/prescriptions" className="hover:text-emerald-400 transition">My Prescriptions</Link>
              </li>
              <li>
                <Link to="/user/appointments" className="hover:text-emerald-400 transition">My Appointments</Link>
              </li>
              <li>
                <Link to="/user/health-checkups" className="hover:text-emerald-400 transition">Lab Reports</Link>
              </li>
            </ul>
          </div>

          {/* Staff Portals & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Care Providers
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/pharmacist" className="hover:text-emerald-400 transition">Pharmacist Portal</Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-emerald-400 transition">Doctor Portal</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition">Admin Portal</Link>
              </li>
              <li className="pt-2 text-slate-500">
                <span>Helpline: </span>
                <span className="text-emerald-400 font-semibold">+1 (800) 555-CARE</span>
              </li>
              <li className="text-slate-500">
                <span>Support: </span>
                <span className="text-slate-300">support@medicare.health</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 text-xs text-slate-500 space-y-4">
          <p className="leading-relaxed text-[11px] text-slate-400">
            <strong>Regulatory Disclaimer:</strong> Prescription medications can only be dispensed following verification of a valid prescription issued by a licensed healthcare provider. Medicare complies with national digital pharmacy standards and patient privacy protocols. Medications must be stored according to manufacturer guidelines.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-[11px]">
            <p>© 2026 Medicare Platform Inc. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2 text-slate-400">
              <span className="hover:text-emerald-400 transition cursor-pointer">Privacy Policy</span>
              <span className="hover:text-emerald-400 transition cursor-pointer">Terms of Clinical Service</span>
              <span className="hover:text-emerald-400 transition cursor-pointer">HIPAA Standard</span>
              <span className="hover:text-emerald-400 transition cursor-pointer">Security Center</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
