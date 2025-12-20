import { useCallback, useEffect, useState, useRef } from 'react';

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

// ============================================================================
// CONSTANTS
// ============================================================================
const TEMPLATE_MAP: Record<DocType, string> = {
  SK_DEKAN: 'template_surat_keputusan_dekan.docx',
  SK_PANITIA: 'template_surat_keputusan_panitia.docx',
  SE_AKADEMIK: 'template_surat_keputusan.docx',
  SE_UMUM: 'template_surat_keputusan.docx',
};

const PASAL_LABELS = ['Pertama', 'Kedua', 'Ketiga', 'Keempat', 'Kelima', 'Keenam', 'Ketujuh', 'Kedelapan', 'Kesembilan', 'Kesepuluh'];

const DOC_TYPE_OPTIONS: Record<TabType, { value: DocType; label: string }[]> = {
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
// ICON COMPONENTS
// ============================================================================
const Icons = {
  Calendar: () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5 text-inherit" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
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

  // ========================================================================
  // EFFECTS
  // ========================================================================
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

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const buildPayload = useCallback(() => {
    const menimbangData = processSectionData(menimbang);
    const mengingatData = processSectionData(mengingat);
    const memperhatikanData = processSectionData(memperhatikan);

    const memutuskan = {
      pembuka: menetapkan,
      pasal: pasal.map((p, i) => ({
        title: getPasalLabel(i),
        type: p.type,
        content: p.content,
        points: p.points.map((pt, idx) => ({
          label: getAlphaPrefix(idx),
          content: pt.text
        }))
      }))
    };

    const payload: any = {
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
        approvers: approvers.map(a => ({
          role: a.role,
          name: a.name
        }))
      }
    };

    return payload;
  }, [docType, perihal, nomorSurat, tempat, tanggalPenetapan, menimbang, mengingat, memperhatikan, menetapkan, pasal, approvers]);

  const handleExport = useCallback(async (format: 'docx' | 'pdf', saveDraft = false) => {
    setShowExportMenu(false);
    setIsLoadingExport(true);
    setExportError('');

    let payload = buildPayload();
    
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
        ? 'http://localhost:4000/api/modul5/generate-docx'
        : 'http://localhost:4000/api/modul5/generate-pdf';
      
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
  }, [buildPayload, docType]);

  const fetchVersions = useCallback(async () => {
    setIsLoadingVersions(true);
    try {
      const params = new URLSearchParams();
      if (versionSearch) params.append('search', versionSearch);

      const res = await fetch(`http://localhost:4000/api/modul5/versions?${params.toString()}`);
      const json = await res.json();
      setVersions(Array.isArray(json.versions) ? json.versions : []);
    } finally {
      setIsLoadingVersions(false);
    }
  }, [versionSearch]);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Error Alert */}
      {exportError && (
        <div className="max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">Export Error</h3>
              <p className="text-red-700 text-sm">{exportError}</p>
            </div>
            <button onClick={() => setExportError('')} className="text-red-600 hover:text-red-800">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buat Dokumen Resmi</h1>
            <p className="text-gray-500 mt-2">Surat Keputusan / Surat Edaran</p>
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => handleExport('docx', true)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm font-medium"
              disabled={isLoadingExport}
            >
              💾 Simpan Draft
            </button>
            
            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isLoadingExport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
              >
                {isLoadingExport ? '⏳ Processing...' : '📥 Export'} 
                <Icons.ChevronDown />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button 
                    onClick={() => handleExport('docx')}
                    disabled={isLoadingExport}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <span className="text-blue-600 font-bold">DOCX</span> Word Document
                  </button>
                  <button 
                    onClick={() => handleExport('pdf')}
                    disabled={isLoadingExport}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm border-t disabled:opacity-50"
                  >
                    <span className="text-red-600 font-bold">PDF</span> Portable Format
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {(['SK', 'SE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'SK' ? '📋 Surat Keputusan' : '📄 Surat Edaran'}
            </button>
          ))}
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Section: Document Info */}
          <FormSection title="📝 Informasi Dokumen">
            <div className="space-y-4">
              <InputField
                label="Perihal (Judul Dokumen)"
                placeholder="Contoh: Pengangkatan Panitia Wisuda"
                value={perihal}
                onChange={setPerihal}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Penetapan</label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggalPenetapan}
                    onChange={(e) => setTanggalPenetapan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-3 top-2.5"><Icons.Calendar /></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Dokumen</label>
                <select 
                  value={docType} 
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {activeTab === 'SK' ? (
                    <>
                      <option value="SK_DEKAN">SK Dekan</option>
                      <option value="SK_PANITIA">SK Panitia</option>
                    </>
                  ) : (
                    <>
                      <option value="SE_AKADEMIK">SE Akademik</option>
                      <option value="SE_UMUM">SE Umum</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </FormSection>

          {/* Section: Legal Basis */}
          <FormSection title="⚖️ Dasar Hukum">
            <div className="space-y-6">
              <DynamicList 
                title="Menimbang"
                items={menimbang}
                setItems={setMenimbang}
                placeholder="Bahwa untuk kelancaran..."
              />
              <DynamicList 
                title="Mengingat"
                items={mengingat}
                setItems={setMengingat}
                placeholder="Undang-Undang Nomor..."
              />
              <DynamicList 
                title="Memperhatikan"
                items={memperhatikan}
                setItems={setMemperhatikan}
                placeholder="Surat dari..."
              />
            </div>
          </FormSection>

          {/* Section: Document Content */}
          <FormSection title="📑 Isi Keputusan">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MEMUTUSKAN:</label>
                <textarea
                  value={menetapkan}
                  onChange={(e) => setMenetapkan(e.target.value)}
                  placeholder="Penetapan pembukaan..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="space-y-3">
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
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition font-medium flex items-center justify-center gap-2 text-sm"
              >
                <Icons.Plus /> Tambah Pasal
              </button>
            </div>
          </FormSection>

          {/* Section: Signers */}
          <FormSection title="✍️ Penandatangan">
            <div className="space-y-3">
              {approvers.map((app, idx) => (
                <div key={app.id} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Jabatan"
                    value={app.role}
                    onChange={(e) => {
                      const newApprovers = [...approvers];
                      newApprovers[idx].role = e.target.value;
                      setApprovers(newApprovers);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  {approvers.length > 1 && (
                    <button
                      onClick={() => setApprovers(approvers.filter((x) => x.id !== app.id))}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                    >
                      <Icons.Trash />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setApprovers([...approvers, { id: Date.now(), role: '', name: '' }])}
                className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1"
              >
                <Icons.Plus /> Tambah Penandatangan
              </button>
            </div>
          </FormSection>

          {/* Section: Version History */}
          <FormSection title="📚 Riwayat Versi">
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari versi..."
                  value={versionSearch}
                  onChange={(e) => setVersionSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => fetchVersions()}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {isLoadingVersions ? (
                <p className="text-center text-gray-500 text-sm py-4">⏳ Loading...</p>
              ) : versions.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">Belum ada riwayat</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {versions.map((v) => (
                    <div key={v.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{v.name}</p>
                        <p className="text-gray-500 text-xs">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">{v.status}</span>
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

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  );
}

type DynamicListProps = {
  title: string;
  items: SectionPoint[];
  setItems: (items: SectionPoint[]) => void;
  placeholder: string;
};

function DynamicList({ title, items, setItems, placeholder }: DynamicListProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">{title}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className="flex gap-2 items-start group">
            <span className="text-gray-400 text-sm pt-2 min-w-6">{getAlphaPrefix(idx)}</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={() => setItems(items.filter((x) => x.id !== item.id))}
                className="absolute right-2 top-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setItems([...items, { id: Date.now(), text: '' }])}
        className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1"
      >
        <Icons.Plus /> Tambah
      </button>
    </div>
  );
}

type PasalCardProps = {
  pasal: Pasal;
  index: number;
  onUpdate: (pasal: Pasal) => void;
  onDelete: () => void;
};

function PasalCard({ pasal, index, onUpdate, onDelete }: PasalCardProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Pasal {getPasalLabel(index)}</h3>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
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
                className={`px-3 py-1 text-xs font-medium rounded ${
                  pasal.type === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                {type === 'text' ? '📄 Teks' : '📋 Poin'}
              </button>
            ))}
          </div>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-600 transition">
            <Icons.Trash />
          </button>
        </div>
      </div>

      {pasal.type === 'text' ? (
        <textarea
          value={pasal.content}
          onChange={(e) => onUpdate({ ...pasal, content: e.target.value })}
          placeholder="Isi pasal..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 resize-none"
        />
      ) : (
        <div className="space-y-2">
          {pasal.points.map((point, ptIdx) => (
            <div key={point.id} className="flex gap-2 items-start group">
              <span className="text-gray-400 text-sm pt-2 min-w-4">{getAlphaPrefix(ptIdx)}</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={() => {
                    const updated = { ...pasal };
                    updated.points = updated.points.filter((x) => x.id !== point.id);
                    onUpdate(updated);
                  }}
                  className="absolute right-2 top-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const updated = { ...pasal };
              updated.points.push({ id: Date.now(), text: '' });
              onUpdate(updated);
            }}
            className="text-blue-600 text-xs font-medium hover:text-blue-800 flex items-center gap-1"
          >
            <Icons.Plus /> Tambah Poin
          </button>
        </div>
      )}
    </div>
  );
}
