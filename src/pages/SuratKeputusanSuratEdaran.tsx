import { useCallback, useEffect, useState, useRef } from 'react';
import api from '../services/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type DocType = 'SK_DEKAN' | 'SK_PANITIA' | 'SE_AKADEMIK' | 'SE_UMUM' | string; // string untuk template kustom (template_${id})
type TabType = 'SK' | 'SE';

interface SectionPoint {
  id: number;
  text: string;
}

interface Pasal {
  id: number;
  title: string;
  type: 'text' | 'points';
  content: string;
  points: SectionPoint[];
}

interface Approver {
  id: number;
  role: string;
  name: string;
}

interface DocTypeOption {
  value: DocType;
  label: string;
}

interface Template {
  template_id: number;
  template_name: string;
  template_type: string;
  file_path: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const DRAFT_KEY = 'surat_keputusan_draft_v1';

const TEMPLATE_MAP: Record<DocType, string> = {
  SK_DEKAN: 'template_surat_keputusan_dekan.docx',
  SK_PANITIA: 'template_surat_keputusan_panitia.docx',
  SE_AKADEMIK: 'template_surat_edaran_akademik.docx',
  SE_UMUM: 'template_surat_edaran_umum.docx',
};

const PASAL_LABELS = [
  'Pertama', 'Kedua', 'Ketiga', 'Keempat', 'Kelima', 
  'Keenam', 'Ketujuh', 'Kedelapan', 'Kesembilan', 'Kesepuluh'
];

const DOC_TYPE_OPTIONS: Record<TabType, DocTypeOption[]> = {
  SK: [
    { value: 'SK_DEKAN', label: 'SK Dekan' },
    { value: 'SK_PANITIA', label: 'SK Panitia' },
  ],
  SE: [
    { value: 'SE_AKADEMIK', label: 'SE Akademik' },
    { value: 'SE_UMUM', label: 'SE Umum' },
  ],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getPasalLabel = (index: number) => PASAL_LABELS[index] || `Ke-${index + 1}`;
const getAlphaPrefix = (index: number) => String.fromCharCode(97 + index) + '.';

const processSectionData = (items: SectionPoint[]) =>
  items.map((item, idx) => ({ label: getAlphaPrefix(idx), content: item.text }));

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// UI Components
const InputField = ({ label, placeholder, value, onChange }: { 
  label: string; 
  placeholder: string; 
  value: string; 
  onChange: (val: string) => void 
}) => (
  <div>
    <label className="block text-sm font-semibold text-[#6B5E54] mb-2">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all placeholder:text-gray-300"
    />
  </div>
);

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#B28D35]/5 border border-[#F2EFE9] overflow-hidden mb-8">
    <div className="p-8 md:p-12">
      <h2 className="text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
        {title}
      </h2>
      {children}
    </div>
  </div>
);

const DynamicList = ({ title, items, setItems, placeholder }: {
  title: string;
  items: SectionPoint[];
  setItems: (items: SectionPoint[]) => void;
  placeholder: string;
}) => (
  <div className="mb-6">
    <label className="block text-sm font-semibold text-[#6B5E54] mb-3">{title}</label>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-3 items-start group">
          <span className="text-[#8C7A6B] text-sm pt-4 min-w-6 font-medium">{getAlphaPrefix(idx)}</span>
          <div className="flex-1 relative">
            <textarea
              placeholder={placeholder}
              value={item.text}
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx].text = e.target.value;
                setItems(newItems);
              }}
              rows={2}
              className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
            />
          </div>
          <button
            onClick={() => setItems(items.filter((x) => x.id !== item.id))}
            className="mt-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 px-3 py-1.5 text-sm transition-colors"
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
    <button
      onClick={() => setItems([...items, { id: Date.now(), text: '' }])}
      className="mt-4 px-4 py-2 bg-[#FDFBF7] border border-[#E5DED5] text-[#B28D35] font-semibold rounded-lg hover:bg-[#F2EFE9] transition-all text-sm"
    >
      + Tambah Poin
    </button>
  </div>
);

