import { useState, useEffect, type ChangeEvent } from 'react';

// --- INTERFACES ---
interface FormData {
  jenis_surat: string;
  nomorSurat: string;
  lampiran: string;
  perihal: string;
  lokasi: string;
  tanggalAcara: string;
  waktuAcara: string;
  agenda: string;
}

interface Recipient {
  nama: string;
  jabatan: string;
}

// KEY UNTUK LOCAL STORAGE
const DRAFT_KEY = 'surat_undangan_draft_v1';

// DEFINISI STATE AWAL
const INITIAL_FORM_DATA: FormData = {
  jenis_surat: 'undangan_rapat',
  nomorSurat: '',
  lampiran: '-',
  perihal: 'Undangan',
  lokasi: '',
  tanggalAcara: '',
  waktuAcara: '',
  agenda: ''
};

const SuratUndangan = () => {
  // --- STATE ---
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const [inputNama, setInputNama] = useState('');       
  const [inputJabatan, setInputJabatan] = useState(''); 
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // State UI
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | 'preview' | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false); 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // State Penanda Draft
  const [isDraftLoaded, setIsDraftLoaded] = useState(false); 
  const [isSystemReady, setIsSystemReady] = useState(false); 
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- 1. LOGIC LOAD DRAFT ---
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.recipients) setRecipients(parsed.recipients);
        
        setIsDraftLoaded(true);
        setTimeout(() => setIsDraftLoaded(false), 3000);
      } catch (e) {
        console.error("Gagal load draft lokal", e);
      }
    }
    setIsSystemReady(true);
  }, []);

  // --- 2. LOGIC AUTO-SAVE ---
  useEffect(() => {
    if (!isSystemReady) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const objectToSave = { formData, recipients };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave));
      setSaveStatus('saved');
    }, 1000); 

    return () => clearTimeout(timer);
  }, [formData, recipients, isSystemReady]);


  // --- HANDLERS ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addRecipient = () => {
    if (inputNama.trim()) {
      setRecipients([...recipients, { nama: inputNama, jabatan: inputJabatan }]);
      setInputNama('');
      setInputJabatan('');
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  // --- HANDLE HAPUS DRAFT MANUAL ---
  const handleDeleteDraft = () => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus draft? Semua data di form akan hilang.");
    if (confirmDelete) {
      localStorage.removeItem(DRAFT_KEY);
      setFormData(INITIAL_FORM_DATA);
      setRecipients([]);
      setSaveStatus('idle');
      alert("Draft berhasil dihapus & form dikosongkan.");
    }
  };

  // --- PREVIEW ---
  const handlePreview = async () => {
    try {
      setLoadingFormat('preview');
      const payload = { ...formData, list_tamu: recipients };

      const response = await fetch('http://34.142.141.96:4000/api/surat-undangan/preview', {
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

  // --- EXPORT ---
  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      setLoadingFormat(format);
      const payload = { ...formData, list_tamu: recipients };

      const response = await fetch(`http://34.142.141.96:4000/api/surat-undangan/create?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal export file.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Undangan_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      alert(`Berhasil! Dokumen ${format.toUpperCase()} terunduh.`);

    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Surat Undangan</h1>
            
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <p className="text-[#8C7A6B] text-lg">Input detail acara.</p>
              
              {/* Notifikasi Draft */}
              {isDraftLoaded && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold shadow-sm border border-blue-200">
                  ✨ Draft lama dipulihkan
                </span>
              )}

              {/* Indikator Status Simpan */}
              {saveStatus === 'saving' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 transition-all">
                  <span className="animate-spin">⏳</span> Menyimpan...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 transition-all">
                  ✅ Tersimpan otomatis
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* 1. TOMBOL HAPUS DRAFT (Sekarang ada di sini) */}
            {
                <button 
                  onClick={handleDeleteDraft}
                  className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 font-semibold rounded-lg hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2"
                  title="Hapus draft & kosongkan form"
                >
                  Kosongkan Form
                </button>
            }

            {/* 2. Tombol Preview */}
            <button
              onClick={handlePreview}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-white border border-[#B28D35] text-[#B28D35] font-semibold rounded-lg hover:bg-[#FDFBF7] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'preview' ? 'Loading...' : '👁️ Preview'}
            </button>

            {/* 3. Tombol Export PDF */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'pdf' ? 'Processing...' : 'Export PDF'}
            </button>

            {/* 4. Tombol Export DOCX */}
            <button
              onClick={() => handleExport('docx')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#B28D35] text-white font-semibold rounded-lg hover:bg-[#96762B] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'docx' ? 'Processing...' : 'Export DOCX'}
            </button>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#B28D35]/5 border border-[#F2EFE9] overflow-hidden">
          <div className="p-8 md:p-12">
            
            <h2 className="text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Detail Acara
            </h2>

            <div className="md:col-span-2 md:grid-cols-2 gap-8 mb-8">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">
                Nomor Surat <span className="text-[#B28D35] text-xs font-normal italic">(Opsional)</span>
              </label>
              <input type="text" name="nomorSurat" value={formData.nomorSurat} onChange={handleChange} placeholder="Contoh: 005/UND/X/2025" className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis Acara</label>
                <select name="jenis_surat" value={formData.jenis_surat} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none bg-[#FDFBF7]/50 cursor-pointer">
                  <option value="undangan_rapat">Undangan Rapat</option>
                  <option value="undangan_seminar">Undangan Seminar</option>
                  <option value="undangan_kegiatan">Undangan Kegiatan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Lokasi</label>
                <input type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal</label>
                <input type="date" name="tanggalAcara" value={formData.tanggalAcara} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Waktu</label>
                <input type="time" name="waktuAcara" value={formData.waktuAcara} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Agenda</label>
              <textarea name="agenda" value={formData.agenda} onChange={handleChange} rows={4} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none resize-none" placeholder="Agenda..."></textarea>
            </div>

            <div className="h-px bg-[#F2EFE9] mb-10"></div>

            <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Daftar Undangan
            </h2>

            <div className="flex flex-col md:flex-row gap-3 mb-6 items-end">
              <div className="flex-1 w-full"><input type="text" value={inputNama} onChange={(e) => setInputNama(e.target.value)} placeholder="Nama Lengkap" className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" /></div>
              <div className="flex-1 w-full"><input type="text" value={inputJabatan} onChange={(e) => setInputJabatan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addRecipient()} placeholder="Jabatan" className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" /></div>
              <button onClick={addRecipient} className="bg-[#B28D35] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#96762B]">Tambah</button>
            </div>

            <div className="bg-[#FDFBF7] rounded-2xl border border-[#F2EFE9] p-6 min-h-150px">
              <div className="flex justify-between items-center mb-4"><p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest">List Penerima ({recipients.length})</p></div>
              <div className="grid grid-cols-1 gap-3">
                  {recipients.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E5DED5] shadow-sm">
                      <div className="flex flex-col"><span className="text-[#4A3F35] font-bold text-lg">{item.nama}</span>{item.jabatan && <span className="text-gray-400 text-sm italic">{item.jabatan}</span>}</div>
                      <button onClick={() => removeRecipient(idx)} className="text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-bold">Hapus</button>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Preview Dokumen</h3>
                    <button onClick={closePreview} className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">&times;</button>
                </div>
                <div className="flex-1 bg-gray-50 p-2 overflow-hidden"><iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" /></div>
                <div className="p-4 border-t flex justify-end"><button onClick={closePreview} className="px-6 py-2.5 bg-[#2D241E] text-white font-bold rounded-xl hover:bg-black">Done</button></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SuratUndangan;