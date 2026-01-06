import { useState, useEffect, type ChangeEvent } from 'react';

// --- Interfaces ---
interface KriteriaRow {
  kriteria: string;
  standar: string;
  deskripsi: string;
  nilai: string;
}

interface LampiranRow {
  nama: string;
  jenis: string;
  link: string;
}

interface ReferensiRow {
  referensi: string;
}

interface FormData {
  jenisSurat: string;
  nomorSurat: string;
  perihal: string;
  tujuan: string;
  unit: string;
  tanggal: string;
  pembuka: string;
  isi: string;
  penutup: string;
}

const romanMonths = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const SURAT_CODE_MAP: Record<string, string> = {
  'Surat Permohonan Akreditasi': 'AKRE',
  'Laporan Audit Internal': 'AUDIT',
  'Surat Tindak Lanjut Audit': 'TLA',
  'Berita Acara Visitasi': 'BAV'
};
const DRAFT_KEY = 'surat_laak_draft_v1';

const SuratLAAK = () => {
  // --- 1. STATE DATA ---
  const [formData, setFormData] = useState<FormData>({
    jenisSurat: 'Surat Permohonan Akreditasi',
    nomorSurat: '',
    perihal: '',
    tujuan: '',
    unit: '',
    tanggal: '',
    pembuka: '',
    isi: '',
    penutup: ''
  });

  const [kriteriaList, setKriteriaList] = useState<KriteriaRow[]>([
    { kriteria: 'Kriteria 1', standar: 'Standar 1', deskripsi: 'Dokumentasi & bukti pendukung', nilai: 'Baik' },
    { kriteria: 'Kriteria 2', standar: 'Standar 2', deskripsi: 'Hasil evaluasi capaian', nilai: 'Cukup' },
  ]);

  const [lampiranList, setLampiranList] = useState<LampiranRow[]>([
    { nama: 'Daftar APT', jenis: 'APT', link: '' },
    { nama: 'Daftar APM', jenis: 'APM', link: '' },
  ]);

  const [referensiList, setReferensiList] = useState<ReferensiRow[]>([
    { referensi: 'Pedoman BAN-PT' },
    { referensi: 'Instruksi Dekan' },
  ]);

  // --- 2. STATE UI & SYSTEM ---
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingFormat, setLoadingFormat] = useState<'pdf' | 'docx' | 'preview' | null>(null);
  
  // Chart toggle (UI Only)
  const [showChart, setShowChart] = useState(false);

  // Draft States
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- 3. EFFECT: LOAD DRAFT ---
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.kriteriaList) setKriteriaList(parsed.kriteriaList);
        if (parsed.lampiranList) setLampiranList(parsed.lampiranList);
        if (parsed.referensiList) setReferensiList(parsed.referensiList);
        
        setIsDraftLoaded(true);
        setTimeout(() => setIsDraftLoaded(false), 3000);
      } catch (e) {
        console.error('Gagal load draft', e);
      }
    } else {
        // Init tanggal default jika tidak ada draft
        const d = new Date();
        // Format YYYY-MM-DD untuk input date HTML
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setFormData(prev => ({ ...prev, tanggal: `${yyyy}-${mm}-${dd}` }));
    }
    setIsSystemReady(true);
  }, []);

  // --- 4. EFFECT: AUTO-SAVE ---
  useEffect(() => {
    if (!isSystemReady) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const objectToSave = { formData, kriteriaList, lampiranList, referensiList };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, kriteriaList, lampiranList, referensiList, isSystemReady]);


  // --- 5. HANDLERS ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKriteriaChange = (index: number, field: keyof KriteriaRow, value: string) => {
    setKriteriaList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleLampiranChange = (index: number, field: keyof LampiranRow, value: string) => {
    setLampiranList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleReferensiChange = (index: number, field: keyof ReferensiRow, value: string) => {
    setReferensiList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addKriteria = () => setKriteriaList(prev => [...prev, { kriteria: '', standar: '', deskripsi: '', nilai: '' }]);
  const removeKriteria = (index: number) => setKriteriaList(prev => prev.filter((_, i) => i !== index));

  const addLampiran = () => setLampiranList(prev => [...prev, { nama: '', jenis: '', link: '' }]);
  const removeLampiran = (index: number) => setLampiranList(prev => prev.filter((_, i) => i !== index));

  const addReferensi = () => setReferensiList(prev => [...prev, { referensi: '' }]);
  const removeReferensi = (index: number) => setReferensiList(prev => prev.filter((_, i) => i !== index));

  const generateNumber = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/surat-laak/generate-nomor');
      if (!response.ok) {
        throw new Error('Gagal mengambil nomor dari server');
      }
      const data = await response.json();
      const urut = data.nomor; // String "001", "002", etc.

      const univ = (formData.unit || 'UNIV').split(' ').map(s => s.toUpperCase()).slice(0, 1).join('');
      const fak = 'FIF';
      const now = new Date();
      const m = romanMonths[now.getMonth()];
      const y = now.getFullYear();
      const code = SURAT_CODE_MAP[formData.jenisSurat];
      
      const nomor = `${urut}/${univ}/${fak}/LAAK/${code}/${m}/${y}`;
      setFormData(prev => ({ ...prev, nomorSurat: nomor }));
    } catch (error) {
      console.error('Generate Number Error:', error);
      alert('Gagal generate nomor surat otomatis.');
    }
  };

  // --- 6. API ACTIONS (CONNECT KE BACKEND) ---

  const constructPayload = () => {
    // Format tanggal ke Indo untuk dikirim ke backend (opsional, tergantung backend)
    // Di sini kita kirim raw string saja, biar backend/template yang format
    return {
        ...formData,
        kriteriaList,
        lampiranList,
        referensiList
    };
  };

  const handlePreview = async () => {
    try {
      setLoadingFormat('preview');
      const payload = constructPayload();

      // Panggil API Preview Backend
      const response = await fetch('http://localhost:4000/api/surat-laak/preview', {
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

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      setLoadingFormat(format);
      const payload = constructPayload();

      // Panggil API Create Backend
      const response = await fetch(`http://localhost:4000/api/surat-laak/create?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Gagal export file.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const cleanUnit = (formData.unit || 'LAAK').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `LAAK_${cleanUnit}_${Date.now()}.${format}`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Hapus Draft setelah sukses export (Opsional, style Modul 4)
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

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Surat LAAK (Akreditasi & Audit)</h1>
            <div className="flex items-center gap-3 mt-2">
                <p className="text-[#8C7A6B] text-lg">Dokumen standar BAN-PT/LAM.</p>
                {/* Indikator Status */}
                {isDraftLoaded && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold">✨ Draft Load</span>}
                {saveStatus === 'saving' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">⏳ Menyimpan...</span>}
                {saveStatus === 'saved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✅ Tersimpan</span>}
            </div>
          </div>

          <div className="flex gap-3">
             {/* Tombol Preview Real */}
             <button
              onClick={handlePreview}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-white border border-[#B28D35] text-[#B28D35] font-semibold rounded-lg hover:bg-[#FDFBF7] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loadingFormat === 'preview' ? 'Loading...' : 'Preview'}
            </button>

            {/* Tombol Export PDF Real */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loadingFormat === 'pdf' ? 'Processing...' : 'Export PDF'}
            </button>

            {/* Tombol Export DOCX Real */}
            <button
              onClick={() => handleExport('docx')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#B28D35] text-white font-semibold rounded-lg hover:bg-[#96762B] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loadingFormat === 'docx' ? 'Processing...' : 'Export DOCX'}
            </button>
          </div>
        </div>

        {/* CARD WRAPPER */}
        <div className="w-full bg-white rounded-2xl shadow-xl shadow-[#B28D35]/5 border border-[#F2EFE9] overflow-hidden">
          <div className="p-8 md:p-12">

            {/* Informasi Dasar */}
            <h2 className="text-xl font-bold text-[#2D241E] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Informasi Dasar
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Jenis Surat</label>
                <select
                  name="jenisSurat"
                  value={formData.jenisSurat}
                  onChange={handleChange}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none bg-[#FDFBF7]/50 transition-all cursor-pointer"
                >
                  <option>Surat Permohonan Akreditasi</option>
                  <option>Laporan Audit Internal</option>
                  <option>Surat Tindak Lanjut Audit</option>
                  <option>Berita Acara Visitasi</option>
                </select>
                {/* Note: Tidak ada custom template karena backend hardcoded */}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Nomor Dokumen</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="nomorSurat"
                    value={formData.nomorSurat}
                    onChange={handleChange}
                    placeholder="Auto-generate atau input manual"
                    className="flex-1 border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={generateNumber}
                    className="px-4 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-[#8C7A6B] mt-2">Format: XXX/UNIV/FAK/LAAK/JENIS/MM/YYYY (otomatis)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Perihal</label>
                <input
                  type="text"
                  name="perihal"
                  value={formData.perihal}
                  onChange={handleChange}
                  placeholder="Permohonan akreditasi program studi ..."
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tujuan</label>
                <input
                  type="text"
                  name="tujuan"
                  value={formData.tujuan}
                  onChange={handleChange}
                  placeholder="Seluruh Pimpinan Perguruan Tinggi ..."
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Unit / Program Studi</label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="Fakultas Informatika / Prodi Teknik Informatika"
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none transition-all"
                />
              </div>
            </div>

            {/* Struktur Data Akreditasi (Kriteria) */}
            <div className="h-px bg-[#F2EFE9] mb-10"></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D241E] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                Struktur Data Akreditasi
              </h2>
              <button
                onClick={addKriteria}
                className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
              >
                + Tambah Kriteria
              </button>
            </div>

            <div className="overflow-x-auto border border-[#F2EFE9] rounded-xl mb-8">
              <table className="min-w-full text-left">
                <thead className="bg-[#FDFBF7]">
                  <tr>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Kriteria</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Standar</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Deskripsi</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Nilai</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54] w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {kriteriaList.map((row, idx) => (
                    <tr key={idx} className="border-t border-[#F2EFE9]">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.kriteria}
                          onChange={e => handleKriteriaChange(idx, 'kriteria', e.target.value)}
                          placeholder="Kriteria (mis. 1, 2, ...)"
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.standar}
                          onChange={e => handleKriteriaChange(idx, 'standar', e.target.value)}
                          placeholder="Standar (mis. Standar 1)"
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.deskripsi}
                          onChange={e => handleKriteriaChange(idx, 'deskripsi', e.target.value)}
                          placeholder="Deskripsi singkat"
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={row.nilai}
                          onChange={e => handleKriteriaChange(idx, 'nilai', e.target.value)}
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        >
                          <option value="">Pilih Nilai</option>
                          {NILAI_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeKriteria(idx)}
                          className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grafik Data Akreditasi */}
            <div className="flex items-center justify-between mb-4 mt-6">
              <h2 className="text-xl font-bold text-[#2D241E] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                Grafik Data Akreditasi
              </h2>
              <button
                onClick={() => setShowChart(prev => !prev)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border ${showChart ? 'bg-[#B28D35] text-white border-[#B28D35] hover:bg-[#96762B]' : 'bg-white text-[#6B5E54] border-[#E5DED5] hover:bg-[#F9F7F4]'}`}
                aria-pressed={showChart}
                title={showChart ? 'Tutup Grafik' : 'Tampilkan Grafik'}
              >
                {showChart ? 'Tutup Grafik' : 'Tampilkan Grafik'}
              </button>
            </div>

            {showChart && (
              <div className="mt-4 bg-[#FDFBF7] rounded-xl border border-[#F2EFE9] p-6">
                <p className="text-sm text-[#8C7A6B]">
                  Grafik Data Akreditasi berdasarkan input Kriteria dan Nilai.
                </p>
                <div className="mt-3 flex items-end gap-4">
                  {kriteriaList.map((row, i) => {
                    const v = NILAI_MAP[row.nilai] ?? 0;
                    const indexLabel = `${row.kriteria} (${row.nilai})`;

                    return (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-8 bg-[#B28D35]/70 rounded-t-md"
                          style={{ height: `${v * 1.5}px` }}
                        />
                        <span className="text-xs text-[#6B5E54] mt-1">{indexLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="h-px bg-[#F2EFE9] my-10"></div>

            {/* Lampiran */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D241E] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                Lampiran (APT, APM, dll.)
              </h2>
              <button
                onClick={addLampiran}
                className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
              >
                + Tambah Lampiran
              </button>
            </div>

            <div className="overflow-x-auto border border-[#F2EFE9] rounded-xl mb-8">
              <table className="min-w-full text-left">
                <thead className="bg-[#FDFBF7]">
                  <tr>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Nama Lampiran</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Jenis</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Link</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54] w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {lampiranList.map((row, idx) => (
                    <tr key={idx} className="border-t border-[#F2EFE9]">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.nama}
                          onChange={e => handleLampiranChange(idx, 'nama', e.target.value)}
                          placeholder="Nama Lampiran"
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.jenis}
                          onChange={e => handleLampiranChange(idx, 'jenis', e.target.value)}
                          placeholder="Jenis (APT/APM/...)"
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.link}
                          onChange={e => handleLampiranChange(idx, 'link', e.target.value)}
                          placeholder="Link / nama file"
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeLampiran(idx)}
                          className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-px bg-[#F2EFE9] my-10"></div>

            {/* Referensi Dokumen Pendukung */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D241E] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                Referensi Dokumen Pendukung
              </h2>
              <button
                onClick={addReferensi}
                className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
              >
                + Tambah Referensi
              </button>
            </div>
            <div className="overflow-x-auto border border-[#F2EFE9] rounded-xl mb-8">
              <table className="min-w-full text-left">
                <thead className="bg-[#FDFBF7]">
                  <tr>
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Referensi</th>
                    <th className="px-4 py-3 text-sm text-[#6B5E54] w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {referensiList.map((row, idx) => (
                    <tr key={idx} className="border-t border-[#F2EFE9]">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.referensi}
                          onChange={e => handleReferensiChange(idx, 'referensi', e.target.value)}
                          placeholder="Contoh: Pedoman BAN-PT, Instruksi Dekan, dsb."
                          className="w-full border border-transparent focus:border-[#B28D35] rounded-md p-2 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeReferensi(idx)}
                          className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Konten Surat */}
            <div className="h-px bg-[#F2EFE9] my-10"></div>
            <h2 className="text-xl font-bold text-[#2D241E] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
              Konten Surat
            </h2>

            <div className="grid grid-cols-1 gap-8">
              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Paragraf Pembuka</label>
                <textarea
                  name="pembuka"
                  value={formData.pembuka}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Dengan hormat, sehubungan dengan..."
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Detail / Ringkasan Audit / Tujuan Pengajuan</label>
                <textarea
                  name="isi"
                  value={formData.isi}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Adapun tujuan pengajuan akreditasi ini adalah untuk..."
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Paragraf Penutup</label>
                <textarea
                  name="penutup"
                  value={formData.penutup}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Demikian surat permohonan ini kami sampaikan..."
                  className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
                ></textarea>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Preview Modal (PDF Iframe) */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Preview Dokumen (Watermarked)</h3>
              <button onClick={closePreview} className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">&times;</button>
            </div>
            <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
               {/* Ini Iframe PDF, bukan HTML manual lagi */}
              <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
               <button onClick={closePreview} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold">Tutup</button>
               <button onClick={() => { closePreview(); handleExport('docx'); }} className="px-6 py-2.5 bg-[#2D241E] text-white font-bold rounded-xl hover:bg-black">Download DOCX</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratLAAK;
const NILAI_OPTIONS = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Tidak Memenuhi'];
const NILAI_MAP: Record<string, number> = {
  'Sangat Baik': 100,
  'Baik': 75,
  'Cukup': 50,
  'Kurang': 25,
  'Tidak Memenuhi': 5,
};
