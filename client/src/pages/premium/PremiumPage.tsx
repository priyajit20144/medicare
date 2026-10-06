import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Clock,
  HeartPulse,
  Truck,
  Video,
  FileCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { api } from '../../api/client';
import { MembershipPlan, UserMembership } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { LoadingState } from '../../components/common/LoadingState';

export const PremiumPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Fetch plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['membershipPlans'],
    queryFn: () => api.get<MembershipPlan[]>('/membership/plans'),
  });

  // Fetch user current membership if authenticated
  const { data: currentMemData } = useQuery({
    queryKey: ['myCurrentMembership'],
    queryFn: () =>
      api.get<{ hasActiveMembership: boolean; membership: UserMembership; daysRemaining: number }>(
        '/membership/me'
      ),
    enabled: isAuthenticated,
  });

  if (plansLoading) {
    return <LoadingState message="Loading Medicare VIP privileges..." minHeight="min-h-[60vh]" />;
  }

  const primaryPlan = plans?.[0];

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/premium');
      return;
    }

    if (!primaryPlan) return;

    setError('');
    setSubscribing(true);
    try {
      await api.post('/membership/subscribe', {
        planId: primaryPlan._id,
        autoRenew: true,
      });

      navigate('/user/membership?subscribed=true');
    } catch (err: any) {
      setError(err.message || 'Subscription could not be processed.');
    } finally {
      setSubscribing(false);
    }
  };

  const comparison = [
    { feature: 'Annual Comprehensive Executive Checkup ($229 value)', free: false, vip: true },
    { feature: 'Unlimited Free Express Delivery (No minimum)', free: false, vip: true },
    { feature: 'Complimentary Specialist Video Consultations', free: '0 visits', vip: '2 included' },
    { feature: 'Storewide Medication & Lab Test Discount', free: 'Standard', vip: '10% Extra Discount' },
    { feature: 'Specialist Doctor Booking Queue', free: 'Standard Queue', vip: 'Zero-Wait VIP Queue' },
    { feature: 'Dedicated 24/7 Priority Healthcare Concierge', free: false, vip: true },
    { feature: 'Digital Prescription Cloud Storage & History', free: true, vip: true },
  ];

  const pillarBenefits = [
    {
      icon: HeartPulse,
      title: 'Free Annual Checkup',
      tag: '$229 Value Included',
      desc: 'Complete metabolic profile, cardiovascular risk, complete blood count, and physician review with zero out-of-pocket costs.',
      color: 'emerald',
    },
    {
      icon: Truck,
      title: 'Unlimited Free Express Delivery',
      tag: 'Zero Shipping Fees',
      desc: 'Free temperature-controlled priority dispatch on all maintenance medications and urgent pharmacy orders nationwide.',
      color: 'indigo',
    },
    {
      icon: Video,
      title: '2 Free Telemedicine Visits',
      tag: 'Certified Specialists',
      desc: 'Connect within minutes to licensed general physicians and clinical specialists via encrypted video consults from home.',
      color: 'teal',
    },
    {
      icon: Clock,
      title: 'Zero-Wait Doctor Queues',
      tag: 'Priority VIP Access',
      desc: 'Skip long outpatient queues with dedicated VIP scheduling and direct clinician confirmation at partner hospitals.',
      color: 'amber',
    },
  ];

  const faqs = [
    {
      question: 'How do I claim my Free Annual Comprehensive Health Checkup?',
      answer:
        'Immediately after your VIP membership is active, a voucher for the Annual Comprehensive Health Checkup ($229 value) is added to your account. You can book it at any of our partner diagnostic centers or schedule a home blood draw at your convenience.',
    },
    {
      question: 'Does the 10% instant discount apply to all medicines and lab tests?',
      answer:
        'Yes! Your 10% VIP discount applies automatically at checkout across all prescription drugs, over-the-counter medicines, and individual laboratory biomarker tests.',
    },
    {
      question: 'How do the complimentary telemedicine consultations work?',
      answer:
        'You receive two full-length video consultation credits with board-certified physicians each year. You can book same-day appointments directly from your Medicare dashboard.',
    },
    {
      question: 'Can I cancel my subscription or receive a refund?',
      answer:
        'Yes. We offer an unconditional 30-day money-back guarantee. If you have not utilized medical services and wish to cancel, contact our concierge for a full refund.',
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16 md:space-y-20">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-900 text-[11px] sm:text-xs font-black uppercase tracking-wider border border-amber-300/60 shadow-xs">
          <Crown className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Medicare Premium 1-Year Membership</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight px-2">
          Invest in Your Complete Healthcare Independence.
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto px-2">
          One simple annual subscription covers preventative diagnostic screenings, emergency prescription fulfillment, specialist telemedicine, and zero delivery fees.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Satisfaction Guarantee
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-600" /> Instant VIP Activation
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> $450+ Annual Savings
          </span>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Already Active Membership Status Card */}
      {currentMemData?.hasActiveMembership && (
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active VIP Subscription
            </span>
            <h3 className="text-base sm:text-lg font-bold">You are a Medicare VIP Member</h3>
            <p className="text-xs text-emerald-100">
              {currentMemData.daysRemaining} days remaining in your current 1-year coverage cycle.
            </p>
          </div>
          <Link
            to="/user/membership"
            className="w-full sm:w-auto text-center px-4 py-2.5 bg-white text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-50 transition shadow-xs flex-shrink-0"
          >
            View Dashboard Privileges
          </Link>
        </div>
      )}

      {/* Showcase Plan Card - Fully Responsive on all screen sizes */}
      {primaryPlan && (
        <div className="max-w-3xl mx-auto bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-amber-500/30">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6 sm:space-y-8">
            {/* Header: Title and Pricing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                  All-Inclusive Annual Tier
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  {primaryPlan.name}
                </h2>
              </div>

              <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/5 sm:border-none flex sm:block items-baseline justify-between sm:justify-end gap-2">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-amber-400">
                    ${primaryPlan.discountPrice || primaryPlan.price}
                  </span>
                  {primaryPlan.discountPrice && (
                    <span className="text-xs text-slate-400 line-through ml-2">
                      ${primaryPlan.price}
                    </span>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium block">
                  Billed annually (365 days)
                </span>
              </div>
            </div>

            {/* Benefits list: 1 col on mobile, 2 col on tablet/desktop */}
            <div className="space-y-3">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                Included VIP Membership Privileges:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                {primaryPlan.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200 leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Section */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-amber-300 bg-amber-400/10 px-3.5 py-2 rounded-xl border border-amber-400/20">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-semibold">Estimated annual patient savings: $450+</span>
              </div>

              {!currentMemData?.hasActiveMembership ? (
                <button
                  id="premium-subscribe-btn"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {subscribing ? 'Activating VIP Care...' : 'Subscribe to 1-Year VIP Care'}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/user/membership"
                  className="w-full sm:w-auto text-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Manage Membership
                </Link>
              )}
            </div>

            <div className="text-center sm:text-right text-[11px] text-slate-400 flex items-center justify-center sm:justify-end gap-1.5 pt-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>256-Bit Encrypted Checkout • 30-Day Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Pillar Benefits Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Comprehensive VIP Care Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything designed to save you time, stress, and out-of-pocket medical expenses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillarBenefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {b.tag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table - Fully Responsive with Swipeable Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Standard Care vs. Medicare VIP
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Transparent breakdown of included services and benefits.
          </p>
        </div>

        {/* Responsive Table Wrapper with Horizontal Scroll Support */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-xs">
          {/* Mobile Swipe Notice */}
          <div className="sm:hidden px-4 py-2 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Swipe sideways to compare all tiers
            </span>
            <span className="text-[10px] font-bold text-slate-400">3 Columns</span>
          </div>

          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <div className="min-w-[560px] sm:min-w-full">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1.2fr] p-3.5 sm:p-4 bg-slate-50/90 font-bold text-slate-700 border-b border-slate-200/80 items-center">
                <span className="text-slate-900">Healthcare Privilege</span>
                <span className="text-center text-slate-500">Standard Free Tier</span>
                <span className="text-center text-emerald-800 font-extrabold flex items-center justify-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  Medicare 1-Year VIP
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {comparison.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_1fr_1.2fr] p-3.5 sm:p-4 items-center hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 pr-2 leading-snug">
                      {c.feature}
                    </span>
                    <span className="text-center text-slate-500 font-medium">
                      {typeof c.free === 'boolean' ? (
                        c.free ? (
                          <span className="text-emerald-600 font-bold">✓ Included</span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )
                      ) : (
                        c.free
                      )}
                    </span>
                    <span className="text-center font-bold text-emerald-700 flex items-center justify-center gap-1">
                      {typeof c.vip === 'boolean' ? (
                        c.vip ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          '—'
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[11px]">
                          {c.vip}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Have questions about Medicare VIP? Find answers below.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition"
                >
                  <span>{faq.question}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white text-center space-y-4 shadow-xl border border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-md">
          <Crown className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-lg mx-auto">
          <h3 className="text-lg sm:text-2xl font-black tracking-tight">
            Ready to Experience Healthcare Without Compromise?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Join thousands of patients enjoying full preventative screening, zero wait queues, and priority clinical care.
          </p>
        </div>

        {!currentMemData?.hasActiveMembership && (
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95 inline-flex items-center gap-2"
          >
            {subscribing ? 'Activating VIP Care...' : 'Subscribe to 1-Year VIP Care'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
