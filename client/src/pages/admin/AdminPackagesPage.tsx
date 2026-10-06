import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Activity,
  Search,
  CheckCircle2,
  DollarSign,
  Clock,
  FlaskConical,
  Eye,
  X,
  Tag,
  Plus,
  Trash2,
  CloudUpload,
  Image as ImageIcon,
  Link2,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  FileText,
  Filter,
} from 'lucide-react';
import { api } from '../../api/client';
import { HealthCheckupPackage, LabTest } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';

const CLINICAL_IMAGE_PRESETS = [
  { label: 'Operating Theatre', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80' },
  { label: 'Executive Ward', url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cardio Stethoscope', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80' },
  { label: 'Blood Pathology', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80' },
  { label: 'Senior Care', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80' },
];

const TEST_CATEGORIES = [
  'General Pathology',
  'Hematology',
  'Biochemistry',
  'Lipid Metabolism',
  'Cardiovascular Risk',
  'Thyroid Panel',
  'Renal Function',
  'Hepatic / Liver Profile',
  'Urine Pathology',
  'Diagnostic Imaging',
  'Immunology & Serology',
];

const SAMPLE_TYPES = [
  'Venous Blood',
  'Fasting Blood',
  'Spot Urine',
  '24-Hour Urine',
  'Saliva',
  'Nasal / Throat Swab',
  'Diagnostic Imaging / Scan',
  'Stool',
];

export const AdminPackagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'packages' | 'tests'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<HealthCheckupPackage | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'package' | 'test'>('package');
  const [modalError, setModalError] = useState<string | null>(null);

  // Package Form state
  const [pkgName, setPkgName] = useState('');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDiscountPrice, setPkgDiscountPrice] = useState('');
  const [pkgDuration, setPkgDuration] = useState('2 Hours');
  const [pkgRecommendedFor, setPkgRecommendedFor] = useState('');
  const [pkgSelectedTests, setPkgSelectedTests] = useState<string[]>([]);
  const [testSearchFilter, setTestSearchFilter] = useState('');
  const [testCategoryFilter, setTestCategoryFilter] = useState('ALL');

  // Package Image states
  const [pkgImageMode, setPkgImageMode] = useState<'upload' | 'url'>('upload');
  const [pkgImageFile, setPkgImageFile] = useState<File | null>(null);
  const [pkgImagePreview, setPkgImagePreview] = useState<string>('');
  const [pkgImageUrlInput, setPkgImageUrlInput] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isDraggingImage, setIsDraggingImage] = useState<boolean>(false);

  // Lab Test Form state
  const [testName, setTestName] = useState('');
  const [testCode, setTestCode] = useState('');
  const [testCategory, setTestCategory] = useState(TEST_CATEGORIES[0]);
  const [testSampleType, setTestSampleType] = useState(SAMPLE_TYPES[0]);
  const [testPrice, setTestPrice] = useState('');
  const [testFastingRequired, setTestFastingRequired] = useState(true);
  const [testInstructions, setTestInstructions] = useState('10-12 hours fasting required before test. Drink plain water freely.');
  const [testDescription, setTestDescription] = useState('');

  // Queries
  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['checkupPackages'],
    queryFn: () => api.get<HealthCheckupPackage[]>('/health-checkups/packages'),
  });

  const { data: tests, isLoading: loadingTests } = useQuery({
    queryKey: ['checkupTests'],
    queryFn: () => api.get<LabTest[]>('/health-checkups/tests'),
  });

  const packageList = packages || [];
  const testList = tests || [];

  // Mutations
  const createPackageMutation = useMutation({
    mutationFn: (body: any) => api.post('/health-checkups/packages', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkupPackages'] });
      setModalOpen(false);
      resetPackageForm();
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to create checkup package');
    },
  });

  const createTestMutation = useMutation({
    mutationFn: (body: any) => api.post('/health-checkups/tests', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkupTests'] });
      setModalOpen(false);
      resetTestForm();
    },
    onError: (err: any) => {
      setModalError(err.message || 'Failed to register laboratory test');
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/health-checkups/packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkupPackages'] });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/health-checkups/tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkupTests'] });
    },
  });

  // Reset forms
  const resetPackageForm = () => {
    setPkgName('');
    setPkgDescription('');
    setPkgPrice('');
    setPkgDiscountPrice('');
    setPkgDuration('2 Hours');
    setPkgRecommendedFor('');
    setPkgSelectedTests([]);
    setTestSearchFilter('');
    setTestCategoryFilter('ALL');
    setPkgImageFile(null);
    setPkgImagePreview('');
    setPkgImageUrlInput('');
    setIsUploadingImage(false);
    setIsDraggingImage(false);
    setPkgImageMode('upload');
    setModalError(null);
  };

  const resetTestForm = () => {
    setTestName('');
    setTestCode('');
    setTestCategory(TEST_CATEGORIES[0]);
    setTestSampleType(SAMPLE_TYPES[0]);
    setTestPrice('');
    setTestFastingRequired(true);
    setTestInstructions('10-12 hours fasting required before test. Drink plain water freely.');
    setTestDescription('');
    setModalError(null);
  };

  const openAddModal = (mode: 'package' | 'test') => {
    setModalMode(mode);
    setModalError(null);
    if (mode === 'package') {
      resetPackageForm();
    } else {
      resetTestForm();
      // Auto-generate code placeholder
      setTestCode(`LAB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
    setModalOpen(true);
  };

  // Image Upload handler for checkup package
  const handlePackageFileProcess = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setModalError('Invalid image format. Please upload JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setModalError('Image exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setModalError(null);
    setPkgImageFile(file);
    const localBlob = URL.createObjectURL(file);
    setPkgImagePreview(localBlob);

    setIsUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await api.upload<{ url: string }>('/health-checkups/packages/upload-image', uploadData);
      if (res?.url) {
        setPkgImagePreview(res.url);
        setPkgImageUrlInput(res.url);
      }
    } catch (err: any) {
      setModalError(err.message || 'Image upload failed. You may also specify an Image URL directly.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Biomarker test selection toggling
  const toggleTestSelection = (testId: string) => {
    setPkgSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const selectAllTests = () => {
    const allIds = testList.map((t) => t._id);
    setPkgSelectedTests(allIds);
  };

  const clearAllTests = () => {
    setPkgSelectedTests([]);
  };

  // Submit Package
  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) {
      setModalError('Package title is required.');
      return;
    }
    if (!pkgPrice || isNaN(Number(pkgPrice))) {
      setModalError('Valid package price is required.');
      return;
    }

    const finalImage = pkgImageUrlInput || (pkgImagePreview && !pkgImagePreview.startsWith('blob:') ? pkgImagePreview : '');

    createPackageMutation.mutate({
      name: pkgName.trim(),
      description: pkgDescription.trim(),
      price: Number(pkgPrice),
      discountPrice: pkgDiscountPrice ? Number(pkgDiscountPrice) : undefined,
      duration: pkgDuration.trim() || '2 Hours',
      recommendedFor: pkgRecommendedFor.trim() || 'All Adults',
      includedTests: pkgSelectedTests,
      image: finalImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    });
  };

  // Submit Test
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      setModalError('Biomarker test name is required.');
      return;
    }
    if (!testPrice || isNaN(Number(testPrice))) {
      setModalError('Valid fee is required.');
      return;
    }

    createTestMutation.mutate({
      name: testName.trim(),
      code: testCode.trim().toUpperCase() || `LAB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      category: testCategory,
      sampleType: testSampleType,
      price: Number(testPrice),
      preparationInstructions: testFastingRequired
        ? testInstructions
        : 'No fasting or dietary restriction required.',
      description: testDescription.trim(),
    });
  };

  // Filters
  const filteredPackages = packageList.filter((pkg) => {
    const term = searchTerm.toLowerCase();
    return (
      pkg.name.toLowerCase().includes(term) ||
      pkg.description.toLowerCase().includes(term) ||
      pkg.recommendedFor?.toLowerCase().includes(term)
    );
  });

  const filteredTests = testList.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.code?.toLowerCase().includes(term) ||
      t.category?.toLowerCase().includes(term)
    );
  });

  // Biomarkers list inside package modal
  const modalAvailableTests = testList.filter((t) => {
    const matchesCategory = testCategoryFilter === 'ALL' || t.category === testCategoryFilter;
    const matchesSearch = !testSearchFilter.trim() || t.name.toLowerCase().includes(testSearchFilter.toLowerCase()) || t.code?.toLowerCase().includes(testSearchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loadingPackages || loadingTests) {
    return <LoadingState message="Loading health package catalogue..." minHeight="min-h-[50vh]" />;
  }

  const isSubmitting = createPackageMutation.isPending || createTestMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Preventive Healthcare & Checkup Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage comprehensive screening bundles, individual biomarker panels, and diagnostic criteria.
          </p>
        </div>

        {/* Action Buttons: Responsive on all viewports */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openAddModal('package')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 group active:scale-95"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Checkup Package</span>
          </button>

          <button
            onClick={() => openAddModal('test')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 hover:shadow-indigo-900/30 transition-all flex items-center justify-center gap-1.5 group active:scale-95"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Lab Test</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> Checkup Packages ({packageList.length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tests'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> Laboratory Tests ({testList.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={activeTab === 'packages' ? 'Search packages...' : 'Search clinical tests...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Packages Tab Content */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-sm group"
            >
              <div>
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img
                    src={pkg.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-800/40">
                    {pkg.testCount} Tests Included
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Duration: {pkg.duration || '60 mins'}</span>
                  </div>

                  {pkg.recommendedFor && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">Recommended: {pkg.recommendedFor}</span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-black text-emerald-400">
                      ${pkg.discountPrice || pkg.price}
                    </span>
                    {pkg.discountPrice && (
                      <span className="text-xs text-slate-500 line-through">${pkg.price}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> View Included Biomarkers
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deactivate package "${pkg.name}"?`)) {
                      deletePackageMutation.mutate(pkg._id);
                    }
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition"
                  title="Deactivate package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Laboratory Tests Tab Content */}
      {activeTab === 'tests' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-4 px-5">Test Code</th>
                  <th className="py-4 px-5">Biomarker / Panel Name</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Sample Type</th>
                  <th className="py-4 px-5">Fasting Required</th>
                  <th className="py-4 px-5">Standard Fee</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTests.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-slate-400">
                      {t.code || 'LAB-TEST'}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full">
                        {t.category || 'General Pathology'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-300">
                      {t.sampleType || 'Venous Blood'}
                    </td>
                    <td className="py-4 px-5">
                      {t.preparationInstructions?.toLowerCase().includes('fasting') ? (
                        <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                          Fasting Required
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Not Required</span>
                      )}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                      ${t.price?.toFixed(2) || '25.00'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate lab test "${t.name}"?`)) {
                            deleteTestMutation.mutate(t._id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition"
                        title="Deactivate test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD NEW PACKAGE / LAB TEST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-4 shadow-2xl overflow-y-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {modalMode === 'package' ? (
                    <>
                      <Package className="w-5 h-5 text-emerald-400" />
                      Register New Checkup Package
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-5 h-5 text-indigo-400" />
                      Register New Laboratory Test
                    </>
                  )}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  {modalMode === 'package'
                    ? 'Bundle diagnostic biomarkers, pricing, and examination schedule into a checkup package.'
                    : 'Add a clinical assay, blood marker, or diagnostic laboratory testing procedure.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setModalMode('package');
                  setModalError(null);
                }}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  modalMode === 'package'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Checkup Package Bundle
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalMode('test');
                  setModalError(null);
                  if (!testCode) {
                    setTestCode(`LAB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
                  }
                }}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  modalMode === 'test'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" /> Laboratory Biomarker Test
              </button>
            </div>

            {/* Error Notification */}
            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            {/* MODE A: CHECKUP PACKAGE FORM */}
            {modalMode === 'package' && (
              <form onSubmit={handlePackageSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Package Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pkgName}
                      onChange={(e) => setPkgName(e.target.value)}
                      placeholder="e.g. Comprehensive Cardiac & Metabolic Panel"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Recommended Audience</label>
                    <input
                      type="text"
                      value={pkgRecommendedFor}
                      onChange={(e) => setPkgRecommendedFor(e.target.value)}
                      placeholder="e.g. Adults 35+, Executive Screening"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Estimated Duration</label>
                    <input
                      type="text"
                      value={pkgDuration}
                      onChange={(e) => setPkgDuration(e.target.value)}
                      placeholder="e.g. 2 - 3 Hours"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Price ($ USD) <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={pkgPrice}
                        onChange={(e) => setPkgPrice(e.target.value)}
                        placeholder="199.00"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Discount Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={pkgDiscountPrice}
                        onChange={(e) => setPkgDiscountPrice(e.target.value)}
                        placeholder="149.00"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Package Description</label>
                  <textarea
                    rows={2}
                    value={pkgDescription}
                    onChange={(e) => setPkgDescription(e.target.value)}
                    placeholder="Clinical overview, diagnostic rationale, and preventative health scope..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Package Banner Image Section */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      Package Cover Image
                    </label>
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPkgImageMode('upload')}
                        className={`px-2.5 py-1 rounded-md transition font-medium ${
                          pkgImageMode === 'upload'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setPkgImageMode('url')}
                        className={`px-2.5 py-1 rounded-md transition font-medium ${
                          pkgImageMode === 'url'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {pkgImageMode === 'upload' ? (
                    <div>
                      {!pkgImagePreview ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingImage(true);
                          }}
                          onDragLeave={() => setIsDraggingImage(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingImage(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handlePackageFileProcess(file);
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition ${
                            isDraggingImage
                              ? 'border-emerald-400 bg-emerald-500/10'
                              : 'border-slate-800 bg-slate-950/70 hover:border-emerald-500/50 hover:bg-slate-950'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePackageFileProcess(file);
                            }}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            {isUploadingImage ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <CloudUpload className="w-5 h-5" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-white">
                            <span className="text-emerald-400 hover:underline">Upload package image</span> or drag & drop
                          </p>
                          <p className="text-[10px] text-slate-500">JPG, PNG, WebP up to 10MB</p>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
                              <img
                                src={pkgImagePreview}
                                alt="Package preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {pkgImageFile?.name || 'Selected Package Image'}
                              </span>
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPkgImageFile(null);
                              setPkgImagePreview('');
                              setPkgImageUrlInput('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={pkgImageUrlInput}
                          onChange={(e) => {
                            setPkgImageUrlInput(e.target.value);
                            setPkgImagePreview(e.target.value);
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Clinical Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-slate-400">
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
                        </span>
                        {CLINICAL_IMAGE_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setPkgImageUrlInput(p.url);
                              setPkgImagePreview(p.url);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Included Laboratory Tests Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-300 font-bold flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                        Included Laboratory Biomarkers ({pkgSelectedTests.length} selected)
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Choose the tests bundle patients receive during this health checkup
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllTests}
                        className="text-[11px] font-bold text-emerald-400 hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={clearAllTests}
                        className="text-[11px] font-bold text-slate-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Filter bar for tests */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter tests..."
                        value={testSearchFilter}
                        onChange={(e) => setTestSearchFilter(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <select
                      value={testCategoryFilter}
                      onChange={(e) => setTestCategoryFilter(e.target.value)}
                      className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-white focus:outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      {TEST_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tests Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 border border-slate-800/80 rounded-2xl p-2 bg-slate-950/60">
                    {modalAvailableTests.length === 0 ? (
                      <div className="col-span-full py-4 text-center text-slate-500 text-xs">
                        No tests match current filter.
                      </div>
                    ) : (
                      modalAvailableTests.map((t) => {
                        const isSelected = pkgSelectedTests.includes(t._id);
                        return (
                          <div
                            key={t._id}
                            onClick={() => toggleTestSelection(t._id)}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : 'border-slate-700'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold block truncate">{t.name}</span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {t.code} • {t.category}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-emerald-400 flex-shrink-0 ml-1">
                              ${t.price}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Submit Controls */}
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
                    disabled={isSubmitting || isUploadingImage}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Package...
                      </>
                    ) : (
                      'Save Checkup Package'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* MODE B: LABORATORY TEST FORM */}
            {modalMode === 'test' && (
              <form onSubmit={handleTestSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Biomarker / Assay Name <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="e.g. Glycated Hemoglobin (HbA1c)"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 font-bold">
                        Test Code <span className="text-indigo-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setTestCode(`LAB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`)
                        }
                        className="text-[10px] text-indigo-400 hover:underline"
                      >
                        Generate Code
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={testCode}
                      onChange={(e) => setTestCode(e.target.value)}
                      placeholder="e.g. LAB-HBA1C"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Clinical Category</label>
                    <select
                      value={testCategory}
                      onChange={(e) => setTestCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {TEST_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Specimen / Sample Type</label>
                    <select
                      value={testSampleType}
                      onChange={(e) => setTestSampleType(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {SAMPLE_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Standard Diagnostic Fee ($ USD) <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={testPrice}
                      onChange={(e) => setTestPrice(e.target.value)}
                      placeholder="35.00"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="block text-slate-400 font-bold mb-1.5">Fasting Protocol</label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={testFastingRequired}
                        onChange={(e) => setTestFastingRequired(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-slate-300 font-medium text-xs">
                        Requires 10-12h Overnight Fasting
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Patient Preparation Instructions
                  </label>
                  <input
                    type="text"
                    value={testInstructions}
                    onChange={(e) => setTestInstructions(e.target.value)}
                    placeholder="e.g. 10-12 hours fasting required before test. Drink plain water freely."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Diagnostic Purpose & Overview
                  </label>
                  <textarea
                    rows={2}
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="Clinical significance, biomarker utility, reference range overview..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Submit Controls */}
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
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Lab Test...
                      </>
                    ) : (
                      'Save Laboratory Test'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Package Included Biomarkers Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" /> {selectedPackage.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedPackage.testCount} diagnostic biomarkers included
                </p>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedPackage.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Included Diagnostic Tests
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedPackage.includedTests?.map((test: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
                    >
                      <span className="font-semibold text-white">
                        {typeof test === 'string' ? test : test.name}
                      </span>
                      <span className="text-indigo-400 font-medium">
                        {test.category || 'Pathology'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