const PasalCard = ({ pasal, index, onUpdate, onDelete }: {
  pasal: Pasal;
  index: number;
  onUpdate: (pasal: Pasal) => void;
  onDelete: () => void;
}) => (
  <div className="border border-[#E5DED5] rounded-xl p-6 bg-[#FDFBF7]/30 mb-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-[#2D241E]">Pasal {getPasalLabel(index)}</h3>
      <div className="flex gap-3 items-center">
        <div className="flex bg-white border border-[#E5DED5] rounded-lg p-1">
          {(['text', 'points'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                const updated = { ...pasal, type };
                if (type === 'points' && updated.points.length === 0) {
                  updated.points = [{ id: Date.now(), text: '' }];
                }
                onUpdate(updated);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                pasal.type === type ? 'bg-[#B28D35] text-white shadow-sm' : 'text-[#8C7A6B] hover:bg-[#F9F7F4]'
              }`}
            >
              {type === 'text' ? 'Teks' : 'Poin'}
            </button>
          ))}
        </div>
        <button onClick={onDelete} className="mt-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 px-3 py-1.5 text-sm transition-colors">
          Hapus
        </button>
      </div>
    </div>

    {pasal.type === 'text' ? (
      <textarea
        value={pasal.content}
        onChange={(e) => onUpdate({ ...pasal, content: e.target.value })}
        placeholder="Isi pasal..."
        rows={3}
        className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
      />
    ) : (
      <div className="space-y-3">
        {pasal.points.map((point, ptIdx) => (
          <div key={point.id} className="flex gap-3 items-start group">
            <span className="text-[#8C7A6B] text-sm pt-4 min-w-4 font-medium">{getAlphaPrefix(ptIdx)}</span>
            <div className="flex-1 relative">
              <textarea
                value={point.text}
                onChange={(e) => {
                  const updated = { ...pasal };
                  updated.points[ptIdx].text = e.target.value;
                  onUpdate(updated);
                }}
                placeholder="Isi poin..."
                rows={2}
                className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
              />
            </div>
            <button
              onClick={() => {
                const updated = { ...pasal };
                updated.points = updated.points.filter((x) => x.id !== point.id);
                onUpdate(updated);
              }}
              className="mt-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 px-3 py-1.5 text-sm transition-colors"
            >
              Hapus
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const updated = { ...pasal };
            updated.points.push({ id: Date.now(), text: '' });
            onUpdate(updated);
          }}
          className="mt-2 px-3 py-1.5 bg-white border border-[#E5DED5] text-[#B28D35] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all text-xs"
        >
          + Tambah Poin
        </button>
      </div>
    )}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SuratKeputusanSuratEdaran() {
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('SK');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [exportError, setExportError] = useState('');

  // Preview State
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | 'preview' | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Auto-Save State
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Form State
  const [docType, setDocType] = useState<DocType>('SK_DEKAN');
  const [perihal, setPerihal] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tempat, setTempat] = useState('');
  const [tanggalPenetapan, setTanggalPenetapan] = useState('');
  const [menimbang, setMenimbang] = useState<SectionPoint[]>([{ id: 1, text: '' }]);
  const [mengingat, setMengingat] = useState<SectionPoint[]>([{ id: 1, text: '' }]);
  const [memperhatikan, setMemperhatikan] = useState<SectionPoint[]>([]);
  const [menetapkan, setMenetapkan] = useState('');
  const [pasal, setPasal] = useState<Pasal[]>([
    { id: 1, title: 'Pertama', type: 'text', content: '', points: [{ id: 1, text: '' }] }
  ]);
  const [approvers, setApprovers] = useState<Approver[]>([{ id: 1, role: 'Dekan', name: '' }]);

  // State untuk template kustom
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch templates kustom - fetch untuk semua jenis yang relevan
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        // Fetch template untuk semua jenis SK dan SE yang relevan
        const templateTypes = [
          'surat_keputusan',
          'sk_dekan',
          'sk_panitia',
          'se_akademik',
          'se_umum',
        ];

        const responses = await Promise.all(
          templateTypes.map((type) =>
            api.get(`/dashboard/templates/by-type/${type}`).catch(() => ({ data: { templates: [] } }))
          )
        );

        // Gabungkan semua template
        const allTemplates = responses.flatMap((response) => response.data.templates || []);

        // Hapus duplikat berdasarkan template_id
        const uniqueTemplates = allTemplates.filter((template, index, self) =>
          index === self.findIndex((t) => t.template_id === template.template_id)
        );

        setTemplates(uniqueTemplates);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // --- 1. LOGIC LOAD DRAFT (Saat Halaman Dibuka) ---
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.docType) setDocType(parsed.docType);
        if (parsed.perihal) setPerihal(parsed.perihal);
        if (parsed.nomorSurat) setNomorSurat(parsed.nomorSurat);
        if (parsed.tempat) setTempat(parsed.tempat);
        if (parsed.tanggalPenetapan) setTanggalPenetapan(parsed.tanggalPenetapan);
        if (parsed.menimbang) setMenimbang(parsed.menimbang);
        if (parsed.mengingat) setMengingat(parsed.mengingat);
        if (parsed.memperhatikan) setMemperhatikan(parsed.memperhatikan);
        if (parsed.menetapkan) setMenetapkan(parsed.menetapkan);
        if (parsed.pasal) setPasal(parsed.pasal);
        if (parsed.approvers) setApprovers(parsed.approvers);

        setIsDraftLoaded(true);
        setTimeout(() => setIsDraftLoaded(false), 3000);
      } catch (e) {
        console.error('Gagal load draft lokal', e);
      }
    }
    // Tandai sistem siap
    setIsSystemReady(true);
  }, []);

  // --- 2. LOGIC AUTO-SAVE + NOTIFIKASI ---
  useEffect(() => {
    if (!isSystemReady) return;

    setSaveStatus('saving');

    const timer = setTimeout(() => {
      const objectToSave = {
        docType,
        perihal,
        nomorSurat,
        tempat,
        tanggalPenetapan,
        menimbang,
        mengingat,
        memperhatikan,
        menetapkan,
        pasal,
        approvers
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [docType, perihal, nomorSurat, tempat, tanggalPenetapan, menimbang, mengingat, memperhatikan, menetapkan, pasal, approvers, isSystemReady]);


  // Effects
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Only switch docType if not loading from draft initially
    if (isSystemReady) {
       setDocType(activeTab === 'SK' ? 'SK_DEKAN' : 'SE_UMUM');
    }
  }, [activeTab, isSystemReady]);

  // Handlers
  const buildPayload = useCallback(() => {
    // Filter empty items
    const menimbangFiltered = menimbang.filter(item => item.text.trim() !== '');
    const mengingatFiltered = mengingat.filter(item => item.text.trim() !== '');
    const memperhatikanFiltered = memperhatikan.filter(item => item.text.trim() !== '');

    const menimbangData = processSectionData(menimbangFiltered);
    const mengingatData = processSectionData(mengingatFiltered);
    const memperhatikanData = processSectionData(memperhatikanFiltered);

    const memutuskan = {
      pembuka: menetapkan,
      pasal: pasal.map((p, i) => ({
        title: getPasalLabel(i),
        type: p.type,
        content: p.content,
        points: p.points
          .filter(pt => pt.text.trim() !== '')
          .map((pt, idx) => ({
            label: getAlphaPrefix(idx),
            content: pt.text
          }))
      }))
    };

    const approversFiltered = approvers.filter(a => a.name.trim() !== '' || a.role.trim() !== '');

    // Handle template kustom
    let templateName: string;
    if (docType.startsWith('template_')) {
      // Template kustom - ambil dari templates state
      const templateId = parseInt(docType.replace('template_', ''));
      const customTemplate = templates.find(t => t.template_id === templateId);
      templateName = customTemplate?.file_path || '';
    } else {
      // Template default
      templateName = TEMPLATE_MAP[docType as keyof typeof TEMPLATE_MAP] || '';
    }

    return {
      templateName,
      docType,
      data: {
        perihal,
        nomor_surat: nomorSurat,
        tempat,
        tanggal_penetapan: tanggalPenetapan,
        menimbang_rows: menimbangData,
        mengingat_rows: mengingatData,
        memperhatikan_rows: memperhatikanData,
        memutuskan,
        approvers: approversFiltered.map(a => ({
          role: a.role,
          name: a.name
        }))
      }
    };
  }, [docType, perihal, nomorSurat, tempat, tanggalPenetapan, menimbang, mengingat, memperhatikan, menetapkan, pasal, approvers]);

  const handlePreview = async () => {
    try {
      setLoadingFormat('preview');
      const payload = buildPayload();

      const response = await fetch('http://34.142.141.96:4000/api/surat-keputusan/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal memuat preview');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreviewModal(true);
    } catch (error: any) {
      alert(`Preview Gagal: ${error.message}`);
    } finally {
      setLoadingFormat(null);
    }
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleExport = useCallback(async (format: 'docx' | 'pdf') => {
    setShowExportMenu(false);
    setIsLoadingExport(true);
    setExportError('');

    let payload: any = buildPayload();
    
    try {
      const endpoint = format === 'docx' 
        ? 'http://34.142.141.96:4000/api/surat-keputusan/generate-docx'
        : 'http://34.142.141.96:4000/api/surat-keputusan/generate-pdf';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setExportError(`Error: ${text}`);
        return;
      }

      const blob = await res.blob();
      const filename = `Surat_${docType}_${Date.now()}.${format}`;
      downloadFile(blob, filename);
      
      // Clear Draft & Reset Form (Optional: or just keep it?)
      // Usually users want to keep the form after export, but clear the draft key if it's considered "Done"
      // In Modul2 reference, it clears the draft. We will follow that.
      localStorage.removeItem(DRAFT_KEY);
      setSaveStatus('idle');
      
      alert(`Berhasil! Dokumen ${format.toUpperCase()} terunduh.`);

    } catch (error) {
      const msg = "Failed to export document";
      setExportError(msg);
      console.error(error);
    } finally {
      setIsLoadingExport(false);
    }
  }, [buildPayload, docType]);

  // --- HANDLE KOSONGKAN FORM ---
  const handleDeleteDraft = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan form? Data draft akan dihapus.")) {
      localStorage.removeItem(DRAFT_KEY);
      // Reset State ke Default
      setDocType(activeTab === 'SK' ? 'SK_DEKAN' : 'SE_UMUM');
      setPerihal('');
      setNomorSurat('');
      setTempat('');
      setTanggalPenetapan('');
      setMenimbang([{ id: Date.now(), text: '' }]);
      setMengingat([{ id: Date.now() + 1, text: '' }]);
      setMemperhatikan([]);
      setMenetapkan('');
      setPasal([{ 
        id: Date.now(), 
        title: 'Pertama', 
        type: 'text', 
        content: '', 
        points: [{ id: Date.now(), text: '' }] 
      }]);
      setApprovers([{ id: Date.now(), role: 'Dekan', name: '' }]);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      {exportError && (
        <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-start">
          <div>
            <h3 className="text-red-800 font-medium">Export Error</h3>
            <p className="text-red-700 text-sm">{exportError}</p>
          </div>
          <button onClick={() => setExportError('')} className="text-red-600 hover:text-red-800 font-bold">✕</button>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Dokumen Resmi</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-[#8C7A6B] text-lg">Surat Keputusan / Surat Edaran</p>
              
              {/* Notifikasi Draft */}
              {isDraftLoaded && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold shadow-sm border border-blue-200">✨ Draft lama dipulihkan</span>}
              
              {/* Indikator Status Simpan */}
              {saveStatus === 'saving' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 transition-all">
                  <span className="animate-spin">⏳</span> Menyimpan...
                </span>
              )}
              {saveStatus === 'saved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 transition-all">✅ Draft Tersimpan</span>}
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {/* Tombol Kosongkan Form */}
              <button 
                onClick={handleDeleteDraft}
                className="items-center gap-2 bg-rose-100 text-rose-700 px-5 py-2.5 rounded-lg font-bold hover:bg-rose-200 transition-all shadow-sm border border-rose-200 disabled:opacity-50"
              >
                🗑️ Kosongkan Form
              </button>
             {/* Tombol Preview */}
             <button
              onClick={handlePreview}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-white border border-[#B28D35] text-[#B28D35] font-semibold rounded-lg hover:bg-[#FDFBF7] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'preview' ? 'Loading...' : 'Preview'}
            </button>

            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isLoadingExport}
                className="px-5 py-2.5 bg-[#B28D35] text-white font-semibold rounded-lg hover:bg-[#96762B] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isLoadingExport ? <span className="animate-pulse">Processing...</span> : 'Export Dokumen'} 
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5DED5] rounded-xl shadow-xl z-50 overflow-hidden">
                  <button 
                    onClick={() => handleExport('docx')}
                    disabled={isLoadingExport}
                    className="w-full text-left px-4 py-3 text-[#4A3F35] hover:bg-[#F9F7F4] flex items-center gap-2 text-sm disabled:opacity-50 font-medium"
                  >
                    <span className="text-[#B28D35] font-bold">DOCX</span> Word Document
                  </button>
                  <button 
                    onClick={() => handleExport('pdf')}
                    disabled={isLoadingExport}
                    className="w-full text-left px-4 py-3 text-[#4A3F35] hover:bg-[#F9F7F4] flex items-center gap-2 text-sm border-t border-[#F2EFE9] disabled:opacity-50 font-medium"
                  >
                    <span className="text-[#4A3F35] font-bold">PDF</span> Portable Format
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8">
          {(['SK', 'SE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-sm rounded-xl transition-all shadow-sm ${
                activeTab === tab 
                  ? 'bg-[#4A3F35] text-white' 
                  : 'bg-white border border-[#E5DED5] text-[#8C7A6B] hover:bg-[#F9F7F4]'
              }`}
            >
              {tab === 'SK' ? 'Surat Keputusan' : 'Surat Edaran'}
            </button>
          ))}
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          <FormSection title="Informasi Dokumen">
            <div className="space-y-6">
              <InputField
                label="Perihal (Judul Dokumen)"
                placeholder="Contoh: Pengangkatan Panitia Wisuda"
                value={perihal}
                onChange={setPerihal}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField
                  label="Nomor Surat"
                  placeholder="123/UN1/2024"
                  value={nomorSurat}
                  onChange={setNomorSurat}
                />
                <InputField
                  label="Tempat Penetapan"
                  placeholder="Bandung"
                  value={tempat}
                  onChange={setTempat}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal Penetapan</label>
                <input
                  type="date"
                  value={tanggalPenetapan}
                  onChange={(e) => setTanggalPenetapan(e.target.value)}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis Dokumen</label>
                <select 
                  value={docType} 
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none bg-[#FDFBF7]/50 transition-all cursor-pointer"
                  disabled={loadingTemplates}
                >
                  {DOC_TYPE_OPTIONS[activeTab].map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                  
                  {/* Template Kustom dari Database */}
                  {templates.length > 0 && (
                    <>
                      <optgroup label="Template Kustom">
                        {templates.map((template) => (
                          <option key={template.template_id} value={`template_${template.template_id}`}>
                            {template.template_name}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                </select>
                {loadingTemplates && <p className="text-xs text-[#8C7A6B] mt-1">Memuat template...</p>}
                {loadingTemplates && (
                  <p className="text-xs text-[#8C7A6B] mt-1">Memuat template...</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Dasar Hukum">
            <div className="space-y-6">
              <DynamicList 
                title="Menimbang"
                items={menimbang}
                setItems={setMenimbang}
                placeholder="Bahwa untuk kelancaran..."
              />
              <div className="h-px bg-[#F2EFE9] my-6"></div>
              <DynamicList 
                title="Mengingat"
                items={mengingat}
                setItems={setMengingat}
                placeholder="Undang-Undang Nomor..."
              />
              <div className="h-px bg-[#F2EFE9] my-6"></div>
              <DynamicList 
                title="Memperhatikan"
                items={memperhatikan}
                setItems={setMemperhatikan}
                placeholder="Surat dari..."
              />
            </div>
          </FormSection>

          <FormSection title="Isi Keputusan">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">MEMUTUSKAN:</label>
                <textarea
                  value={menetapkan}
                  onChange={(e) => setMenetapkan(e.target.value)}
                  placeholder="Penetapan pembukaan..."
                  rows={3}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
                />
              </div>

              <div className="space-y-4">
                {pasal.map((p, idx) => (
                  <PasalCard
                    key={p.id}
                    pasal={p}
                    index={idx}
                    onUpdate={(updated) => {
                      const newPasal = [...pasal];
                      newPasal[idx] = updated;
                      setPasal(newPasal);
                    }}
                    onDelete={() => setPasal(pasal.filter((x) => x.id !== p.id))}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setPasal([
                    ...pasal,
                    {
                      id: Date.now(),
                      title: getPasalLabel(pasal.length),
                      type: 'text',
                      content: '',
                      points: [],
                    },
                  ])
                }
                className="w-full py-3.5 border-2 border-dashed border-[#E5DED5] text-[#8C7A6B] rounded-xl hover:border-[#B28D35] hover:text-[#B28D35] transition-all font-bold flex items-center justify-center gap-2"
              >
                + Tambah Pasal
              </button>
            </div>
          </FormSection>

          <FormSection title="Penandatangan">
            <div className="space-y-4">
              {approvers.map((app, idx) => (
                <div key={app.id} className="flex flex-col md:flex-row gap-4 p-4 bg-[#FDFBF7] rounded-xl border border-[#E5DED5]">
                  <input
                    type="text"
                    placeholder="Jabatan"
                    value={app.role}
                    onChange={(e) => {
                      const newApprovers = [...approvers];
                      newApprovers[idx].role = e.target.value;
                      setApprovers(newApprovers);
                    }}
                    className="flex-1 border border-[#E5DED5] rounded-xl p-3 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Nama"
                    value={app.name}
                    onChange={(e) => {
                      const newApprovers = [...approvers];
                      newApprovers[idx].name = e.target.value;
                      setApprovers(newApprovers);
                    }}
                    className="flex-1 border border-[#E5DED5] rounded-xl p-3 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                  />
                  {approvers.length > 1 && (
                    <button
                      onClick={() => setApprovers(approvers.filter((x) => x.id !== app.id))}
                      className="mt-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 px-3 py-1.5 text-sm transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setApprovers([...approvers, { id: Date.now(), role: '', name: '' }])}
                className="mt-2 text-[#B28D35] font-bold hover:text-[#96762B] transition-colors"
              >
                + Tambah Penandatangan
              </button>
            </div>
          </FormSection>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Preview Dokumen</h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">
                &times;
              </button>
            </div>
            <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" />
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={closePreview} className="px-6 py-2.5 bg-[#2D241E] text-white font-bold rounded-xl hover:bg-black">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
