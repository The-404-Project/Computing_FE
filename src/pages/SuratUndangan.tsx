import { useState, type ChangeEvent } from 'react';

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

// Interface untuk data penerima (Nama & Jabatan)
interface Recipient {
  nama: string;
  jabatan: string;
}

const SuratUndangan = () => {
  // --- STATE ---
  const [formData, setFormData] = useState<FormData>({
    jenis_surat: 'undangan_rapat',
    nomorSurat: '',
    lampiran: '-',
    perihal: 'Undangan',
    lokasi: '',
    tanggalAcara: '',
    waktuAcara: '',
    agenda: ''
  });

  const [inputNama, setInputNama] = useState('');       
  const [inputJabatan, setInputJabatan] = useState(''); 
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Loading & Modal State
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | 'preview' | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false); 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  // --- 1. LOGIC PREVIEW (Tanpa Simpan) ---
  const handlePreview = async () => {
    try {
      setLoadingFormat('preview'); // Loading khusus preview

      const payload = {
        jenis_surat: formData.jenis_surat,
        nomorSurat: formData.nomorSurat,
        perihal: formData.perihal,
        lampiran: formData.lampiran,
        tanggalAcara: formData.tanggalAcara,
        waktuMulai: formData.waktuAcara,
        tempat: formData.lokasi,
        agenda: formData.agenda,
        list_tamu: recipients 
      };

      // Panggil Endpoint Preview
      const response = await fetch('http://localhost:4000/api/surat-undangan/preview', {
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

  // --- 2. LOGIC EXPORT (Simpan & Download) ---
  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      setLoadingFormat(format);

      const payload = {
        jenis_surat: formData.jenis_surat,
        nomorSurat: formData.nomorSurat,
        perihal: formData.perihal, 
        lampiran: formData.lampiran,
        tanggalAcara: formData.tanggalAcara,
        waktuMulai: formData.waktuAcara,
        tempat: formData.lokasi,
        agenda: formData.agenda,
        list_tamu: recipients 
      };

      // Panggil Endpoint Create (Simpan ke DB)
      const response = await fetch(`http://localhost:4000/api/surat-undangan/create?format=${format}`, {
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

    } catch (error: any) {
      alert(`Gagal: ${error.message}`);
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Surat Undangan</h1>
            <p className="text-[#8C7A6B] mt-2 text-lg">Input detail acara untuk pembuatan dokumen otomatis.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Tombol Simpan Draft (Dummy) */}
            <button 
              className="px-5 py-2.5 bg-white border border-[#E5DED5] text-[#8C7A6B] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
              onClick={() => alert("Fitur Simpan Draft (Soon)")}
            >
              Simpan Draft
            </button>

            {/* Tombol Preview PDF */}
            <button
              onClick={handlePreview}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-white border border-[#B28D35] text-[#B28D35] font-semibold rounded-lg hover:bg-[#FDFBF7] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'preview' ? 'Loading...' : 'Preview'}
            </button>

            {/* Tombol Export PDF */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'pdf' ? 'Processing...' : 'Export PDF'}
            </button>

            {/* Tombol Export DOCX */}
            <button
              onClick={() => handleExport('docx')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#B28D35] text-white font-semibold rounded-lg hover:bg-[#96762B] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'docx' ? 'Processing...' : 'Export DOCX'}
            </button>
          </div>
        </div>

        {/* --- FORM CONTAINER --- */}
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#B28D35]/5 border border-[#F2EFE9] overflow-hidden">
          <div className="p-8 md:p-12">

            <h2 className="text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Detail Acara
            </h2>

            {/* NOMOR SURAT */}
            <div className="md:col-span-2 md:grid-cols-2 gap-8 mb-8">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">
                Nomor Surat <span className="text-[#B28D35] text-xs font-normal italic">(Opsional)</span>
              </label>
              <input
                type="text"
                name="nomorSurat"
                value={formData.nomorSurat}
                onChange={handleChange}
                placeholder="Contoh: 005/UND/X/2025 (Biarkan kosong untuk Auto-Generate)"
                className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-400 mt-2 ml-1">*Jika kosong, otomatis generate nomor.</p>
            </div>

            {/* INPUT LAINNYA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis Acara</label>
                <select
                  name="jenis_surat"
                  value={formData.jenis_surat}
                  onChange={handleChange}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none bg-[#FDFBF7]/50 cursor-pointer"
                >
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
              <textarea name="agenda" value={formData.agenda} onChange={handleChange} rows={4} className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none resize-none" placeholder="Agenda Rapat..."></textarea>
            </div>

            <div className="h-px bg-[#F2EFE9] mb-10"></div>

            <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Daftar Undangan
            </h2>

            {/* INPUT PENERIMA */}
            <div className="flex flex-col md:flex-row gap-3 mb-6 items-end">
              <div className="flex-1 w-full">
                <input type="text" value={inputNama} onChange={(e) => setInputNama(e.target.value)} placeholder="Nama Lengkap" className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <div className="flex-1 w-full">
                <input type="text" value={inputJabatan} onChange={(e) => setInputJabatan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addRecipient()} placeholder="Jabatan (Opsional)" className="w-full border border-[#E5DED5] rounded-xl p-3.5 outline-none" />
              </div>
              <button onClick={addRecipient} className="bg-[#B28D35] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#96762B] transition-all">Tambah</button>
            </div>

            {/* LIST PENERIMA */}
            <div className="bg-[#FDFBF7] rounded-2xl border border-[#F2EFE9] p-6 min-h-[150px]">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest">List Penerima ({recipients.length})</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                  {recipients.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E5DED5] shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[#4A3F35] font-bold text-lg">{item.nama}</span>
                        {item.jabatan && <span className="text-gray-400 text-sm italic">{item.jabatan}</span>}
                      </div>
                      <button onClick={() => removeRecipient(idx)} className="text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-bold">Hapus</button>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODAL PREVIEW --- */}
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

export default SuratUndangan;