import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pill,
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  CloudUpload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
  Link2,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { Medicine, Category } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';

const PHARMA_PRESETS = [
  { label: 'Cardio Bottle', url: '/images/medicines/cardiocare_bottle.jpg' },
  { label: 'Herbal Bottle', url: '/images/medicines/heartease_herbal.jpg' },
  { label: 'Capsule Box', url: '/images/medicines/florin_box.jpg' },
  { label: 'Tablets Trio', url: '/images/medicines/bloodflow_trio.jpg' },
  { label: 'BP Monitor', url: '/images/medicines/bp_monitor.jpg' },
  { label: 'Derma Lotion', url: '/images/medicines/body_lotion.jpg' },
];

export const AdminMedicinesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Image upload and input states
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: 'Pack of 30',
    requiresPrescription: false,
    manufacturer: 'Medicare Laboratories',
  });

  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['adminMedicines', search],
    queryFn: () => api.get<{ medicines: Medicine[] }>('/medicines', { search, limit: 50 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      brand: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      dosageForm: 'Tablet',
      strength: '500mg',
      packSize: 'Pack of 30',
      requiresPrescription: false,
      manufacturer: 'Medicare Laboratories',
    });
    setEditingMedicine(null);
    setImageFile(null);
    setImagePreview('');
    setImageUrlInput('');
    setUploadError(null);
    setIsDragging(false);
    setIsUploading(false);
    setImageInputMode('upload');
  };

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post('/medicines', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMedicines'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.patch(`/medicines/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMedicines'] });
      setModalOpen(false);
      resetForm();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/medicines/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminMedicines'] }),
  });

  const handleOpenAddModal = () => {
    resetForm();
    if (categories && categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: categories[0]._id }));
    }
    setModalOpen(true);
  };

  const handleOpenEditModal = (m: Medicine) => {
    resetForm();
    setEditingMedicine(m);
    const existingImg = m.images?.[0] || '';
    setImagePreview(existingImg);
    setImageUrlInput(existingImg);
    if (existingImg) {
      // If it starts with /uploads, it was uploaded locally, else could be preset/external
      setImageInputMode(existingImg.startsWith('http') ? 'url' : 'upload');
    }

    setFormData({
      name: m.name,
      genericName: m.genericName,
      brand: m.brand,
      description: m.description,
      category: typeof m.category === 'object' ? m.category._id : m.category,
      price: String(m.price),
      stock: String(m.stock),
      dosageForm: m.dosageForm || 'Tablet',
      strength: m.strength || '500mg',
      packSize: m.packSize || 'Pack of 30',
      requiresPrescription: m.requiresPrescription || false,
      manufacturer: m.manufacturer || 'Medicare Laboratories',
    });
    setModalOpen(true);
  };

  const handleFileProcess = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setUploadError(null);
    setImageFile(file);

    // Create temporary blob preview immediately for snappy UX
    const localBlobUrl = URL.createObjectURL(file);
    setImagePreview(localBlobUrl);

    // Upload to server endpoint
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await api.upload<{ url: string; filename: string }>('/medicines/upload-image', uploadData);
      if (res?.url) {
        setImagePreview(res.url);
        setImageUrlInput(res.url);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image to server');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrlInput('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlInputChange = (url: string) => {
    setImageUrlInput(url);
    setImagePreview(url);
    setImageFile(null);
    setUploadError(null);
  };

  const handleSelectPreset = (url: string) => {
    setImageUrlInput(url);
    setImagePreview(url);
    setImageFile(null);
    setUploadError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine final image
    const finalImage = imageUrlInput || (imagePreview && !imagePreview.startsWith('blob:') ? imagePreview : '');

    const payload = {
      ...formData,
      category: formData.category || categories?.[0]?._id,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: finalImage ? [finalImage] : [],
    };

    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine._id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const medicines = medicinesData?.medicines || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Medicine Inventory Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new pharmaceutical products, upload medicine images, manage stock levels, and set prescription rules.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Loading catalog..." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-xs text-slate-300 min-w-[720px]">
              <thead className="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Product & Generic</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Prescription</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {medicines.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                          {m.images?.[0] ? (
                            <img
                              src={m.images[0]}
                              alt={m.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback icon on error
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Pill className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{m.name}</span>
                          <span className="text-[10px] text-slate-500 italic">
                            {m.genericName} • {m.strength}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{m.brand}</td>
                    <td className="p-4 font-black text-white">${m.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          m.stock < 10 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {m.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {m.requiresPrescription ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          Rx Required
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">OTC</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-900 transition"
                          title="Edit Product & Image"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deactivateMutation.mutate(m._id)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingMedicine ? 'Edit Medicine Product' : 'Register New Medicine Product'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editingMedicine
                    ? 'Update pharmaceutical specifications, pricing, stock, and product image.'
                    : 'Add a new pharmaceutical product with description, pricing, and product photo.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Commercial Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Lipitor, Panadol..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Generic Name</label>
                  <input
                    type="text"
                    required
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Atorvastatin, Paracetamol..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Pfizer, GSK..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Dosage Form</label>
                  <input
                    type="text"
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    placeholder="Tablet, Capsule, Syrup, Cream..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Strength / Packaging</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g. 500mg, 10mg/ml"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clinical usage instructions, indications, therapeutic properties..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* NEW SECTION: Medicine Image Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Medicine Product Image
                    <span className="text-[10px] font-normal text-slate-500">(Upload file or provide URL)</span>
                  </label>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputMode('upload');
                        setUploadError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                        imageInputMode === 'upload'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CloudUpload className="w-3 h-3" /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputMode('url');
                        setUploadError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                        imageInputMode === 'url'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3 h-3" /> Image URL
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {imageInputMode === 'upload' ? (
                  <div>
                    {!imagePreview ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                          isDragging
                            ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]'
                            : 'border-slate-800 bg-slate-950/80 hover:border-emerald-500/60 hover:bg-slate-950'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                          ) : (
                            <CloudUpload className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            <span className="text-emerald-400 hover:underline">Click to upload medicine photo</span> or drag & drop
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            High resolution JPG, PNG, or WebP (up to 10MB)
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Image preview card with replacement & deletion controls */
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative p-1">
                            <img
                              src={imagePreview}
                              alt="Medicine preview"
                              className="w-full h-full object-contain"
                              onError={() => setUploadError('Image failed to preview. Please verify file.')}
                            />
                            {isUploading && (
                              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                                {imageFile?.name || 'Selected Medicine Image'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {isUploading ? 'Uploading...' : 'Ready'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {imageFile
                                ? `${(imageFile.size / 1024).toFixed(0)} KB • ${imageFile.type}`
                                : imagePreview}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Mode */
                  <div className="space-y-2">
                    <div className="relative">
                      <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => handleUrlInputChange(e.target.value)}
                        placeholder="https://images.unsplash.com/... or /images/medicines/..."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {imagePreview && (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                            <img
                              src={imagePreview}
                              alt="Medicine URL preview"
                              className="w-full h-full object-contain"
                              onError={() => setUploadError('Image URL could not be loaded.')}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{imagePreview}</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Validated Image URL
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          title="Clear image URL"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Quick Pharma Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                      <span className="text-slate-500 flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
                      </span>
                      {PHARMA_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Prescription requirement */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="req-rx-check"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="req-rx-check" className="font-bold text-slate-300 cursor-pointer">
                  Requires Valid Doctor Prescription (Rx)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 transition rounded-xl text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingMedicine ? (
                    'Update Product'
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
