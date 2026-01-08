"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, FileText, Download, Eye, X } from "lucide-react"
import { colors } from "../design-system"
import api from "../services/api"

interface FormData {
  nim: string
  namaMahasiswa: string
  programStudi: string
  tahunAkademik: string
  jenisSurat: string
  keterangan: string
  nomorRegistrasi: string
}

interface Template {
  template_id: number
  template_name: string
  template_type: string
  file_path: string
}

export default function SuratKeterangan() {
  const [formData, setFormData] = useState<FormData>({
    nim: "",
    namaMahasiswa: "",
    programStudi: "",
    tahunAkademik: "",
    jenisSurat: "",
    keterangan: "",
    nomorRegistrasi: "",
  })

  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [statusMahasiswa, setStatusMahasiswa] = useState("")
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [existingFile, setExistingFile] = useState<string | null>(null)
  const [hasMahasiswaData, setHasMahasiswaData] = useState(false)
  const [showSearchHint, setShowSearchHint] = useState(false)

  // State untuk template kustom
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // KEY UNTUK LOCAL STORAGE
  const DRAFT_KEY = 'surat_keterangan_draft_v1';

  // State Penanda Draft
  const [isDraftLoaded, setIsDraftLoaded] = useState(false); // Notifikasi "Draft Dipulihkan"
  const [isSystemReady, setIsSystemReady] = useState(false); // Penanda siap auto-save
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // --- 1. LOGIC LOAD DRAFT (Saat Halaman Dibuka) ---
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.formData) {
           setFormData((prev) => ({
             ...prev,
             ...parsed.formData
           }));
        }

        setIsDraftLoaded(true);
        setTimeout(() => setIsDraftLoaded(false), 3000);
      } catch (e) {
        console.error('Gagal load draft lokal', e);
      }
    }
    // Tandai sistem siap
    setIsSystemReady(true);
  }, []);

  // --- 2. LOGIC AUTO-SAVE + NOTIFIKASI ---
  useEffect(() => {
    if (!isSystemReady) return;

    // 1. Ubah status jadi "Menyimpan..." saat ada perubahan
    setSaveStatus('saving');

    // 2. Gunakan Timer (Debounce) agar tidak spam simpan setiap ketik satu huruf
    const timer = setTimeout(() => {
      const objectToSave = { formData };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave));

      // 3. Ubah status jadi "Tersimpan"
      setSaveStatus('saved');
    }, 1000); // Delay 1 detik setelah user berhenti mengetik

    return () => clearTimeout(timer);
  }, [formData, isSystemReady]);

  // Fetch templates kustom untuk surat keterangan
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true)
      try {
        const response = await api.get('/dashboard/templates/by-type/surat_keterangan')
        setTemplates(response.data.templates || [])
      } catch (err) {
        console.error('Error fetching templates:', err)
      } finally {
        setLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePreview = async () => {
    try {
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let currentUserName = ""
      let currentUserRole = ""
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw)
          currentUserName = u.fullName || u.username || ""
          currentUserRole = u.role || ""
        } catch {}
      }
      const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
      const formatDateID = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

      const payload = {
        nomor_surat: formData.nomorRegistrasi,
        nim: formData.nim,
        jenis_surat: formData.jenisSurat,
        keperluan: formData.keterangan,
        kota: "Bandung",
        tanggal: formatDateID(new Date()),
        nama_user: currentUserName,
        role: currentUserRole,
      }

      const response = await api.post('/surat-keterangan/preview', payload, {
        responseType: 'blob',
      })
      
      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
      setShowPreviewModal(true)
    } catch (err: any) {
      alert(err?.message ? String(err.message) : 'Gagal membuat preview')
    }
  }

  const handleSearch = async () => {
    setLoadingSearch(true)
    setSearchMessage(null)
    setShowSearchHint(false)
    try {
      if (!formData.nim.trim()) {
        setSearchMessage('Masukkan NIM terlebih dahulu')
        setHasMahasiswaData(false)
        setLoadingSearch(false)
        return
      }
      const res = await api.get("/surat-keterangan/mahasiswa", { params: { nim: formData.nim } })
      const data = res.data

      let nextNomor = ""
      try {
        const resNum = await api.get("/surat-keterangan/next-number")
        if (resNum.status === 200 && resNum.data && resNum.data.nextNumber) {
          nextNomor = resNum.data.nextNumber
        }
      } catch (err) {
        console.error("Error fetching next number:", err)
      }

      setFormData((prev) => ({
        ...prev,
        namaMahasiswa: data.namaMahasiswa || prev.namaMahasiswa,
        programStudi: data.programStudi || prev.programStudi,
        tahunAkademik: data.tahunAkademik || prev.tahunAkademik,
        nomorRegistrasi: nextNomor || prev.nomorRegistrasi,
      }))
      setStatusMahasiswa(data.status || statusMahasiswa)
      setSearchMessage('Data mahasiswa berhasil ditemukan.')
      setHasMahasiswaData(true)
      setShowSearchHint(false)
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message
      if (status === 404) {
        setSearchMessage(msg || 'Data mahasiswa tidak ditemukan')
      } else if (status === 400) {
        setSearchMessage(msg || 'Masukkan NIM terlebih dahulu')
      } else if (status === 500) {
        setSearchMessage(msg || 'Kesalahan server')
      } else {
        setSearchMessage('Terjadi kesalahan jaringan')
      }
      setHasMahasiswaData(false)
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleGenerate = () => {
    if (!hasMahasiswaData) {
      setShowSearchHint(true)
      return
    }
    setShowSuccessPopup(true)
  }

  const handleExport = (format: "docx" | "pdf") => {
    if (format === "docx") {
      const formatDateID = (d: Date) => {
        const months = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      }
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let currentUserName = ""
      let currentUserRole = ""
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw)
          currentUserName = u.fullName || u.username || ""
          currentUserRole = u.role || ""
        } catch {}
      }
  
      const payload = {
        nomor_surat: formData.nomorRegistrasi,
        nama: formData.namaMahasiswa,
        nim: formData.nim,
        program_studi: formData.programStudi,
        tahun_akademik: formData.tahunAkademik,
        status: statusMahasiswa,
        keperluan: formData.keterangan,
        kota: "Bandung",
        tanggal: formatDateID(new Date()),
        nama_user: currentUserName,
        role: currentUserRole,
        jenis_surat: formData.jenisSurat,
      }

      api.post("/surat-keterangan/generate", payload)
        .then(async (res) => {
          const data: any = res.data || {}
          const fileName = data.file
          
          if (fileName) {
            try {
              const fileResponse = await api.get(`/surat-keterangan/files/${encodeURIComponent(fileName)}`, {
                responseType: 'blob'
              })
              const url = window.URL.createObjectURL(fileResponse.data)
              const a = document.createElement("a")
              a.href = url
              a.download = fileName
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)
            } catch (e) {
              console.error("Gagal download file", e)
              throw new Error("Gagal mengunduh file yang telah digenerate")
            }
          }
          
          setShowSuccessPopup(false)
        })
        .catch((err) => {
          const status = err?.response?.status
          const data = err?.response?.data || {}
          const msg = (data && data.message) ? String(data.message) : (status ? 'Gagal membuat dokumen' : 'Terjadi kesalahan jaringan')
          setExistingFile(data && data.file ? String(data.file) : null)
          setShowSuccessPopup(false)
          setErrorMessage(msg)
          setShowErrorPopup(true)
        })
    } else {
      const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
      const formatDateID = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let currentUserName = ""
      let currentUserRole = ""
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw)
          currentUserName = u.fullName || u.username || ""
          currentUserRole = u.role || ""
        } catch {}
      }
      const payload = {
        nomor_surat: formData.nomorRegistrasi,
        nim: formData.nim,
        jenis_surat: formData.jenisSurat,
        keperluan: formData.keterangan,
        kota: "Bandung",
        tanggal: formatDateID(new Date()),
        nama_user: currentUserName,
        role: currentUserRole,
      }
      api.post(`/surat-keterangan/create?format=pdf`, payload, {
        responseType: 'blob'
      })
        .then(async (response) => {
          const blob = response.data
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `Surat_Keterangan_${Date.now()}.pdf`
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
          
          setShowSuccessPopup(false)
        })
        .catch((err: any) => {
          alert(err?.message ? String(err.message) : 'Gagal export PDF')
          setShowSuccessPopup(false)
        })
    }
  }

  // --- HANDLE HAPUS DRAFT ---
  const handleDeleteDraft = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan form? Data draft akan dihapus.")) {
      localStorage.removeItem(DRAFT_KEY);
      setFormData({
        nim: "",
        namaMahasiswa: "",
        programStudi: "",
        tahunAkademik: "",
        jenisSurat: "",
        keterangan: "",
        nomorRegistrasi: "",
      });
      setStatusMahasiswa("");
      setHasMahasiswaData(false);
      setSaveStatus('idle');
      setSearchMessage(null);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: colors.neutral.white }}>
      <style>
        {`
        @keyframes sipena-check-bounce { 0% { transform: scale(0.8) } 50% { transform: scale(1.15) } 100% { transform: scale(1) } }
        @keyframes sipena-stroke { 0% { stroke-dashoffset: 50 } 100% { stroke-dashoffset: 0 } }
        .sipena-check-bounce { animation: sipena-check-bounce .5s ease-out; }
        .sipena-stroke { stroke-dasharray: 50; stroke-dashoffset: 50; animation: sipena-stroke .5s ease-out forwards .15s; }
        `}
      </style>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-6 md:pb-8 border-b-2" style={{ borderColor: colors.primary.main }}>
          <h1 className="text-3xl font-bold" style={{ color: colors.primary.main }}>
            Formulir Surat Keterangan
          </h1>
          <div className="flex items-center gap-3 mt-2">
             {/* Notifikasi Draft Dipulihkan */}
             {isDraftLoaded && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold shadow-sm border border-blue-200">✨ Draft lama dipulihkan</span>}

             {/* Indikator Status Simpan (Real-time) */}
             {saveStatus === 'saving' && (
               <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 transition-all">
                 <span className="animate-spin">⏳</span> Menyimpan...
               </span>
             )}
             {saveStatus === 'saved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 transition-all">✅ Draft Tersimpan</span>}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Data Mahasiswa Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: colors.primary.main }}>
              Data Mahasiswa
            </h2>

            {/* NIM Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">NIM (Nomor Induk Mahasiswa)</label>
              <div className="relative">
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Masukkan NIM"
                  style={
                    {
                      borderColor: colors.primary.light,
                      "--tw-ring-color": colors.primary.main,
                    } as React.CSSProperties
                  }
                />
                <button onClick={handleSearch} disabled={loadingSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              {searchMessage && (
                <p
                  style={{ color: searchMessage.toLowerCase().includes('berhasil') ? colors.semantic.success : colors.semantic.error }}
                  className="text-sm"
                >
                  {searchMessage}
                </p>
              )}
            </div>

            {hasMahasiswaData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nama Mahasiswa</label>
                  <input
                    type="text"
                    name="namaMahasiswa"
                    value={formData.namaMahasiswa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={
                      {
                        backgroundColor: colors.primary.light,
                        borderColor: colors.primary.light,
                        "--tw-ring-color": colors.primary.main,
                      } as React.CSSProperties
                    }
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                  <input
                    type="text"
                    name="programStudi"
                    value={formData.programStudi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={
                      {
                        backgroundColor: colors.primary.light,
                        borderColor: colors.primary.light,
                        "--tw-ring-color": colors.primary.main,
                      } as React.CSSProperties
                    }
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tahun Akademik</label>
                  <input
                    type="text"
                    name="tahunAkademik"
                    value={formData.tahunAkademik}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={
                      {
                        backgroundColor: colors.primary.light,
                        borderColor: colors.primary.light,
                        "--tw-ring-color": colors.primary.main,
                      } as React.CSSProperties
                    }
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status Mahasiswa</label>
                  <span
                    className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                    style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}
                  >
                    {statusMahasiswa}
                  </span>
                </div>
              </div>
            ) : (showSearchHint ? (
              <p className="text-sm" style={{ color: colors.semantic.error }}>Silakan cari NIM terlebih dahulu</p>
            ) : null)}
          </div>

          {/* Detail Surat Section */}
          <div className="space-y-6 pt-8" style={{ borderTop: `2px solid ${colors.primary.main}33` }}>
            <h2 className="text-xl font-semibold" style={{ color: colors.primary.main }}>
              Detail Surat
            </h2>

            {/* Jenis Surat Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Jenis Surat</label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-2 bg-white border rounded-lg text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2"
                  style={
                    {
                      borderColor: colors.primary.light,
                      "--tw-ring-color": colors.primary.main,
                    } as React.CSSProperties
                  }
                >
                  <span className={!formData.jenisSurat ? "text-gray-400" : "text-gray-900"}>
                    {formData.jenisSurat || "Pilih jenis surat"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {showDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10"
                    style={{ borderColor: colors.primary.light }}
                  >
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, jenisSurat: "Surat Keterangan Aktif Kuliah" }))
                        setShowDropdown(false)
                      }}
                    >
                      Surat Keterangan Aktif Kuliah
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, jenisSurat: "Surat Keterangan Lulus" }))
                        setShowDropdown(false)
                      }}
                    >
                      Surat Keterangan Lulus
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, jenisSurat: "Surat Keterangan Bebas Pinjaman" }))
                        setShowDropdown(false)
                      }}
                    >
                      Surat Keterangan Bebas Pinjaman
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, jenisSurat: "Surat Keterangan Kelakuan Baik" }))
                        setShowDropdown(false)
                      }}
                    >
                      Surat Keterangan Kelakuan Baik
                    </button>
                    
                    {/* Template Kustom dari Database */}
                    {templates.length > 0 && (
                      <>
                        <div className="border-t my-1" style={{ borderColor: colors.primary.light }}></div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Template Kustom
                        </div>
                        {templates.map((template) => (
                          <button
                            key={template.template_id}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, jenisSurat: `template_${template.template_id}` }))
                              setShowDropdown(false)
                            }}
                          >
                            {template.template_name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
                {loadingTemplates && (
                  <p className="text-xs text-gray-400 mt-1">Memuat template...</p>
                )}
              </div>
            </div>

            {/* Keterangan Surat */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Keterangan Surat</label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                placeholder="Masukkan keterangan surat..."
                style={
                  {
                    borderColor: colors.primary.light,
                    "--tw-ring-color": colors.primary.main,
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nomor Registrasi</label>
              <input
                type="text"
                name="nomorRegistrasi"
                value={formData.nomorRegistrasi}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-100 border-2 border-dashed rounded-lg focus:outline-none focus:ring-2"
                style={
                  {
                    borderColor: colors.primary.main,
                    "--tw-ring-color": colors.primary.main,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
          

          <div className="flex gap-4 pt-8 justify-end" style={{ borderTop: `2px solid ${colors.primary.main}33` }}>
            {/* Tombol Hapus Draft */}
            <button 
              onClick={handleDeleteDraft}
              className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-bold hover:bg-rose-200 transition-colors border border-rose-200"
            >
              🗑️ Kosongkan Form
            </button>
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-2 font-medium rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}
            >
              <Eye className="w-4 h-4" />
              Preview Dokumen
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2 text-white font-medium rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: colors.primary.main }}
            >
              <FileText className="w-4 h-4" />
              Generate Dokumen
            </button>
          </div>
        </div>
      </div>

      {showSuccessPopup && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: `${colors.neutral.black}33` }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
            {/* Close button */}
            <div className="flex justify-end">
              <button onClick={() => setShowSuccessPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success icon and message */}
            <div className="text-center space-y-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary.main}20` }}
              >
                <FileText
                  className="w-8 h-8"
                  style={{ color: colors.primary.main }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Pilih Format Dokumen</h3>
              <p className="text-gray-600 text-sm">Dokumen akan dibuat dan diunduh sesuai format yang dipilih</p>
            </div>

            {/* Export buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleExport("docx")}
                className="flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}
              >
                <FileText className="w-5 h-5" />
                Export DOCX
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.primary.main }}
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {showErrorPopup && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: `${colors.neutral.black}33` }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowErrorPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center space-y-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${colors.semantic.error}20` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.semantic.error }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Gagal Membuat Dokumen</h3>
              <p className="text-gray-600 text-sm">{errorMessage || 'Terjadi kesalahan'}</p>
            </div>
            <div className="flex justify-center gap-3">
              {existingFile && (
                <button
                  onClick={async () => {
                    try {
                      const fileResponse = await api.get(`/surat-keterangan/files/${encodeURIComponent(existingFile)}`, {
                        responseType: 'blob'
                      })
                      const url = window.URL.createObjectURL(fileResponse.data)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = existingFile
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      window.URL.revokeObjectURL(url)
                    } catch (e) {
                      console.error("Gagal download file", e)
                      alert("Gagal mengunduh file")
                    }
                  }}
                  className="px-6 py-3 font-medium rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}
                >
                  Unduh DOCX
                </button>
              )}
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.primary.main }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {showPreviewModal && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: `${colors.neutral.black}66` }}
        >
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Preview Dokumen</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  if (previewUrl) {
                    window.URL.revokeObjectURL(previewUrl)
                    setPreviewUrl(null)
                  }
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}