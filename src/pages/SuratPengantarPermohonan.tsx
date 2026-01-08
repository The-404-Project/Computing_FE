import { useState, useEffect, type ChangeEvent } from 'react';
import api from '../services/api';

// --- Types & Interfaces ---
interface Student {
  nama: string;
  nim: string;
}

interface DateRange {
  start: string;
  end: string;
  deadline: string;
}

interface ContentBlock {
  pembuka: string;
  isi: string;
  penutup: string;
}

interface FormData {
  tujuanSurat: string;
  nomorSurat: string;
  lampiran: string;
  perihal: string;
  alamatTujuan: string;
  tembusan: string;
}

interface Template {
  template_id: number;
  template_name: string;
  template_type: string;
  file_path: string;
}

// KEY UNTUK LOCAL STORAGE
const DRAFT_KEY = 'surat_pengantar_draft_v1';

const SuratPengantarPermohonan = () => {
  // --- STATE ---
  
  // 1. Data Utama
  const [formData, setFormData] = useState<FormData>({
    tujuanSurat: '',
    nomorSurat: '',
    lampiran: '',
    perihal: '',
    alamatTujuan: '',
    tembusan: '',
  });

  const [content, setContent] = useState<ContentBlock>({
    pembuka: '',
    isi: '',
    penutup: ''
  });

  const [students, setStudents] = useState<Student[]>([{ nama: '', nim: '' }]);
  const [dates, setDates] = useState<DateRange>({ start: '', end: '', deadline: '' });
  
  // [REMOVED] State File Upload dihapus
  // const [file, setFile] = useState<File | null>(null);

  // 2. State UI & Loading
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | 'preview' | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 3. State Draft & Auto-save
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // 4. State Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // --- HELPER: DYNAMIC PLACEHOLDERS ---
  const getPlaceholders = (jenis: string) => {
    switch (jenis) {
        case 'pengantar_magang':
            return {
                perihal: "Contoh: Permohonan Kerja Praktek (Reguler)",
                pembuka: "Contoh: Sebagai bagian pada proses studi di Program S1 Informatika...",
                isi: "Contoh: Mohon mahasiswa tersebut dapat diberi ijin untuk melaksanakan Kerja Praktek...",
                penutup: "Contoh: Kami mohon surat balasan (diijinkan atau tidak) dapat kami terima..."
            };
        case 'pengantar_penelitian':
            return {
                perihal: "Contoh: Permohonan Izin Penelitian Skripsi",
                pembuka: "Contoh: Sehubungan dengan penyusunan Tugas Akhir mahasiswa...",
                isi: "Contoh: Kami mohon bantuan Bapak/Ibu untuk memberikan izin pengambilan data...",
                penutup: "Contoh: Demikian permohonan ini kami sampaikan. Atas bantuan..."
            };
        case 'permohonan_izin_kegiatan':
            return {
                perihal: "Contoh: Permohonan Izin Kegiatan Akademik",
                pembuka: "Contoh: Sehubungan dengan akan dilaksanakannya kegiatan...",
                isi: "Contoh: Kami bermaksud memohon izin penggunaan tempat/fasilitas...",
                penutup: "Contoh: Atas perhatian dan izin yang diberikan, kami ucapkan terima kasih."
            };
        default:
            return {
                perihal: "Isi perihal surat...",
                pembuka: "Isi paragraf pembuka...",
                isi: "Isi detail maksud dan tujuan surat...",
                penutup: "Isi paragraf penutup..."
            };
    }
  };

  const placeholders = getPlaceholders(formData.tujuanSurat);

  // --- EFFECT: Load Draft ---
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.content) setContent(parsed.content);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.dates) setDates(parsed.dates);

        setIsDraftLoaded(true);
        setTimeout(() => setIsDraftLoaded(false), 3000);
      } catch (e) {
        console.error('Gagal load draft', e);
      }
    }
    setIsSystemReady(true);
  }, []);

  // --- EFFECT: Fetch Templates ---
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/dashboard/templates/by-type/surat_pengantar');
        setTemplates(response.data.templates || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // --- EFFECT: Auto-Save ---
  useEffect(() => {
    if (!isSystemReady) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const objectToSave = { formData, content, students, dates };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, content, students, dates, isSystemReady]);


  // --- HANDLERS ---

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleStudentChange = (index: number, field: keyof Student, value: string) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const addStudent = () => setStudents([...students, { nama: '', nim: '' }]);
  
  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  // [REMOVED] Handler file change dihapus
  // const handleFileChange = ...

  // --- DATA PREPARATION ---
  const formatDateIndo = (dateString: string) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const constructPayload = () => {
    return {
      jenis_surat: formData.tujuanSurat,
      nomorSurat: formData.nomorSurat, 
      metadata: {
        perihal: formData.perihal,
        lampiran: formData.lampiran, // Hanya kirim teks lampiran
        alamat_array: formData.alamatTujuan.split('\n'),
        cc_array: formData.tembusan ? formData.tembusan.split(',').map(s => s.trim()) : [],
        // [MODIFIED] Set static dash karena tidak ada upload file
        lampiran_file: "-" 
      },
      content_blocks: content,
      dynamic_data: {
        students: students,
        dates: {
          start: formatDateIndo(dates.start),
          end: formatDateIndo(dates.end),
          deadline: formatDateIndo(dates.deadline)
        }
      }
    };
  };

  // --- API ACTIONS ---

  const handlePreview = async () => {
    if (!formData.tujuanSurat) {
        alert("Pilih jenis surat terlebih dahulu.");
        return;
    }
    try {
      setLoadingFormat('preview');
      const payload = constructPayload();

      // Request body tetap JSON standard, bukan FormData
      const response = await fetch('http://localhost:4000/api/surat-pengantar/preview', {
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

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!formData.tujuanSurat) {
        alert("Pilih jenis surat terlebih dahulu.");
        return;
    }
    try {
      setLoadingFormat(format);
      const payload = constructPayload();

      const response = await fetch(`http://localhost:4000/api/surat-pengantar/create?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal export file.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanPerihal = (formData.perihal || 'Surat').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Surat_${cleanPerihal}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Reset Draft & State
      localStorage.removeItem(DRAFT_KEY);
      setSaveStatus('idle');
      alert(`Berhasil! Dokumen ${format.toUpperCase()} terunduh.`);

    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
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

  const isStudentDataNeeded = ['pengantar_magang', 'pengantar_penelitian'].includes(formData.tujuanSurat);

  // --- HANDLE KOSONGKAN FORM ---
  const handleDeleteDraft = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan form? Data draft akan dihapus.")) {
      localStorage.removeItem(DRAFT_KEY);
      
      setFormData({
        tujuanSurat: '',
        nomorSurat: '',
        lampiran: '',
        perihal: '',
        alamatTujuan: '',
        tembusan: '',
      });
      
      setContent({ pembuka: '', isi: '', penutup: '' });
      setStudents([{ nama: '', nim: '' }]); 
      setDates({ start: '', end: '', deadline: '' });
      
      setSaveStatus('idle');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Surat Pengantar & Permohonan</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-[#8C7A6B] text-lg">Buat surat magang, penelitian, atau izin kegiatan.</p>
              
              {isDraftLoaded && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold shadow-sm border border-blue-200">✨ Draft dipulihkan</span>}
              {saveStatus === 'saving' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><span className="animate-spin">⏳</span> Menyimpan...</span>}
              {saveStatus === 'saved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✅ Draft Tersimpan</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Tombol Kosongkan Form */}
            <button 
              onClick={handleDeleteDraft}
              className="px-5 py-2.5 text-xs bg-rose-100 text-rose-700  rounded-lg font-bold hover:bg-rose-200 transition-colors border border-rose-200 flex items-center gap-1"
            >
              🗑️ Kosongkan Form
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
          <div className="p-8 md:p-12 space-y-10">

            {/* SECTION 1: INFORMASI DASAR */}
            <div>
                <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                    Informasi Dasar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis / Tujuan Surat</label>
                        <select 
                            name="tujuanSurat" 
                            value={formData.tujuanSurat} 
                            onChange={handleChange} 
                            className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none bg-[#FDFBF7]/50"
                            disabled={loadingTemplates}
                        >
                            <option value="" disabled>-- Pilih Jenis Surat --</option>
                            <option value="pengantar_magang">Surat Pengantar Magang (KP)</option>
                            <option value="pengantar_penelitian">Surat Pengantar Penelitian</option>
                            <option value="permohonan_izin_kegiatan">Surat Izin Kegiatan</option>
                            <option value="permohonan_kerjasama">Surat Permohonan Kerjasama</option>
                            {templates.length > 0 && (
                                <optgroup label="Template Kustom">
                                    {templates.map(t => <option key={t.template_id} value={`template_${t.template_id}`}>{t.template_name}</option>)}
                                </optgroup>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Nomor Surat <span className="text-[#B28D35] text-xs font-normal italic">(Biarkan kosong untuk auto)</span></label>
                        <input type="text" name="nomorSurat" value={formData.nomorSurat} onChange={handleChange} placeholder="Contoh: 001/AKD/2025" className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
                    </div>
                </div>
                
                <div className="mt-6">
                      <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Perihal</label>
                      <input 
                        type="text" 
                        name="perihal" 
                        value={formData.perihal} 
                        onChange={handleChange} 
                        className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" 
                        placeholder={placeholders.perihal} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Alamat Tujuan (Yth...)</label>
                        <textarea name="alamatTujuan" value={formData.alamatTujuan} onChange={handleChange} rows={4} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none font-mono text-sm" placeholder={`Yth. HRD PT Telkom\nJl. Geger Kalong No 1\nBandung`} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Lampiran (Teks)</label>
                        <input type="text" name="lampiran" value={formData.lampiran} onChange={handleChange} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none mb-4" placeholder="Contoh: 1 (satu) Berkas" />
                        
                        {/* [REMOVED] Input File Upload dihapus */}
                    </div>
                </div>
            </div>

            <div className="h-px bg-[#F2EFE9]"></div>

            {/* SECTION 2: DATA MAHASISWA & TANGGAL */}
            {isStudentDataNeeded && (
                <div>
                      <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                        Data Mahasiswa & Waktu
                    </h2>
                    
                    <div className="bg-[#FDFBF7] rounded-xl border border-[#F2EFE9] p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-[#8C7A6B] uppercase tracking-widest">Daftar Mahasiswa</h3>
                            <button onClick={addStudent} className="text-sm text-[#B28D35] font-bold hover:underline">+ Tambah Mahasiswa</button>
                        </div>
                        
                        <div className="space-y-3">
                            {students.map((student, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-1/3">
                                        <input type="text" value={student.nim} onChange={e => handleStudentChange(idx, 'nim', e.target.value)} placeholder="NIM" className="w-full border border-[#E5DED5] rounded-lg p-3 outline-none bg-white" />
                                    </div>
                                    <div className="w-2/3 flex gap-2">
                                        <input type="text" value={student.nama} onChange={e => handleStudentChange(idx, 'nama', e.target.value)} placeholder="Nama Lengkap" className="w-full border border-[#E5DED5] rounded-lg p-3 outline-none bg-white" />
                                        {students.length > 1 && (
                                            <button onClick={() => removeStudent(idx)} className="text-rose-500 hover:text-rose-700 px-2 font-bold">✕</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal Mulai</label>
                            <input type="date" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal Selesai</label>
                            <input type="date" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Deadline Balasan</label>
                            <input type="date" value={dates.deadline} onChange={e => setDates({...dates, deadline: e.target.value})} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
                        </div>
                    </div>
                </div>
            )}

            {isStudentDataNeeded && <div className="h-px bg-[#F2EFE9]"></div>}

            {/* SECTION 3: KONTEN SURAT */}
            <div>
                 <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                    Konten Surat (Editable)
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Paragraf Pembuka</label>
                        <textarea 
                            name="pembuka" 
                            value={content.pembuka} 
                            onChange={handleContentChange} 
                            rows={3} 
                            className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none resize-none"
                            placeholder={placeholders.pembuka}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Isi Utama / Detail Permohonan</label>
                        <textarea 
                            name="isi" 
                            value={content.isi} 
                            onChange={handleContentChange} 
                            rows={4} 
                            className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none resize-none"
                            placeholder={placeholders.isi}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Paragraf Penutup</label>
                        <textarea 
                            name="penutup" 
                            value={content.penutup} 
                            onChange={handleContentChange} 
                            rows={3} 
                            className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none resize-none"
                            placeholder={placeholders.penutup}
                        />
                    </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tembusan (CC)</label>
                        <textarea name="tembusan" value={formData.tembusan} onChange={handleChange} rows={2} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" placeholder="Contoh: Arsip, Dosen Wali (Pisahkan dengan koma)" />
                    </div>
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
            <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
               <button onClick={closePreview} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold">Tutup</button>
               <button onClick={() => { closePreview(); handleExport('docx'); }} className="px-6 py-2.5 bg-[#2D241E] text-white font-bold rounded-xl hover:bg-black">Download Sekarang</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratPengantarPermohonan;