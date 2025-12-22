import { useCallback, useEffect, useState, useRef } from 'react';
import api from '../services/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type DocType = 'SK_DEKAN' | 'SK_PANITIA' | 'SE_AKADEMIK' | 'SE_UMUM';
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

interface VersionEntry {
  id: string;
  name: string;
  createdAt: string;
  status: string;
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
const TEMPLATE_MAP: Record<DocType, string> = {
  SK_DEKAN: 'template_surat_keputusan_dekan.docx',
  SK_PANITIA: 'template_surat_keputusan_panitia.docx',
  SE_AKADEMIK: 'template_surat_keputusan_dekan.docx',
  SE_UMUM: 'template_surat_keputusan_dekan.docx',
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

  // Version State
  const [saveVersionName, setSaveVersionName] = useState('');
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [versionSearch, setVersionSearch] = useState('');

  // State untuk template kustom
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch templates kustom untuk surat keputusan
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/dashboard/templates/by-type/surat_keputusan');
        setTemplates(response.data.templates || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

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
    setDocType(activeTab === 'SK' ? 'SK_DEKAN' : 'SE_UMUM');
  }, [activeTab]);

  useEffect(() => {
    fetchVersions();
  }, [versionSearch]);

  // Handlers
  const fetchVersions = useCallback(async () => {
    setIsLoadingVersions(true);
    try {
      const params = new URLSearchParams();
      if (versionSearch) params.append('search', versionSearch);

      const res = await fetch(`http://localhost:4000/api/surat-keputusan/versions?${params.toString()}`);
      const json = await res.json();
      setVersions(Array.isArray(json.versions) ? json.versions : []);
    } finally {
      setIsLoadingVersions(false);
    }
  }, [versionSearch]);

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

    return {
      templateName: TEMPLATE_MAP[docType],
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

  const handleExport = useCallback(async (format: 'docx' | 'pdf', saveDraft = false) => {
    setShowExportMenu(false);
    setIsLoadingExport(true);
    setExportError('');

    let payload: any = buildPayload();
    
    if (saveDraft) {
      const name = prompt("Masukkan nama versi untuk disimpan:", `Draft ${new Date().toISOString().slice(0,10)}`);
      if (!name) {
        setIsLoadingExport(false);
        return;
      }
      setSaveVersionName(name);
      payload.saveVersionName = name;
    }

    try {
      const endpoint = format === 'docx' 
        ? 'http://localhost:4000/api/surat-keputusan/generate-docx'
        : 'http://localhost:4000/api/surat-keputusan/generate-pdf';
      
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
      
      if (saveDraft) {
        alert("Draft saved successfully!");
        fetchVersions();
      }
    } catch (error) {
      const msg = "Failed to export document";
      setExportError(msg);
      console.error(error);
    } finally {
      setIsLoadingExport(false);
    }
  }, [buildPayload, docType, fetchVersions]);

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
            <p className="text-[#8C7A6B] mt-2 text-lg">Surat Keputusan / Surat Edaran</p>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => handleExport('docx', true)}
              disabled={isLoadingExport}
              className="px-5 py-2.5 bg-white border border-[#E5DED5] text-[#8C7A6B] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm disabled:opacity-50"
            >
              Simpan Draft
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

          <FormSection title="Riwayat Versi">
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Cari versi..."
                  value={versionSearch}
                  onChange={(e) => setVersionSearch(e.target.value)}
                  className="flex-1 border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
                <button
                  onClick={() => fetchVersions()}
                  className="px-5 py-3.5 bg-[#4A3F35] text-white rounded-xl font-bold hover:bg-[#2D241E] transition-all"
                >
                  Refresh
                </button>
              </div>

              {isLoadingVersions ? (
                <p className="text-center text-[#8C7A6B] py-8 animate-pulse">Memuat data...</p>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 bg-[#FDFBF7] rounded-xl border border-[#F2EFE9] text-[#A6998E]">
                  <p className="italic">Belum ada riwayat.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {versions.map((v) => (
                    <div key={v.id} className="p-4 bg-white hover:bg-[#FDFBF7] rounded-xl border border-[#E5DED5] flex justify-between items-center transition-all shadow-sm">
                      <div>
                        <p className="font-bold text-[#4A3F35]">{v.name}</p>
                        <p className="text-[#8C7A6B] text-xs mt-1">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                      <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] text-xs rounded-full font-bold uppercase tracking-wide border border-[#C8E6C9]">{v.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}
