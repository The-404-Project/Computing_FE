import { useState, type ChangeEvent } from 'react';

// --- Interface ---
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

const SuratUndangan = () => {
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

  const [inputRecipient, setInputRecipient] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);

  // State untuk melacak format mana yang sedang loading
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addRecipient = () => {
    if (inputRecipient.trim()) {
      setRecipients([...recipients, inputRecipient]);
      setInputRecipient('');
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    // ... validasi lain ...

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
        list_tamu: recipients.map(nama => ({ nama: nama }))
      };

      const endpoint = `http://localhost:4000/api/surat-undangan/create?format=${format}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Gagal menghubungi server.');
      }

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

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Surat Undangan</h1>
            <p className="text-[#8C7A6B] mt-2 text-lg">Input detail acara untuk pembuatan dokumen otomatis.</p>
          </div>

          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-[#E5DED5] text-[#8C7A6B] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm">
              Simpan Draft
            </button>

            {/* Tombol PDF - Menggunakan Secondary Dark Tone */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loadingFormat === 'pdf' ? <span className="animate-pulse">Processing...</span> : 'Export PDF'}
            </button>

            {/* Tombol DOCX - Menggunakan Primary #B28D35 */}
            <button
              onClick={() => handleExport('docx')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#B28D35] text-white font-semibold rounded-lg hover:bg-[#96762B] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loadingFormat === 'docx' ? <span className="animate-pulse">Processing...</span> : 'Export DOCX'}
            </button>
          </div>
        </div>

        <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#B28D35]/5 border border-[#F2EFE9] overflow-hidden">
          <div className="p-8 md:p-12">

            <h2 className="text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Detail Acara
            </h2>

            <div className="md:col-span-2 md:grid-cols-2 gap-8 mb-8">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">
                Nomor Surat <span className="text-[#B28D35] text-xs font-normal italic">(Opsional - Kosongkan untuk Auto Generate)</span>
              </label>
              <input
                type="text"
                name="nomorSurat"
                value={formData.nomorSurat}
                onChange={handleChange}
                placeholder="Contoh: 005/UND/X/2025 (Biarkan kosong untuk Auto-Generate)"
                className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis Acara</label>
                <select
                  name="jenis_surat"
                  value={formData.jenis_surat}
                  onChange={handleChange}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none bg-[#FDFBF7]/50 transition-all cursor-pointer"
                >
                  <option value="undangan_rapat">Undangan Rapat</option>
                  <option value="undangan_seminar">Undangan Seminar</option>
                  <option value="undangan_kegiatan">Undangan Kegiatan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Lokasi</label>
                <input
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  placeholder="Contoh: Gedung Serbaguna Lt. 3"
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal</label>
                <input
                  type="date"
                  name="tanggalAcara"
                  value={formData.tanggalAcara}
                  onChange={handleChange}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Waktu</label>
                <input
                  type="time"
                  name="waktuAcara"
                  value={formData.waktuAcara}
                  onChange={handleChange}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Agenda</label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows={4}
                placeholder="Jelaskan poin-poin agenda rapat..."
                className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
              ></textarea>
            </div>

            <div className="h-px bg-[#F2EFE9] mb-10"></div>

            <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Daftar Undangan
            </h2>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={inputRecipient}
                onChange={(e) => setInputRecipient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                placeholder="Nama Lengkap & Jabatan..."
                className="flex-1 border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
              />
              <button
                onClick={addRecipient}
                className="bg-[#B28D35] hover:bg-[#96762B] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                Tambah
              </button>
            </div>

            <div className="bg-[#FDFBF7] rounded-2xl border border-[#F2EFE9] p-6 min-h-[150px]">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest">List Penerima ({recipients.length})</p>
              </div>

              {recipients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#A6998E]">
                  <p className="italic">Belum ada penerima.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {recipients.map((name, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E5DED5] shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <span className="text-[#4A3F35] font-medium">{name}</span>
                      <button
                        onClick={() => removeRecipient(idx)}
                        className="text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuratUndangan;