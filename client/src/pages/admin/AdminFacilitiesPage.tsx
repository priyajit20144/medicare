import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  Edit,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { Facility } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminFacilitiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('DIAGNOSTIC_CENTER');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon - Sat: 07:00 AM - 09:00 PM');
  const [services, setServices] = useState('Diagnostic Imaging, Blood Draw, Pathology, Cardiac Screening');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => api.get<Facility[]>('/facilities'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingFacility) {
        return api.patch(`/facilities/admin/${editingFacility._id}`, payload);
      }
      return api.post('/facilities/admin', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to save facility details');
    },
  });

  const handleOpenAdd = () => {
    setEditingFacility(null);
    setName('');
    setType('DIAGNOSTIC_CENTER');
    setDescription('');
    setAddress('');
    setCity('');
    setState('');
    setPostalCode('');
    setPhone('');
    setEmail('');
    setOpeningHours('Mon - Sat: 07:00 AM - 09:00 PM');
    setServices('Diagnostic Imaging, Blood Draw, Pathology, Cardiac Screening');
    setImage('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac: Facility) => {
    setEditingFacility(fac);
    setName(fac.name);
    setType(fac.type);
    setDescription(fac.description);
    setAddress(fac.address);
    setCity(fac.city);
    setState(fac.state);
    setPostalCode(fac.postalCode);
    setPhone(fac.phone);
    setEmail(fac.email);
    setOpeningHours(fac.openingHours);
    setServices(fac.services?.join(', ') || '');
    setImage(fac.image || '');
    setIsActive(fac.isActive !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceArray = services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    saveMutation.mutate({
      name,
      type,
      description,
      address,
      city,
      state,
      postalCode,
      phone,
      email,
      openingHours,
      services: serviceArray,
      image,
      isActive,
    });
  };

  const facilityList = facilities || [];
  const filtered = facilityList.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.city.toLowerCase().includes(term) ||
      f.type.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return <LoadingState message="Loading medical facility registry..." minHeight="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Healthcare Facilities & Centers</h1>
          <p className="text-sm text-slate-400">
            Configure partner diagnostic hubs, collection centers, consultation clinics, and test capacity.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" /> Add Facility
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search facility by name, city or diagnostic type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Facilities Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No healthcare facilities found"
          description="Click 'Add Facility' to register new diagnostic hubs or clinics."
          icon={Building2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((fac) => (
            <div
              key={fac._id}
              className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="h-40 relative bg-slate-900 overflow-hidden">
                  <img
                    src={fac.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'}
                    alt={fac.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-800/40">
                    {fac.type.replace(/_/g, ' ')}
                  </div>
                  <div className="absolute top-3 right-3">
                    {fac.isActive !== false ? (
                      <span className="bg-emerald-950/80 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-800/40">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-950/80 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-800/40">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white">{fac.name}</h3>
                  <div className="text-xs text-slate-400 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>
                      {fac.address}, {fac.city}, {fac.state}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{fac.phone}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{fac.openingHours}</span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {fac.services?.slice(0, 3).map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        {srv}
                      </span>
                    ))}
                    {(fac.services?.length || 0) > 3 && (
                      <span className="text-[10px] text-slate-500 py-0.5">
                        +{fac.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleOpenEdit(fac)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Center Configuration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                {editingFacility ? 'Edit Medical Facility' : 'Register New Medical Facility'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Medicare Central Diagnostic Lab"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Facility Classification *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
                    <option value="PARTNER_CLINIC">Partner Clinic</option>
                    <option value="HEALTH_CHECKUP_CENTER">Health Checkup Center</option>
                    <option value="PHARMACY">Pharmacy Hub</option>
                    <option value="COLLECTION_CENTER">Sample Collection Center</option>
                    <option value="DOCTOR_CONSULTATION_CENTER">Consultation Center</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Facility overview, clinical accreditation, and patient amenities..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Services Provided (comma-separated)
                </label>
                <input
                  type="text"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Exterior / Facility Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-300 cursor-pointer">
                  Facility is Open & Accepting Bookings
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : editingFacility ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
