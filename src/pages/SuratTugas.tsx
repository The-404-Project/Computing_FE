import { useState, useEffect, type ChangeEvent } from 'react';
import api from '../services/api';

// --- Interface Data ---
interface FormData {
  jenis_surat: string;
  nomorSurat: string;
  tanggalSurat: string;
  namaPegawai: string;
  nip: string;
  jabatan: string;      
  pangkat: string;      
  tujuanTugas: string;  
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  biaya: string;
  kendaraan: string;    
}

interface Template {
  template_id: number;
  template_name: string;
  template_type: string;
  file_path: string;
}

// KEY UNTUK LOCAL STORAGE (Draft)
const DRAFT_KEY = 'surat_tugas_draft_v1';

const SuratTugas = () => {
  // --- State Form ---
  const [formData, setFormData] = useState<FormData>({
    jenis_surat: 'surat_tugas_dosen',
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().split('T')[0],
    namaPegawai: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    tujuanTugas: '',
    keperluan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    biaya: 'DIPA Fakultas Informatika',
    kendaraan: 'Umum'
  });

  // State UI
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | 'preview' | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false); 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // State Status Save Draft
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // State untuk template kustom
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // --- 1. LOGIC LOAD DRAFT ---
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed) setFormData(parsed);
        
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
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, isSystemReady]);

  // Fetch templates kustom untuk surat tugas
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/dashboard/templates/by-type/surat_tugas');
        setTemplates(response.data.templates || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- PREVIEW ---
  const handlePreview = async () => {
    try {
      setLoadingFormat('preview');
      
      const response = await fetch('http://localhost:4000/api/surat-tugas/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  // --- EXPORT (Final) ---
  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      setLoadingFormat(format);

      const response = await fetch(`http://localhost:4000/api/surat-tugas/create?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal export file.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_Tugas_${Date.now()}.${format}`;
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

  // --- HANDLE HAPUS DRAFT ---
  const handleDeleteDraft = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan form? Data draft akan dihapus.")) {
      localStorage.removeItem(DRAFT_KEY);
      setFormData({
        jenis_surat: 'surat_tugas_dosen',
        nomorSurat: '',
        tanggalSurat: new Date().toISOString().split('T')[0],
        namaPegawai: '',
        nip: '',
        jabatan: '',
        pangkat: '',
        tujuanTugas: '',
        keperluan: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        biaya: 'DIPA Fakultas Informatika',
        kendaraan: 'Umum'
      });
      setSaveStatus('idle');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Surat Tugas</h1>
            
            <div className="flex items-center gap-3 mt-2">
              <p className="text-[#8C7A6B] text-lg">Input detail penugasan pegawai/dosen.</p>
              
              {/* Indikator Draft */}
              {isDraftLoaded && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold shadow-sm border border-blue-200">
                  ✨ Draft dipulihkan
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <span className="animate-spin">⏳</span> Menyimpan...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                  ✅ Tersimpan otomatis
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Tombol Kosongkan Form */}
            <button
              onClick={handleDeleteDraft}
              className="px-5 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 font-semibold rounded-lg hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2"
            >
              Kosongkan Form
            </button>
            <button
              onClick={handlePreview}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-white border border-[#B28D35] text-[#B28D35] font-semibold rounded-lg hover:bg-[#FDFBF7] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'preview' ? 'Loading...' : 'Preview'}
            </button>

            <button
              onClick={() => handleExport('pdf')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'pdf' ? 'Processing...' : 'Export PDF'}
            </button>

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
              Data Pegawai & Tugas
            </h2>

            {/* JENIS SURAT & NOMOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis Surat</label>
                <select 
                  name="jenis_surat" 
                  value={formData.jenis_surat} 
                  onChange={handleChange} 
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none bg-[#FDFBF7]/50 cursor-pointer"
                  disabled={loadingTemplates}
                >
                  <option value="surat_tugas_dosen">Surat Tugas Dosen</option>
                  <option value="surat_tugas_tendik">Surat Tugas Tendik</option>
                  
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
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">
                  Nomor Surat <span className="text-[#B28D35] text-xs font-normal italic">(Opsional)</span>
                </label>
                <input 
                  type="text" 
                  name="nomorSurat" 
                  value={formData.nomorSurat} 
                  onChange={handleChange} 
                  placeholder="Auto Generate jika kosong" 
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all placeholder:text-gray-300" 
                />
              </div>
            </div>

            {/* DATA PEGAWAI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Nama Pegawai</label>
                <input type="text" name="namaPegawai" value={formData.namaPegawai} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" placeholder="Nama Lengkap & Gelar"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">NIP / NIDN</label>
                <input type="text" name="nip" value={formData.nip} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jabatan</label>
                <input type="text" name="jabatan" value={formData.jabatan} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Pangkat / Golongan</label>
                <input type="text" name="pangkat" value={formData.pangkat} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
            </div>

            <div className="h-px bg-[#F2EFE9] mb-10"></div>

            <h2 className="text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Detail Pelaksanaan
            </h2>

            {/* KEPERLUAN & TUJUAN */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Keperluan Tugas</label>
              <textarea name="keperluan" value={formData.keperluan} onChange={handleChange} rows={3} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none resize-none" placeholder="Contoh: Menghadiri Seminar Nasional..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tujuan (Tempat)</label>
                <input type="text" name="tujuanTugas" value={formData.tujuanTugas} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Kendaraan</label>
                <input type="text" name="kendaraan" value={formData.kendaraan} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
            </div>

            {/* TANGGAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal Mulai</label>
                <input type="date" name="tanggalMulai" value={formData.tanggalMulai} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal Selesai</label>
                <input type="date" name="tanggalSelesai" value={formData.tanggalSelesai} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Pembebanan Biaya</label>
                <input type="text" name="biaya" value={formData.biaya} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL PREVIEW */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Preview Dokumen</h3>
                    <button onClick={closePreview} className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">&times;</button>
                </div>
                <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
                    <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" />
                </div>
                <div className="p-4 border-t flex justify-end">
                    <button onClick={closePreview} className="px-6 py-2.5 bg-[#2D241E] text-white font-bold rounded-xl hover:bg-black">Done</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SuratTugas;