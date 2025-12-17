import { useState, type ChangeEvent } from 'react';

// --- Interface ---
interface FormData {
  jenis_surat: string;
  nomorSurat: string; // Hidden/Auto
  lampiran: string;
  perihal: string;    // Default: Undangan
  lokasi: string;     // Sesuai Figma
  tanggalAcara: string;
  waktuAcara: string;
  agenda: string;
}

const SuratUndangan = () => {
  // --- State ---
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

  // State khusus untuk List Undangan (Sesuai Figma)
  const [inputRecipient, setInputRecipient] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fitur Tambah Penerima ke List
  const addRecipient = () => {
    if (inputRecipient.trim()) {
      setRecipients([...recipients, inputRecipient]);
      setInputRecipient('');
    }
  };

  // Hapus Penerima
  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    // Validasi
    if (recipients.length === 0) {
      alert("Harap masukkan setidaknya satu nama di Daftar Undangan!");
      return;
    }
    if (!formData.tanggalAcara || !formData.lokasi) {
      alert("Mohon lengkapi Detail Acara!");
      return;
    }

    try {
      setIsLoading(true);

      // GABUNGKAN DATA PENERIMA (Solusi sementara agar Backend Modul 2 yg skrg tetap jalan)
      // Backend menerima string 'kepada'. Kita kirim gabungan nama.
      // Nanti kalau fitur Bulk aktif, kita bisa loop di sini.
      const kepadaGabungan = recipients.join(', ');

      // Mapping data Form ke Payload Backend
      // Backend mengharapkan field: { tempat, waktuMulai, waktuSelesai ... }
      // Kita sesuaikan dari UI Figma (Lokasi -> tempat, Waktu -> waktuMulai)
      const payload = {
        ...formData,
        kepada: kepadaGabungan, 
        tempat: formData.lokasi,
        waktuMulai: formData.waktuAcara, 
        waktuSelesai: '', // Default kosong dulu
        nomorSurat: ''    // Auto generate di backend
      };

      const endpoint = `http://localhost:4000/api/surat-undangan/create?format=${format}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal menghubungi server.');

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
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION (Sesuai Figma) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buat Surat Undangan Baru</h1>
            <p className="text-gray-500 mt-1">Isi detail di bawah untuk membuat dan mengekspor surat undangan.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
             {/* Tombol Simpan Draft (Visual Only) */}
            <button className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition">
              Simpan Draft
            </button>
            <button 
              onClick={() => handleExport('pdf')} 
              disabled={isLoading}
              className="px-4 py-2 bg-gray-700 text-white font-medium rounded hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Export PDF'}
            </button>
            <button 
              onClick={() => handleExport('docx')} 
              disabled={isLoading}
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded hover:bg-black transition disabled:opacity-50"
            >
              Export DOCX
            </button>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        {/* Kolom Kanan (Template) Dihilangkan, jadi Full Width atau Centered */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="p-8">
            {/* SECTION: Detail Acara */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">Detail Acara</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Jenis Acara */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Acara</label>
                <div className="relative">
                  <select 
                    name="jenis_surat" 
                    value={formData.jenis_surat} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="undangan_rapat">Undangan Rapat</option>
                    <option value="undangan_seminar">Undangan Seminar</option>
                    <option value="undangan_kegiatan">Undangan Kegiatan</option>
                  </select>
                  {/* Chevron Icon */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi</label>
                <input 
                  type="text" 
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  placeholder="Tuliskan lokasi acara..." 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
                <input 
                  type="date" 
                  name="tanggalAcara"
                  value={formData.tanggalAcara}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {!formData.tanggalAcara && <p className="text-xs text-red-500 mt-1">Tanggal tidak boleh kosong.</p>}
              </div>

              {/* Waktu */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Waktu</label>
                <input 
                  type="time" 
                  name="waktuAcara"
                  value={formData.waktuAcara}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Agenda */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Agenda</label>
              <textarea 
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                rows={4} 
                placeholder="Jelaskan agenda acara secara singkat" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* SECTION: Daftar Undangan */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Undangan</h2>
            
            <div className="flex gap-3 mb-4">
              <input 
                type="text" 
                value={inputRecipient}
                onChange={(e) => setInputRecipient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
                placeholder="Nama Lengkap - Jabatan/Afiliasi" 
                className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button 
                onClick={addRecipient}
                className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Tambah
              </button>
            </div>

            {/* List Penerima */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 min-h-[100px]">
              <p className="text-sm font-bold text-gray-500 mb-3">Penerima Surat ({recipients.length})</p>
              
              {recipients.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Belum ada penerima ditambahkan.</p>
              ) : (
                <ul className="space-y-2">
                  {recipients.map((name, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200 shadow-sm">
                      <span className="text-gray-800 font-medium">{name}</span>
                      <button 
                        onClick={() => removeRecipient(idx)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SuratUndangan;