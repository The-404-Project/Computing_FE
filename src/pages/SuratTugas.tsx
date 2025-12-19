import { useState, type ChangeEvent } from 'react';

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

const SuratTugas = () => {
  // --- State ---
  const [formData, setFormData] = useState<FormData>({
    jenis_surat: 'surat_tugas_dosen',
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().split('T')[0], // Default Hari Ini
    namaPegawai: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    tujuanTugas: '',
    keperluan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    biaya: '',
    kendaraan: 'Umum'
  });

  const [isLoading, setIsLoading] = useState(false);

  // --- Handlers ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    // Validasi Field Wajib
    if (!formData.namaPegawai || !formData.tujuanTugas) {
      alert("Mohon lengkapi Nama dan Tempat Tujuan!");
      return;
    }

    try {
      setIsLoading(true);
      // URL Backend (Pastikan port 4000 sesuai backend-mu)
      const endpoint = `http://localhost:4000/api/surat-tugas/create?format=${format}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server backend.');
      }

      // Download Logic
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanNama = formData.namaPegawai.replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `SuratTugas_${cleanNama}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error(error);
      alert(`Gagal: ${error.message}\nPastikan backend jalan di Port 4000.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Generate Surat Tugas & Surat Perintah</h1>
          <p className="text-gray-500 text-sm mt-1">Modul 1 - Penugasan Dosen & Staf</p>
        </div>

        <form className="px-8 py-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* SECTION 1: Informasi Surat */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Surat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nomor Surat (Auto-generated)">
                <input 
                  name="nomorSurat"
                  value={formData.nomorSurat}
                  onChange={handleChange}
                  placeholder="XXX/ST/FI/MM/YYYY"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
                <p className="text-xs text-gray-400 mt-1 italic">*Biarkan kosong untuk generate otomatis</p>
              </InputGroup>
              <InputGroup label="Tanggal Surat">
                <input 
                  type="date"
                  name="tanggalSurat"
                  value={formData.tanggalSurat}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>
            </div>
          </section>

          {/* SECTION 2: Informasi Personel */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Personel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nama Lengkap & Gelar">
                <input 
                  name="namaPegawai"
                  value={formData.namaPegawai}
                  onChange={handleChange}
                  placeholder="Contoh: Dr. Jane Doe, S.Kom., M.Kom."
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>
              <InputGroup label="NIP / NIDN">
                <input 
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  placeholder="Masukkan NIP atau NIDN"
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>
              
              <InputGroup label="Pangkat / Golongan">
                <input 
                  name="pangkat"
                  value={formData.pangkat}
                  onChange={handleChange}
                  placeholder="Contoh: Penata Muda / III a"
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>
              <InputGroup label="Jabatan">
                <input 
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  placeholder="Contoh: Dosen Tetap"
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>
            </div>
          </section>

          {/* SECTION 3: Detail Penugasan */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Penugasan</h3>
            <div className="space-y-6">
              <InputGroup label="Keperluan / Tugas">
                <textarea 
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Jelaskan tujuan penugasan secara rinci..."
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>

              <InputGroup label="Tempat Tujuan">
                <input 
                  name="tujuanTugas"
                  value={formData.tujuanTugas}
                  onChange={handleChange}
                  placeholder="Nama Instansi atau Kota Tujuan"
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className='flex gap-4'>
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Tanggal Mulai</label>
                        <input 
                        type="date"
                        name="tanggalMulai"
                        value={formData.tanggalMulai}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        />
                    </div>
                    <div className='flex-1'>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Tanggal Selesai</label>
                        <input 
                        type="date"
                        name="tanggalSelesai"
                        value={formData.tanggalSelesai}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        />
                    </div>
                </div>

                <InputGroup label="Estimasi Biaya / Sumber Dana">
                  <input 
                    name="biaya"
                    value={formData.biaya}
                    onChange={handleChange}
                    placeholder="Contoh: DIPA Fakultas Informatika"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  />
                </InputGroup>
              </div>
            </div>
          </section>

          {/* SECTION 4: Konfigurasi Dokumen (Disederhanakan) */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Konfigurasi Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Pilih Template Dokumen">
                <select 
                  name="jenis_surat"
                  value={formData.jenis_surat}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                  <option value="surat_tugas_dosen">Surat Tugas Dosen</option>
                  <option value="surat_tugas_staf">Surat Tugas Staf</option>
                  <option value="sppd">Surat Perintah Perjalanan Dinas (SPPD)</option>
                </select>
              </InputGroup>
              {/* Kolom Tanda Tangan sudah DIHAPUS sesuai request */}
            </div>
          </section>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={isLoading}
              className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : 'Export PDF'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('docx')}
              disabled={isLoading}
              className="text-white bg-gray-900 hover:bg-black focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : 'Export DOCX'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Helper Component
const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

export default SuratTugas;