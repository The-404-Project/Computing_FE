"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, FileText, Download, Eye, X } from "lucide-react"
import { colors } from "../design-system"

interface FormData {
  nim: string
  namaMahasiswa: string
  programStudi: string
  tahunAkademik: string
  jenisSurat: string
  keterangan: string
  nomorRegistrasi: string
}

export default function SuratKeterangan() {
  const [formData, setFormData] = useState<FormData>({
    nim: "1234567890",
    namaMahasiswa: "Budi Setiawan",
    programStudi: "Teknik Informatika",
    tahunAkademik: "2023/2024",
    jenisSurat: "Surat Keterangan Aktif Kuliah",
    keterangan: "Untuk keperluan pengajuan beasiswa Prestasi Gemilang 2024",
    nomorRegistrasi: "SK-IF-2024-03-0123",
  })

  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [statusMahasiswa, setStatusMahasiswa] = useState("Aktif")
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)
  const [generatedFile, setGeneratedFile] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [existingFile, setExistingFile] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePreview = () => {
    console.log("Previewing document")
    // Logic untuk preview dokumen
  }

  const handleSearch = async () => {
    setLoadingSearch(true)
    setSearchMessage(null)
    try {
      const res = await fetch(`http://localhost:4000/api/mahasiswa?nim=${encodeURIComponent(formData.nim)}`)
      if (!res.ok) {
        let msg = 'Data mahasiswa tidak ditemukan'
        try {
          const body = await res.json()
          if (body && body.message) msg = body.message
        } catch {}
        setSearchMessage(msg)
        setLoadingSearch(false)
        return
      }
      const data = await res.json()
      setFormData((prev) => ({
        ...prev,
        namaMahasiswa: data.namaMahasiswa || prev.namaMahasiswa,
        programStudi: data.programStudi || prev.programStudi,
        tahunAkademik: data.tahunAkademik || prev.tahunAkademik,
      }))
      setStatusMahasiswa(data.status || statusMahasiswa)
      setSearchMessage('Data mahasiswa berhasil ditemukan.')
    } catch (e) {
      setSearchMessage('Terjadi kesalahan jaringan')
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleGenerate = () => {
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
    const payload = {
      nomor_surat: formData.nomorRegistrasi,
      nama: formData.namaMahasiswa,
      nim: formData.nim,
      program_studi: formData.programStudi,
      tahun_akademik: formData.tahunAkademik,
      status: statusMahasiswa,
      keperluan: formData.keterangan,
      kota: "Depok",
      tanggal: formatDateID(new Date()),
      nama_dekan: "Prof. Dr. Mirna Adriani, M.Sc.",
      nip_dekan: "196512345678901234",
      jenis_surat: formData.jenisSurat,
    }
    fetch("http://localhost:4000/api/surat-keterangan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        let data: any = {}
        try {
          data = await res.json()
        } catch {}
        if (!res.ok) {
          const msg = (data && data.message) ? String(data.message) : 'Gagal membuat dokumen'
          setErrorMessage(msg)
          setGeneratedFile(null)
          setExistingFile(data && data.file ? String(data.file) : null)
          setShowSuccessPopup(false)
          setShowErrorPopup(true)
          return
        }
        setGeneratedFile(data.file || null)
        setExistingFile(null)
        setShowErrorPopup(false)
        setShowSuccessPopup(true)
      })
      .catch(() => {
        setGeneratedFile(null)
        setExistingFile(null)
        setShowSuccessPopup(false)
        setErrorMessage('Terjadi kesalahan jaringan')
        setShowErrorPopup(true)
      })
  }

  const handleExport = (format: "docx" | "pdf") => {
    if (format === "docx" && generatedFile) {
      const url = `http://localhost:4000/files/${encodeURIComponent(generatedFile)}`
      const a = document.createElement("a")
      a.href = url
      a.download = generatedFile
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    setShowSuccessPopup(false)
  }

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

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Mahasiswa */}
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

              {/* Program Studi */}
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

              {/* Tahun Akademik */}
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

              {/* Status Mahasiswa */}
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
                  <span>{formData.jenisSurat}</span>
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
                  </div>
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
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center sipena-check-bounce"
                style={{ backgroundColor: `${colors.semantic.success}20` }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.semantic.success }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path className="sipena-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Dokumen Berhasil Dibuat</h3>
              <p className="text-gray-600 text-sm">Silakan pilih format export yang Anda inginkan</p>
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
                  onClick={() => {
                    const url = `http://localhost:4000/files/${encodeURIComponent(existingFile)}`
                    const a = document.createElement('a')
                    a.href = url
                    a.download = existingFile
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
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
    </div>
  )
}
