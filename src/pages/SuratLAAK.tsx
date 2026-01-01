import { useState, useEffect, type ChangeEvent } from 'react';

// --- Interfaces ---
interface KriteriaRow {
  kriteria: string;
  standar: string;
  deskripsi: string;
}

interface LampiranRow {
  nama: string;
  jenis: string;
  link: string;
}

interface FormData {
  jenisSurat: string;
  nomorSurat: string;
  perihal: string;
  unit: string;
  tanggal: string;
  referensi: string;
  pembuka: string;
  isi: string;
  penutup: string;
}

const romanMonths = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const pad = (n: number, len = 3) => String(n).padStart(len, '0');

// Key LocalStorage untuk Draft
const DRAFT_KEY = 'surat_laak_draft_v1';

const SuratLAAK = () => {
  // --- 1. STATE DATA ---
  const [formData, setFormData] = useState<FormData>({
    jenisSurat: 'Surat Permohonan Akreditasi',
    nomorSurat: '',
    perihal: '',
    unit: '',
    tanggal: '',
    referensi: '',
    pembuka: '',
    isi: '',
    penutup: ''
  });

  const [kriteriaList, setKriteriaList] = useState<KriteriaRow[]>([
    { kriteria: 'Kriteria 1', standar: 'Standar 1', deskripsi: 'Dokumentasi & bukti pendukung' },
    { kriteria: 'Kriteria 2', standar: 'Standar 2', deskripsi: 'Hasil evaluasi capaian' },
  ]);

  const [lampiranList, setLampiranList] = useState<LampiranRow[]>([
    { nama: 'Daftar APT', jenis: 'APT', link: '' },
    { nama: 'Daftar APM', jenis: 'APM', link: '' },
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
      const objectToSave = { formData, kriteriaList, lampiranList };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave));
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, kriteriaList, lampiranList, isSystemReady]);


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

  const addKriteria = () => setKriteriaList(prev => [...prev, { kriteria: '', standar: '', deskripsi: '' }]);
  const removeKriteria = (index: number) => setKriteriaList(prev => prev.filter((_, i) => i !== index));

  const addLampiran = () => setLampiranList(prev => [...prev, { nama: '', jenis: '', link: '' }]);
  const removeLampiran = (index: number) => setLampiranList(prev => prev.filter((_, i) => i !== index));

  const generateNumber = () => {
    const urut = Math.floor(Date.now() % 10000);
    const univ = (formData.unit || 'UNIV').split(' ').map(s => s.toUpperCase()).slice(0, 1).join('');
    const fak = 'FI';
    const now = new Date();
    const m = romanMonths[now.getMonth()];
    const y = now.getFullYear();
    const nomor = `${pad(urut, 3)}/${univ}/${fak}/LAAK/AKRE/${m}/${y}`;
    setFormData(prev => ({ ...prev, nomorSurat: nomor }));
  };

  // --- 6. API ACTIONS (CONNECT KE BACKEND) ---

  const constructPayload = () => {
    // Format tanggal ke Indo untuk dikirim ke backend (opsional, tergantung backend)
    // Di sini kita kirim raw string saja, biar backend/template yang format
    return {
        ...formData,
        kriteriaList,
        lampiranList
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
                <p className="text-xs text-[#8C7A6B] mt-2">Format: XXX/UNIV/FAK/LAAK/AKRE/MM/YYYY (otomatis)</p>
              </div>

              <div className="md:col-span-2">
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
                    <th className="px-4 py-3 text-sm text-[#6B5E54]">Aksi Upload / Link</th>
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

            {/* Grafik & Referensi */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#2D241E] flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#B28D35] rounded-full"></span>
                  Grafik & Referensi
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-[#6B5E54]">Generate Grafik</label>
                <input type="checkbox" checked={showChart} onChange={e => setShowChart(e.target.checked)} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#6B5E54] mb-2">Referensi Dokumen Pendukung</label>
              <textarea
                name="referensi"
                value={formData.referensi}
                onChange={handleChange}
                rows={3}
                placeholder="Contoh: Pedoman BAN-PT, Instruksi Dekan, dsb."
                className="w-full border border-[#E5DED5] rounded-xl p-3.5 focus:ring-4 focus:ring-[#B28D35]/10 focus:border-[#B28D35] outline-none resize-none transition-all"
              ></textarea>
            </div>

            {showChart && (
              <div className="mt-4 bg-[#FDFBF7] rounded-xl border border-[#F2EFE9] p-6">
                <p className="text-sm text-[#8C7A6B]">
                  Grafik Capaian (placeholder). Integrasi Chart.js dapat ditambahkan jika diperlukan.
                </p>
                <div className="mt-3 grid grid-cols-4 gap-3 items-end">
                  {[30, 55, 75, 40].map((v, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-[#B28D35]/70 rounded-t-md"
                        style={{ height: `${v * 1.5}px` }}
                        title={`Kriteria ${i + 1}: ${v}%`}
                      />
                      <span className="text-xs text-[#6B5E54] mt-1">K{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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