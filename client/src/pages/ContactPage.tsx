import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Headphones,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

const CONTACT_TOPICS = [
  { value: 'GENERAL', label: 'General Inquiry' },
  { value: 'MEDICINE_ORDER', label: 'Medicine Order & Delivery' },
  { value: 'PRESCRIPTION', label: 'Prescription Review (Rx)' },
  { value: 'APPOINTMENT', label: 'Doctor Consultation / Booking' },
  { value: 'HEALTH_CHECKUP', label: 'Health Checkup & Lab Reports' },
  { value: 'TECHNICAL', label: 'Account / Technical Issue' },
] as const;

export const ContactPage: React.FC = () => {
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [topic, setTopic] = useState<string>('GENERAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    email: string;
  } | null>(null);

  // Pre-fill authenticated user details once store hydrates
  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.fullName || '');
      setEmail((prev) => prev || user.email || '');
      setPhone((prev) => prev || user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim().includes('@')) {
      setError('Please provide a valid email address so we can reply.');
      return;
    }
    if (subject.trim().length < 3) {
      setError('Please provide a short subject for your inquiry.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Please enter a message describing your question (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ ticketId: string; email: string }>('/contact', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        topic,
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubmittedTicket({
        ticketId: res.ticketId,
        email: res.email || email.trim(),
      });
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Unable to send your message right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0f2d42] via-[#0b4b55] to-[#0d766e] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-4 h-4" /> 24/7 Patient & Clinical Support
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Get in Touch With Medicare
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Need help with a prescription review, medicine delivery, specialist appointment, or
              diagnostic report? Reach out to our care coordination team below.
            </p>
          </div>
        </div>
      </section>

      {/* Main Responsive Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Support Channels */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-slate-900">Support Channels</h2>

              <div className="space-y-4 text-xs">
                <a
                  href="tel:+18005552273"
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">24/7 Patient Helpline</div>
                    <div className="text-emerald-700 font-extrabold mt-0.5">+1 (800) 555-CARE</div>
                    <p className="text-slate-500 mt-0.5">Instant pharmacist & dispatch support</p>
                  </div>
                </a>

                <a
                  href="mailto:support@medicare.health"
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Email Care Team</div>
                    <div className="text-teal-700 font-bold mt-0.5">support@medicare.health</div>
                    <p className="text-slate-500 mt-0.5">Typical response under 2 hours</p>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Central Clinical & Pharmacy Hub</div>
                    <p className="text-slate-600 mt-0.5">
                      450 Healthcare Plaza, Suite 300, Medical District
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Pharmacy & Lab Operating Hours</div>
                    <p className="text-slate-600 mt-0.5">
                      Mon – Sun: Open 24 Hours (Emergency & Express Dispatch)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Emergency Notice */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">Medical Emergency Warning</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">
                  If you are experiencing chest pain, severe breathing difficulty, or an urgent
                  medical crisis, call local emergency services immediately instead of submitting a
                  support form.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Support Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              {submittedTicket ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Message Received!</h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your inquiry has been logged under ticket{' '}
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      #{submittedTicket.ticketId}
                    </span>
                    . A confirmation has been dispatched to{' '}
                    <strong className="text-slate-800">{submittedTicket.email}</strong>.
                  </p>
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmittedTicket(null)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Send Another Inquiry
                    </button>
                    <Link
                      to="/"
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      Return Home <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Send Us a Message</h2>
                      <p className="text-xs text-slate-500">
                        Fill out the form and our team will get back to you promptly.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-topic" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Support Category
                      </label>
                      <select
                        id="contact-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {CONTACT_TOPICS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Subject *
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your request"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe how our team can help you..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Support Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Support</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

