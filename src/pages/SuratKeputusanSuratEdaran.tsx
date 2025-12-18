import { useCallback, useEffect, useState, useRef } from 'react';

type DocType = 'SK_DEKAN' | 'SK_PANITIA' | 'SE_AKADEMIK' | 'SE_UMUM';

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

const TEMPLATE_MAP: Record<DocType, string> = {
  SK_DEKAN: 'template_surat_keputusan.docx',
  SK_PANITIA: 'template_surat_keputusan.docx',
  SE_AKADEMIK: 'template_surat_keputusan.docx',
  SE_UMUM: 'template_surat_keputusan.docx',
};

// Helper for numbering
const processSectionData = (list: SectionPoint[], type: 'alpha' | 'numeric') => {
    return list.map((item, index) => {
        const prefix = type === 'alpha' 
            ? String.fromCharCode(97 + index) + '.' // a., b., c.
            : (index + 1) + '.'; // 1., 2., 3.
        return {
            label: prefix,
            content: item.text,
            fullText: `${prefix} ${item.text}`
        };
    });
};

// Simple Icons
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function SuratKeputusanSuratEdaran() {
  // UI State
  const [activeTab, setActiveTab] = useState<'SK' | 'SE'>('SK');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Data State
  const [docType, setDocType] = useState<DocType>('SK_DEKAN');
  const [perihal, setPerihal] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tempat, setTempat] = useState('');
  const [tanggalPenetapan, setTanggalPenetapan] = useState('');

  const [menimbang, setMenimbang] = useState<SectionPoint[]>([{ id: 1, text: '' }]);
  const [mengingat, setMengingat] = useState<SectionPoint[]>([{ id: 1, text: '' }]);
  const [memperhatikan, setMemperhatikan] = useState<SectionPoint[]>([]);
  
  // New State for "Menetapkan" and "Pasal"
  const [menetapkan, setMenetapkan] = useState('');
  const [pasal, setPasal] = useState<Pasal[]>([
      { id: 1, title: 'Pertama', type: 'text', content: '', points: [{ id: 1, text: '' }] }
  ]);

  const [approvers, setApprovers] = useState<Approver[]>([{ id: 1, role: 'Dekan', name: '' }]);
  
  // App Logic State
  const [previewHtml, setPreviewHtml] = useState('');
  const [saveVersionName, setSaveVersionName] = useState('');
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [versionSearch, setVersionSearch] = useState('');
  const [versionFilterType, setVersionFilterType] = useState('');

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync Tab with DocType
  useEffect(() => {
    if (activeTab === 'SK') {
      if (!docType.startsWith('SK')) setDocType('SK_DEKAN');
    } else {
      if (!docType.startsWith('SE')) setDocType('SE_UMUM');
    }
  }, [activeTab, docType]);

  const mapPayload = useCallback((options?: { includeSaveVersionName?: boolean }) => {
  const menimbangData = processSectionData(menimbang, 'alpha');
  const mengingatData = processSectionData(mengingat, 'alpha');
  const memperhatikanData = processSectionData(memperhatikan, 'alpha');

  // ============================
  // MEMUTUSKAN (HIERARKIS)
  // ============================
  const memutuskan = {
    pembuka: menetapkan,
    pasal: pasal.map((p, i) => ({
      title: getPasalNumber(i),
      type: p.type,
      content: p.content,
      points: p.points.map((pt, idx) => ({
        label: String.fromCharCode(97 + idx) + '.', // a. b. c.
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

      // ===== Dasar Hukum =====
      menimbang_rows: menimbangData.map(d => ({
        label: d.label,
        content: d.content
      })),
      mengingat_rows: mengingatData.map(d => ({
        label: d.label,
        content: d.content
      })),
      memperhatikan_rows: memperhatikanData.map(d => ({
        label: d.label,
        content: d.content
      })),

      // ===== MEMUTUSKAN (STRUKTURAL) =====
      memutuskan,

      // ===== Penandatangan =====
      approvers: approvers.map(a => ({
        role: a.role,
        name: a.name
      }))
    }
  };

  if (options?.includeSaveVersionName) {
    const trimmed = saveVersionName.trim();
    if (trimmed) payload.saveVersionName = trimmed;
  }

  return payload;
}, [
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
  approvers,
  saveVersionName
]);


  // Debounced Preview
  useEffect(() => {
    const timer = setTimeout(() => {
      const run = async () => {
        try {
          const res = await fetch('/api/modul5/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapPayload()),
          });
          if (res.ok) {
            const html = await res.text();
            setPreviewHtml(html);
          }
        } catch (e) {
          console.error("Preview error", e);
        }
      };
      run();
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [mapPayload]);

  const exportDocx = async (saveDraft = false) => {
    setShowExportMenu(false); // Close menu if open

    // Re-construct payload with the potentially new saveVersionName if passed directly?
    // mapPayload depends on state. 
    // Let's just proceed with current state for now, or alert user to fill the name field.
    // The mockup has a "Simpan Draft" button but no visible input field for it near the button.
    // I'll add a prompt logic properly.
    
    let payload = mapPayload({ includeSaveVersionName: saveDraft });
    
    if (saveDraft) {
         const name = prompt("Masukkan nama versi untuk disimpan:", saveVersionName || `Draft ${new Date().toISOString().slice(0,10)}`);
         if (!name) return;
         setSaveVersionName(name);
         payload.saveVersionName = name;
    }

    try {
      const res = await fetch('/api/modul5/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        window.alert('Gagal: ' + text);
        return;
      }

      const blob = await res.blob();
      
      // If just saving draft, maybe we don't need to download?
      // But backend returns the file. Let's download it anyway as a confirmation.
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_${docType}_${Date.now()}.docx`;
      a.click();
      
      if (saveDraft) {
          alert("Draft berhasil disimpan dan diunduh.");
          fetchVersions();
      }
    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat request.");
    }
  };

  const exportPdf = async () => {
    setShowExportMenu(false);
    window.print();
  };

  const fetchVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const params = new URLSearchParams();
      if (versionSearch) params.append('search', versionSearch);
      if (versionFilterType) params.append('type', versionFilterType);

      const res = await fetch(`/api/modul5/versions?${params.toString()}`);
      const json = await res.json();
      setVersions(Array.isArray(json.versions) ? json.versions : []);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [versionSearch, versionFilterType]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview-container, .print-preview-container * {
            visibility: visible;
          }
          .print-preview-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, footer, .no-print {
            display: none !important;
          }
        }
      `}</style>
      {/* HEADER */}
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-400 rounded-sm"></div> {/* Logo Placeholder */}
          <div>
            <h1 className="text-lg font-bold leading-tight">SIPENA</h1>
            <p className="text-xs text-gray-400">Sistem Pengelolaan Naskah Akademik</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-400"></div>
            <span className="text-sm font-medium">johndoe_</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
            
            {/* LEFT COLUMN - EDITOR */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                
                {/* Title & Actions */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Buat Dokumen Baru</h2>
                        <p className="text-gray-500 text-sm">Surat Keputusan / Edaran</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">v1.0-Draft</span>
                        <button 
                            onClick={() => exportDocx(true)}
                            className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-50 transition"
                        >
                            Simpan Draft
                        </button>
                        
                        {/* Export Dropdown */}
                        <div className="relative" ref={exportMenuRef}>
                            <button 
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-800 transition flex items-center"
                            >
                                Export <ChevronDownIcon />
                            </button>
                            
                            {showExportMenu && (
                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                                    <button 
                                        onClick={() => exportDocx(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <span className="text-blue-600 font-bold text-xs">DOCX</span> Word Document
                                    </button>
                                    <button 
                                        onClick={exportPdf}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <span className="text-red-600 font-bold text-xs">PDF</span> Portable Document
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-gray-200 p-1 rounded-lg inline-flex self-start">
                    <button 
                        onClick={() => setActiveTab('SK')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'SK' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Surat Keputusan (SK)
                    </button>
                    <button 
                        onClick={() => setActiveTab('SE')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'SE' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Surat Edaran
                    </button>
                </div>

                {/* Sub-Type Selection */}
                <div>
                     <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Dokumen Spesifik</label>
                     <select 
                        value={docType} 
                        onChange={(e) => setDocType(e.target.value as DocType)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 bg-white border"
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

                {/* Section: Informasi Dokumen */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-700">Informasi Dokumen</h3>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Perihal (Judul Dokumen)</label>
                        <input 
                            type="text" 
                            className="w-full border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            placeholder="Contoh: Pengangkatan Panitia Wisuda"
                            value={perihal}
                            onChange={e => setPerihal(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Nomor Surat</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                placeholder="123/UN1/..."
                                value={nomorSurat}
                                onChange={e => setNomorSurat(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tempat Penetapan</label>
                            <input 
                                type="text" 
                                className="w-full border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                placeholder="Bandung"
                                value={tempat}
                                onChange={e => setTempat(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tanggal Penetapan</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    className="w-full border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 pl-2 pr-8"
                                    value={tanggalPenetapan}
                                    onChange={e => setTanggalPenetapan(e.target.value)}
                                />
                                <div className="absolute right-2 top-2 pointer-events-none">
                                    <CalendarIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Dasar Hukum */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-semibold text-gray-700">Dasar Hukum</h3>
                    
                    <DynamicList 
                        title="Menimbang" 
                        items={menimbang} 
                        setItems={setMenimbang} 
                        placeholder="Bahwa untuk kelancaran..." 
                        prefix="a."
                    />

                    <DynamicList 
                        title="Mengingat" 
                        items={mengingat} 
                        setItems={setMengingat} 
                        placeholder="Undang-Undang Nomor..." 
                        prefix="1."
                    />

                    <DynamicList 
                        title="Memperhatikan" 
                        items={memperhatikan} 
                        setItems={setMemperhatikan} 
                        placeholder="Surat dari..." 
                        prefix="1."
                    />
                </div>

                {/* Section: Isi Keputusan */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-700">Isi Keputusan</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">MEMUTUSKAN:</p>
                    
                    <PasalList 
                        menetapkan={menetapkan}
                        setMenetapkan={setMenetapkan}
                        pasal={pasal}
                        setPasal={setPasal}
                    />
                </div>

                {/* Section: Penandatangan */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-700">Penandatangan</h3>
                    
                    <div className="space-y-3">
                        {approvers.map((approver, index) => (
                             <div key={approver.id} className="grid grid-cols-2 gap-4 items-start">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Jabatan</label>
                                    <input 
                                        type="text" 
                                        className="w-full border-gray-200 rounded-md p-2 text-sm bg-gray-50"
                                        placeholder="Dekan"
                                        value={approver.role}
                                        onChange={e => {
                                            const newApprovers = [...approvers];
                                            newApprovers[index].role = e.target.value;
                                            setApprovers(newApprovers);
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs text-gray-500 mb-1">Nama Pejabat</label>
                                    <input 
                                        type="text" 
                                        className="w-full border-gray-200 rounded-md p-2 text-sm bg-gray-50"
                                        placeholder="Dr. Budi Santoso"
                                        value={approver.name}
                                        onChange={e => {
                                            const newApprovers = [...approvers];
                                            newApprovers[index].name = e.target.value;
                                            setApprovers(newApprovers);
                                        }}
                                    />
                                    {approvers.length > 1 && (
                                        <button 
                                            onClick={() => setApprovers(approvers.filter(a => a.id !== approver.id))}
                                            className="absolute -right-6 top-7 text-gray-400 hover:text-red-500"
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                             </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setApprovers([...approvers, { id: Date.now(), role: '', name: '' }])}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center mt-2"
                    >
                        <PlusIcon /> Tambah Penandatangan
                    </button>
                </div>

                {/* Section: Riwayat Versi (FR-13 & FR-14) */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Riwayat Versi</h3>
                        <button onClick={fetchVersions} className="text-xs text-blue-600 hover:underline">Refresh</button>
                    </div>

                    {/* Filter & Search */}
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            placeholder="Cari versi..." 
                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                            value={versionSearch}
                            onChange={(e) => setVersionSearch(e.target.value)}
                        />
                        <select 
                            className="text-xs border border-gray-300 rounded px-2 py-1 w-24"
                            value={versionFilterType}
                            onChange={(e) => setVersionFilterType(e.target.value)}
                        >
                            <option value="">Semua</option>
                            <option value="template_surat_keputusan">SK/SE</option>
                        </select>
                    </div>
                    
                    {isLoadingVersions ? (
                        <p className="text-xs text-gray-500 text-center py-4">Loading...</p>
                    ) : versions.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">Belum ada riwayat.</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {versions.map((v) => (
                                <div key={v.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                                    <div>
                                        <p className="font-medium text-gray-800">{v.name}</p>
                                        <p className="text-gray-500">{new Date(v.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">{v.status}</span>
                                        {/* Future: Add download/restore button here */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* RIGHT COLUMN - PREVIEW */}
            <div className="col-span-12 lg:col-span-7">
                <div className="sticky top-6">
                    <div className="bg-white shadow-xl rounded-sm min-h-[800px] p-12 border border-gray-200 print-preview-container">
                        {/* Use dangerous HTML for the preview content */}
                        {previewHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="prose max-w-none font-serif text-sm leading-relaxed" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <p>Preview dokumen akan muncul di sini</p>
                                    <p className="text-xs mt-2">Isi form di sebelah kiri untuk memulai</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-500 py-6 text-center text-xs">
          &copy; 2025 Fakultas Informatika, Telkom University
      </footer>
    </div>
  );
}

// Helper Component for Dynamic Lists
function DynamicList({ 
    title, 
    items, 
    setItems, 
    placeholder, 
    prefix, 
    addButtonText = "Tambah Poin" 
}: {
    title: string, 
    items: SectionPoint[], 
    setItems: React.Dispatch<React.SetStateAction<SectionPoint[]>>, 
    placeholder: string,
    prefix: string,
    addButtonText?: string
}) {
    const getPrefix = (index: number) => {
        if (prefix === 'a.') return `${String.fromCharCode(97 + index)}.`;
        if (prefix === '1.') return `${index + 1}.`;
        return prefix;
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{title}:</label>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start group">
                        <span className="text-gray-400 text-sm pt-2 min-w-[1.5rem] select-none">{getPrefix(index)}</span>
                        <div className="flex-1 relative">
                             <textarea 
                                className="w-full border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                                rows={2}
                                placeholder={placeholder}
                                value={item.text}
                                onChange={e => {
                                    const newItems = [...items];
                                    newItems[index].text = e.target.value;
                                    setItems(newItems);
                                }}
                            />
                            <button 
                                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                className="absolute right-2 top-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => setItems([...items, { id: Date.now(), text: '' }])}
                className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center mt-3 ml-6"
            >
                <PlusIcon /> {addButtonText}
            </button>
        </div>
    );
}

function getPasalNumber(index: number): string {
  const numbers = ['Pertama', 'Kedua', 'Ketiga', 'Keempat', 'Kelima', 'Keenam', 'Ketujuh', 'Kedelapan', 'Kesembilan', 'Kesepuluh'];
  return numbers[index] || `Ke-${index + 1}`;
}

function PasalList({
    menetapkan,
    setMenetapkan,
    pasal,
    setPasal
}: {
    menetapkan: string;
    setMenetapkan: (val: string) => void;
    pasal: Pasal[];
    setPasal: React.Dispatch<React.SetStateAction<Pasal[]>>;
}) {
    return (
        <div className="space-y-6">
            {/* Menetapkan Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menetapkan:</label>
                <textarea 
                    className="w-full border-gray-200 rounded-md p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                    rows={3}
                    placeholder="Contoh: Keputusan Dekan Fakultas Informatika tentang..."
                    value={menetapkan}
                    onChange={e => setMenetapkan(e.target.value)}
                />
            </div>

            {/* Pasal List */}
            <div className="space-y-4">
                {pasal.map((p, index) => (
                    <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-700 text-sm">{getPasalNumber(index)}</h4>
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-200 rounded p-0.5 flex text-xs">
                                    <button 
                                        onClick={() => {
                                            const newPasal = [...pasal];
                                            newPasal[index].type = 'text';
                                            setPasal(newPasal);
                                        }}
                                        className={`px-2 py-1 rounded ${p.type === 'text' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                                    >
                                        Teks
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const newPasal = [...pasal];
                                            newPasal[index].type = 'points';
                                            if (newPasal[index].points.length === 0) {
                                                newPasal[index].points = [{ id: Date.now(), text: '' }];
                                            }
                                            setPasal(newPasal);
                                        }}
                                        className={`px-2 py-1 rounded ${p.type === 'points' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                                    >
                                        Poin
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setPasal(pasal.filter(item => item.id !== p.id))}
                                    className="text-gray-400 hover:text-red-500"
                                    title="Hapus Pasal"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>

                        {p.type === 'text' ? (
                            <textarea 
                                className="w-full border-gray-200 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                                rows={3}
                                placeholder={`Isi untuk ${getPasalNumber(index)}...`}
                                value={p.content}
                                onChange={e => {
                                    const newPasal = [...pasal];
                                    newPasal[index].content = e.target.value;
                                    setPasal(newPasal);
                                }}
                            />
                        ) : (
                            <div className="space-y-2 pl-2">
                                {p.points.map((pt, ptIndex) => (
                                    <div key={pt.id} className="flex gap-2 items-start group">
                                        <span className="text-gray-400 text-sm pt-2 w-4">{String.fromCharCode(97 + ptIndex)}.</span>
                                        <div className="flex-1 relative">
                                            <textarea 
                                                className="w-full border-gray-200 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                                                rows={2}
                                                placeholder="Isi poin..."
                                                value={pt.text}
                                                onChange={e => {
                                                    const newPasal = [...pasal];
                                                    newPasal[index].points[ptIndex].text = e.target.value;
                                                    setPasal(newPasal);
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newPasal = [...pasal];
                                                    newPasal[index].points = newPasal[index].points.filter(x => x.id !== pt.id);
                                                    setPasal(newPasal);
                                                }}
                                                className="absolute right-2 top-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => {
                                        const newPasal = [...pasal];
                                        newPasal[index].points.push({ id: Date.now(), text: '' });
                                        setPasal(newPasal);
                                    }}
                                    className="text-blue-600 text-xs font-medium hover:text-blue-800 flex items-center mt-2"
                                >
                                    <PlusIcon /> Tambah Poin
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button 
                    onClick={() => setPasal([...pasal, { 
                        id: Date.now(), 
                        title: getPasalNumber(pasal.length), 
                        type: 'text', 
                        content: '', 
                        points: [] 
                    }])}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition flex justify-center items-center gap-2"
                >
                    <PlusIcon /> Tambah Pasal
                </button>
            </div>
        </div>
    );
}
