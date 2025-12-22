import { useState, useEffect, type ChangeEvent } from 'react';
import api from '../services/api';

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

type ExportFormat = 'pdf' | 'docx';

interface Template {
  template_id: number;
  template_name: string;
  template_type: string;
  file_path: string;
}

const romanMonths = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const pad = (n: number, len = 3) => String(n).padStart(len, '0');

const SuratLAAK = () => {
  // Form state
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

  // Dynamic rows
  const [kriteriaList, setKriteriaList] = useState<KriteriaRow[]>([
    { kriteria: 'Kriteria 1', standar: 'Standar 1', deskripsi: 'Dokumentasi & bukti pendukung' },
    { kriteria: 'Kriteria 2', standar: 'Standar 2', deskripsi: 'Hasil evaluasi capaian' },
  ]);

  const [lampiranList, setLampiranList] = useState<LampiranRow[]>([
    { nama: 'Daftar APT', jenis: 'APT', link: '' },
    { nama: 'Daftar APM', jenis: 'APM', link: '' },
  ]);

  // Preview & Export states
  const [showPreview, setShowPreview] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);

  // Chart placeholder
  const [showChart, setShowChart] = useState(false);

  // State untuk template kustom
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch templates kustom untuk surat LAAK
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/dashboard/templates/by-type/surat_laak');
        setTemplates(response.data.templates || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Handlers
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

  const addKriteria = () => {
    setKriteriaList(prev => [...prev, { kriteria: '', standar: '', deskripsi: '' }]);
  };
  const removeKriteria = (index: number) => {
    setKriteriaList(prev => prev.filter((_, i) => i !== index));
  };

  const addLampiran = () => {
    setLampiranList(prev => [...prev, { nama: '', jenis: '', link: '' }]);
  };
  const removeLampiran = (index: number) => {
    setLampiranList(prev => prev.filter((_, i) => i !== index));
  };

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

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);
  const saveDraft = () => alert('Draft disimpan (placeholder)');
  const renderChart = () => setShowChart(true);

  // Export placeholder (sesuaikan endpoint bila backend LAAK tersedia)
  const handleExport = async (format: ExportFormat) => {
    try {
      setLoadingFormat(format);
      // TODO: arahkan ke endpoint backend jika sudah tersedia
      // contoh: const endpoint = `http://localhost:4000/api/surat-laak/create?format=${format}`;
      // untuk saat ini, placeholder:
      await new Promise(res => setTimeout(res, 1000));
      alert(`Export ${format.toUpperCase()} (placeholder)`);
    } catch (e: any) {
      alert(`Gagal: ${e?.message || 'Terjadi kesalahan'}`);
    } finally {
      setLoadingFormat(null);
    }
  };

  // init tanggal default
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useState(() => {
    const d = new Date();
    setFormData(prev => ({ ...prev, tanggal: d.toLocaleDateString('id-ID') }));
    return null;
  });

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-[#4A3F35]">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2D241E] tracking-tight">Buat Surat LAAK (Akreditasi & Audit)</h1>
            <p className="text-[#8C7A6B] mt-2 text-lg">Isi form untuk membuat dokumen akreditasi sesuai standar BAN-PT/LAM.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveDraft}
              className="px-5 py-2.5 bg-white border border-[#E5DED5] text-[#8C7A6B] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
            >
              Simpan Draft
            </button>

            <button
              onClick={() => handleExport('pdf')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loadingFormat === 'pdf' ? <span className="animate-pulse">Processing...</span> : 'Export PDF'}
            </button>

            <button
              onClick={() => handleExport('docx')}
              disabled={loadingFormat !== null}
              className="px-5 py-2.5 bg-[#B28D35] text-white font-semibold rounded-lg hover:bg-[#96762B] transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loadingFormat === 'docx' ? <span className="animate-pulse">Processing...</span> : 'Export DOCX'}
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
                  disabled={loadingTemplates}
                >
                  <option>Surat Permohonan Akreditasi</option>
                  <option>Laporan Audit Internal</option>
                  <option>Surat Tindak Lanjut Audit</option>
                  <option>Berita Acara Visitasi</option>
                  
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
                {loadingTemplates && (
                  <p className="text-xs text-[#8C7A6B] mt-1">Memuat template...</p>
                )}
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
                  placeholder="DD/MM/YYYY"
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
                <button
                  onClick={renderChart}
                  className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                >
                  Generate Sekarang
                </button>
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

              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-widest">
                  Numbering system: gunakan format BAN-PT / internal LAAK
                </p>
                <button
                  onClick={openPreview}
                  className="px-5 py-2.5 bg-[#4A3F35] text-white font-semibold rounded-lg hover:bg-[#2D241E] transition-all shadow-sm"
                >
                  Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50" onClick={closePreview}>
          <div className="w-full max-w-4xl max-h-[85vh] overflow-auto bg-white rounded-2xl p-6 border border-[#F2EFE9]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <strong className="text-[#2D241E]">Preview Dokumen</strong>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                  onClick={closePreview}
                >
                  Tutup
                </button>
                <button
                  className="px-3 py-2 bg-white border border-[#E5DED5] text-[#6B5E54] font-semibold rounded-lg hover:bg-[#F9F7F4] transition-all shadow-sm"
                  onClick={() => window.print()}
                >
                  Cetak
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2EFE9]">
              <h2 className="text-xl font-bold mb-1">{formData.jenisSurat}</h2>
              <p className="text-sm text-[#8C7A6B] mb-3">
                Nomor: {formData.nomorSurat || '(nomor belum diisi)'} &nbsp;|&nbsp; Unit: {formData.unit || '-'} &nbsp;|&nbsp; Perihal: {formData.perihal || '-'}
              </p>

              <div className="space-y-4 text-[#4A3F35]">
                <p>
                  <strong>Paragraf Pembuka</strong><br />
                  {formData.pembuka || '-'}
                </p>
                <p>
                  <strong>Isi</strong><br />
                  {formData.isi || '-'}
                </p>
                <p>
                  <strong>Penutup</strong><br />
                  {formData.penutup || '-'}
                </p>

                {kriteriaList.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Kriteria & Standar</h4>
                    <ul className="list-disc pl-6">
                      {kriteriaList.map((r, i) => (
                        <li key={i}>
                          <strong>{r.kriteria} / {r.standar}</strong> — {r.deskripsi}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lampiranList.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Lampiran</h4>
                    <ol className="list-decimal pl-6">
                      {lampiranList.map((l, i) => (
                        <li key={i}>
                          {l.nama} ({l.jenis}) {l.link ? `- ${l.link}` : ''}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {showChart && (
                  <div>
                    <h4 className="font-semibold">Grafik Capaian (otomatis)</h4>
                    <p className="text-sm text-[#8C7A6B]">Tampilan chart placeholder akan sesuai saat integrasi Chart.js.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratLAAK;