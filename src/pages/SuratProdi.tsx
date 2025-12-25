"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, FileText, Download, Eye, X, CheckCircle, Clock, AlertCircle, History, Send } from "lucide-react"
import { colors } from "../design-system"
import api from "../services/api"

interface FormData {
  nim: string
  namaMahasiswa: string
  programStudi: string
  tahunAkademik: string
  jenisSurat: string
  namaDosen: string
  nipDosen: string
  judulPenelitian: string
  keterangan: string
  nomorRegistrasi: string
}

interface Approval {
  approval_id: number
  approval_level: number
  status: 'pending' | 'approved' | 'rejected'
  approver_id: number
  approver_name?: string
  approver_role?: string
  comments: string | null
  approved_at: string | null
  digital_signature?: string | object | null
}

interface HistoryItem {
  log_id: number
  action: string
  actor_id: number
  actor_role: string
  comments: string | null
  created_at: string
  changes: Record<string, unknown> | null
}

export default function SuratProdi() {
  const [formData, setFormData] = useState<FormData>({
    nim: "",
    namaMahasiswa: "",
    programStudi: "",
    tahunAkademik: "",
    jenisSurat: "",
    namaDosen: "",
    nipDosen: "",
    judulPenelitian: "",
    keterangan: "",
    nomorRegistrasi: "",
  })

  const [showDropdown, setShowDropdown] = useState(false)
  const [statusMahasiswa, setStatusMahasiswa] = useState("")
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingDosen, setLoadingDosen] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)
  const [hasMahasiswaData, setHasMahasiswaData] = useState(false)
  
  // Status tracking
  const [docStatus, setDocStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected' | 'generated' | null>(null)
  const [docId, setDocId] = useState<number | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [approvalComments, setApprovalComments] = useState('')
  const [digitalSignature, setDigitalSignature] = useState('')
  const [currentUser, setCurrentUser] = useState<{ userId?: number; role?: string } | null>(null)
  
  // Preview & Export
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Draft auto-save
  const DRAFT_KEY = 'surat_prodi_draft_v1'
  const [isDraftLoaded, setIsDraftLoaded] = useState(false)
  const [isSystemReady, setIsSystemReady] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load current user info
  useEffect(() => {
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw) as { user_id?: number; userId?: number; role?: string }
        setCurrentUser({
          userId: u.user_id || u.userId,
          role: u.role,
        })
      } catch {
        // Ignore parse error
      }
    }
  }, [])

  // Load draft on mount (hanya formData, seperti SuratKeterangan)
  useEffect(() => {
    const savedData = localStorage.getItem(DRAFT_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.formData) {
          setFormData((prev) => ({ ...prev, ...parsed.formData }))
        }
        setIsDraftLoaded(true)
        setTimeout(() => setIsDraftLoaded(false), 3000)
      } catch (e) {
        console.error('Gagal load draft lokal', e)
      }
    }
    setIsSystemReady(true)
  }, [])

  // Auto-save draft (hanya formData, seperti SuratKeterangan)
  useEffect(() => {
    if (!isSystemReady) return
    setSaveStatus('saving')
    const timer = setTimeout(() => {
      const objectToSave = { formData }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(objectToSave))
      setSaveStatus('saved')
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, isSystemReady])

  // Load document data (approvals & history)
  const loadDocData = async (id: number) => {
    try {
      const [approvalRes, historyRes] = await Promise.all([
        api.get(`/surat-prodi/approval/${id}`),
        api.get(`/surat-prodi/history/${id}`),
      ])
      setApprovals(approvalRes.data.approvals || [])
      setHistory(historyRes.data.history || [])
    } catch (error) {
      console.error('Error loading doc data:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchMahasiswa = async () => {
    setLoadingSearch(true)
    setSearchMessage(null)
    try {
      if (!formData.nim.trim()) {
        setSearchMessage('Masukkan NIM terlebih dahulu')
        setHasMahasiswaData(false)
        setLoadingSearch(false)
        return
      }
      const res = await api.get("/surat-prodi/mahasiswa", { params: { nim: formData.nim } })
      const data = res.data

      let nextNomor = ""
      try {
        const resNum = await api.get("/surat-prodi/next-number", { params: { jenis_surat: formData.jenisSurat || 'surat rekomendasi mahasiswa' } })
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
    } catch (e: unknown) {
      const error = e as { response?: { status?: number; data?: { message?: string } } }
      const status = error?.response?.status
      const msg = error?.response?.data?.message
      if (status === 404) {
        setSearchMessage(msg || 'Data mahasiswa tidak ditemukan')
      } else {
        setSearchMessage('Terjadi kesalahan jaringan')
      }
      setHasMahasiswaData(false)
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleSearchDosen = async () => {
    if (!formData.nipDosen.trim()) {
      setSearchMessage('Masukkan NIP dosen terlebih dahulu')
      return
    }
    setLoadingDosen(true)
    try {
      const res = await api.get("/surat-prodi/dosen", { params: { nip: formData.nipDosen } })
      const data = res.data
      setFormData((prev) => ({
        ...prev,
        namaDosen: data.nama || prev.namaDosen,
      }))
      setSearchMessage('Data dosen berhasil ditemukan.')
    } catch (e: unknown) {
      const error = e as { response?: { status?: number; data?: { message?: string } } }
      const status = error?.response?.status
      const msg = error?.response?.data?.message
      if (status === 404) {
        setSearchMessage(msg || 'Data dosen tidak ditemukan')
      } else {
        setSearchMessage('Terjadi kesalahan jaringan')
      }
    } finally {
      setLoadingDosen(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.nim || !formData.jenisSurat) {
      setErrorMessage('NIM dan Jenis Surat harus diisi')
      setShowErrorPopup(true)
      return
    }
    
    try {
      // Jika belum ada docId, buat draft terlebih dahulu
      let currentDocId = docId
      if (!currentDocId) {
        const createRes = await api.post("/surat-prodi/create", formData)
        currentDocId = createRes.data.doc_id
        setDocId(currentDocId)
        setDocStatus('draft')
      }
      
      // Submit untuk approval
      if (!currentDocId) {
        setErrorMessage('Gagal membuat draft')
        setShowErrorPopup(true)
        return
      }
      await api.post("/surat-prodi/submit", { doc_id: currentDocId })
      setDocStatus('submitted')
      setSearchMessage('Surat berhasil disubmit untuk approval')
      await loadDocData(currentDocId)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      setErrorMessage(err?.response?.data?.message || 'Gagal submit surat')
      setShowErrorPopup(true)
    }
  }

  const handlePreview = async () => {
    try {
      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let currentUserName = ""
      let currentUserRole = ""
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw) as { fullName?: string; username?: string; role?: string }
          currentUserName = u.fullName || u.username || ""
          currentUserRole = u.role || ""
        } catch {
          // Ignore parse error - use default empty values
        }
      }
      const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
      const formatDateID = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

      const payload = {
        nomorSurat: formData.nomorRegistrasi,
        nim: formData.nim,
        jenis_surat: formData.jenisSurat,
        namaDosen: formData.namaDosen,
        nipDosen: formData.nipDosen,
        judulPenelitian: formData.judulPenelitian,
        keterangan: formData.keterangan,
        kota: "Bandung",
        tanggal: formatDateID(new Date()),
        nama_user: currentUserName,
        role: currentUserRole,
      }

      const response = await fetch('http://localhost:4000/api/surat-prodi/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Gagal memuat preview')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
      setShowPreviewModal(true)
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(error?.message ? String(error.message) : 'Gagal membuat preview')
    }
  }

  const handleExport = async (format: "docx" | "pdf") => {
    try {
      if (!docId && docStatus !== 'approved' && docStatus !== 'draft') {
        setErrorMessage('Surat harus dalam status approved atau draft untuk di-generate')
        setShowErrorPopup(true)
        return
      }

      const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
      let currentUserName = ""
      let currentUserRole = ""
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw) as { fullName?: string; username?: string; role?: string }
          currentUserName = u.fullName || u.username || ""
          currentUserRole = u.role || ""
        } catch {
          // Ignore parse error - use default empty values
        }
      }
      const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
      const formatDateID = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

      const payload = {
        doc_id: docId,
        nomorSurat: formData.nomorRegistrasi,
        nim: formData.nim,
        jenis_surat: formData.jenisSurat,
        namaDosen: formData.namaDosen,
        nipDosen: formData.nipDosen,
        judulPenelitian: formData.judulPenelitian,
        keterangan: formData.keterangan,
        kota: "Bandung",
        tanggal: formatDateID(new Date()),
        nama_user: currentUserName,
        role: currentUserRole,
      }

      const response = await fetch(`http://localhost:4000/api/surat-prodi/generate?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Gagal export dokumen')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Surat_Prodi_${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      // Hapus Draft & Reset Status Simpan
      localStorage.removeItem(DRAFT_KEY)
      setSaveStatus('idle')
      setShowSuccessPopup(false)
      setDocStatus('generated')
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(error?.message ? String(error.message) : 'Gagal export dokumen')
      setShowSuccessPopup(false)
    }
  }

  // Check if current user has pending approval
  const hasPendingApproval = () => {
    if (!currentUser?.userId || !approvals.length) return false
    return approvals.some(
      (a) => a.approver_id === currentUser.userId && a.status === 'pending'
    )
  }

  const handleApprove = async () => {
    if (!docId) return
    try {
      await api.post("/surat-prodi/approve", {
        doc_id: docId,
        comments: approvalComments,
        digital_signature: digitalSignature || `Signed by ${currentUser?.role || 'User'} at ${new Date().toISOString()}`,
      })
      setDocStatus('approved')
      setSearchMessage('Surat berhasil disetujui')
      setShowApproveRejectModal(false)
      setApprovalComments('')
      setDigitalSignature('')
      await loadDocData(docId)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      setErrorMessage(err?.response?.data?.message || 'Gagal approve surat')
      setShowErrorPopup(true)
    }
  }

  const handleReject = async () => {
    if (!docId) return
    try {
      await api.post("/surat-prodi/reject", {
        doc_id: docId,
        comments: approvalComments,
      })
      setDocStatus('rejected')
      setSearchMessage('Surat ditolak')
      setShowApproveRejectModal(false)
      setApprovalComments('')
      await loadDocData(docId)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      setErrorMessage(err?.response?.data?.message || 'Gagal reject surat')
      setShowErrorPopup(true)
    }
  }

  const openApproveRejectModal = (action: 'approve' | 'reject') => {
    setApprovalAction(action)
    setApprovalComments('')
    setDigitalSignature('')
    setShowApproveRejectModal(true)
  }

  const getStatusBadge = () => {
    if (!docStatus) return null
    const statusConfig = {
      draft: { color: colors.semantic.warning, icon: FileText, text: 'Draft' },
      submitted: { color: colors.semantic.info, icon: Clock, text: 'Menunggu Approval' },
      approved: { color: colors.semantic.success, icon: CheckCircle, text: 'Disetujui' },
      rejected: { color: colors.semantic.error, icon: AlertCircle, text: 'Ditolak' },
      generated: { color: colors.primary.main, icon: FileText, text: 'Telah Digenerate' },
    }
    const config = statusConfig[docStatus] || statusConfig.draft
    const Icon = config.icon
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
        <Icon className="w-4 h-4" />
        {config.text}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: colors.neutral.white }}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-6 md:pb-8 border-b-2" style={{ borderColor: colors.primary.main }}>
          <h1 className="text-3xl font-bold" style={{ color: colors.primary.main }}>
            Formulir Surat Program Studi
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {isDraftLoaded && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-bounce font-bold shadow-sm border border-blue-200">✨ Draft lama dipulihkan</span>}
            {saveStatus === 'saving' && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <span className="animate-spin">⏳</span> Menyimpan...
              </span>
            )}
            {saveStatus === 'saved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">✅ Draft Tersimpan</span>}
            {getStatusBadge()}
            {docId && (
              <>
                <button
                  onClick={() => { setShowHistoryModal(true); loadDocData(docId) }}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-gray-200"
                >
                  <History className="w-3 h-3" /> History
                </button>
                <button
                  onClick={() => { setShowApprovalModal(true); loadDocData(docId) }}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium flex items-center gap-1 hover:bg-gray-200"
                >
                  <CheckCircle className="w-3 h-3" /> Approval
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Data Mahasiswa Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: colors.primary.main }}>
              Data Mahasiswa
            </h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">NIM (Nomor Induk Mahasiswa)</label>
              <div className="relative">
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchMahasiswa()}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Masukkan NIM"
                  style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
                />
                <button onClick={handleSearchMahasiswa} disabled={loadingSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              {searchMessage && (
                <p style={{ color: searchMessage.toLowerCase().includes('berhasil') ? colors.semantic.success : colors.semantic.error }} className="text-sm">
                  {searchMessage}
                </p>
              )}
            </div>

            {hasMahasiswaData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nama Mahasiswa</label>
                  <input
                    type="text"
                    name="namaMahasiswa"
                    value={formData.namaMahasiswa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50"
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
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50"
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
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status Mahasiswa</label>
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}>
                    {statusMahasiswa}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Data Dosen & Penelitian Section */}
          <div className="space-y-6 pt-8" style={{ borderTop: `2px solid ${colors.primary.main}33` }}>
            <h2 className="text-xl font-semibold" style={{ color: colors.primary.main }}>
              Data Dosen Pembimbing & Penelitian
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">NIP Dosen</label>
                <div className="relative">
                  <input
                    type="text"
                    name="nipDosen"
                    value={formData.nipDosen}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchDosen()}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Masukkan NIP Dosen"
                    style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
                  />
                  <button onClick={handleSearchDosen} disabled={loadingDosen} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nama Dosen Pembimbing</label>
                <input
                  type="text"
                  name="namaDosen"
                  value={formData.namaDosen}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  placeholder="Nama Dosen"
                  style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Judul Penelitian/Skripsi</label>
              <textarea
                name="judulPenelitian"
                value={formData.judulPenelitian}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                placeholder="Masukkan judul penelitian atau skripsi..."
                style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Detail Surat Section */}
          <div className="space-y-6 pt-8" style={{ borderTop: `2px solid ${colors.primary.main}33` }}>
            <h2 className="text-xl font-semibold" style={{ color: colors.primary.main }}>
              Detail Surat
            </h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Jenis Surat</label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-2 bg-white border rounded-lg text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
                >
                  <span className={!formData.jenisSurat ? "text-gray-400" : "text-gray-900"}>
                    {formData.jenisSurat || "Pilih jenis surat"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10" style={{ borderColor: colors.primary.light }}>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onClick={() => { setFormData((prev) => ({ ...prev, jenisSurat: "Surat Rekomendasi Mahasiswa" })); setShowDropdown(false) }}>
                      Surat Rekomendasi Mahasiswa
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onClick={() => { setFormData((prev) => ({ ...prev, jenisSurat: "Surat Persetujuan KRS" })); setShowDropdown(false) }}>
                      Surat Persetujuan KRS
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onClick={() => { setFormData((prev) => ({ ...prev, jenisSurat: "Surat Tugas Pembimbing Akademik" })); setShowDropdown(false) }}>
                      Surat Tugas Pembimbing Akademik
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm" onClick={() => { setFormData((prev) => ({ ...prev, jenisSurat: "Surat Keterangan Penelitian/Skripsi" })); setShowDropdown(false) }}>
                      Surat Keterangan Penelitian/Skripsi
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Keterangan Surat</label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                placeholder="Masukkan keterangan surat..."
                style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
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
                style={{ borderColor: colors.primary.main, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 justify-end flex-wrap" style={{ borderTop: `2px solid ${colors.primary.main}33` }}>
            {(!docStatus || docStatus === 'draft') && (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 font-medium rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.semantic.info, color: 'white' }}
              >
                <Send className="w-4 h-4" />
                Submit untuk Approval
              </button>
            )}
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-2 font-medium rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}
            >
              <Eye className="w-4 h-4" />
              Preview Dokumen
            </button>
            {(docStatus === 'approved' || docStatus === 'draft') && (
              <button
                onClick={() => setShowSuccessPopup(true)}
                className="flex items-center gap-2 px-6 py-2 text-white font-medium rounded-lg hover:opacity-80 transition-all"
                style={{ backgroundColor: colors.primary.main }}
              >
                <FileText className="w-4 h-4" />
                Generate Dokumen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: `${colors.neutral.black}66` }}>
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Preview Dokumen</h3>
              <button onClick={() => { setShowPreviewModal(false); if (previewUrl) { window.URL.revokeObjectURL(previewUrl); setPreviewUrl(null) } }} className="text-gray-400 hover:text-gray-600 text-2xl font-bold px-2">
                &times;
              </button>
            </div>
            <div className="flex-1 bg-gray-50 p-2 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200" title="Preview" />
            </div>
          </div>
        </div>
      )}

      {/* Success Popup - Export Format */}
      {showSuccessPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: `${colors.neutral.black}33` }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowSuccessPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${colors.primary.main}20` }}>
                <FileText className="w-8 h-8" style={{ color: colors.primary.main }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Pilih Format Dokumen</h3>
            </div>
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

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: `${colors.neutral.black}33` }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setShowErrorPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${colors.semantic.error}20` }}>
                <AlertCircle className="w-8 h-8" style={{ color: colors.semantic.error }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Error</h3>
              <p className="text-gray-600 text-sm">{errorMessage || 'Terjadi kesalahan'}</p>
            </div>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full px-6 py-3 text-white font-medium rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: colors.primary.main }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: `${colors.neutral.black}33` }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">History Log</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada history</p>
              ) : (
                history.map((item) => (
                  <div key={item.log_id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-500">Oleh: {item.actor_role}</p>
                        {item.comments && <p className="text-sm text-gray-600 mt-1">{item.comments}</p>}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: `${colors.neutral.black}33` }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Approval Workflow</h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {approvals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada approval workflow</p>
              ) : (
                <>
                  {approvals.map((approval) => (
                    <div key={approval.approval_id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">Level {approval.approval_level}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              approval.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              approval.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {approval.status === 'approved' ? 'Disetujui' : 
                               approval.status === 'rejected' ? 'Ditolak' : 
                               'Menunggu'}
                            </span>
                          </div>
                          {approval.approver_name && (
                            <p className="text-sm text-gray-600">Approver: {approval.approver_name}</p>
                          )}
                          {approval.comments && (
                            <p className="text-sm text-gray-600 mt-1">Komentar: {approval.comments}</p>
                          )}
                          {approval.digital_signature && (
                            <p className="text-xs text-gray-500 mt-1 italic">Tanda Tangan Digital: {typeof approval.digital_signature === 'string' ? approval.digital_signature : 'Tersedia'}</p>
                          )}
                        </div>
                        {approval.approved_at && (
                          <span className="text-xs text-gray-400 ml-2">{new Date(approval.approved_at).toLocaleString('id-ID')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Tombol Approve/Reject jika user memiliki pending approval */}
                  {hasPendingApproval() && docStatus === 'submitted' && (
                    <div className="mt-4 pt-4 border-t flex gap-3">
                      <button
                        onClick={() => openApproveRejectModal('approve')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Setujui
                      </button>
                      <button
                        onClick={() => openApproveRejectModal('reject')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Tolak
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal dengan Digital Signature */}
      {showApproveRejectModal && approvalAction && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: `${colors.neutral.black}33` }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {approvalAction === 'approve' ? 'Setujui Surat' : 'Tolak Surat'}
              </h3>
              <button onClick={() => setShowApproveRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar {approvalAction === 'reject' && '(Wajib)'}
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  placeholder={approvalAction === 'approve' ? 'Tambahkan komentar (opsional)...' : 'Alasan penolakan...'}
                  style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
                />
              </div>

              {approvalAction === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanda Tangan Digital (Simulasi)
                  </label>
                  <input
                    type="text"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Masukkan nama atau tanda tangan digital..."
                    style={{ borderColor: colors.primary.light, "--tw-ring-color": colors.primary.main } as React.CSSProperties}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Simulasi: Tanda tangan akan disimpan sebagai metadata
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowApproveRejectModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ borderColor: colors.primary.light }}
                >
                  Batal
                </button>
                <button
                  onClick={approvalAction === 'approve' ? handleApprove : handleReject}
                  disabled={approvalAction === 'reject' && !approvalComments.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                    approvalAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Setujui' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

