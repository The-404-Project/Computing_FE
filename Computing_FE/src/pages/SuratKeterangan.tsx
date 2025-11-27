"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, FileText, Download } from "lucide-react"
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
    jenisSurat: "Surat Keterangan Mahasiswa Aktif",
    keterangan: "Untuk keperluan pengajuan beasiswa Prestasi Gemilang 2024",
    nomorRegistrasi: "SK-IF-2024-03-0123",
  })

  const [showDropdown, setShowDropdown] = useState(false)
  const statusMahasiswa = "Aktif"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleExport = (format: "docx" | "pdf") => {
    console.log(`Exporting as ${format.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ backgroundColor: colors.neutral.white }}>
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
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
              <p style={{ color: colors.semantic.success }} className="text-sm">
                Data mahasiswa berhasil ditemukan.
              </p>
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
                  style={{ backgroundColor: `${colors.semantic.success}20`, color: colors.semantic.success }}
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

            {/* Grid Nomor Registrasi and Watermark Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nomor Registrasi */}
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
                  readOnly
                />
              </div>

              {/* Watermark Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Watermark Preview</label>
                <div
                  className="w-full h-24 border-2 rounded-lg flex items-center justify-center"
                  style={{ borderColor: colors.primary.light, backgroundColor: `${colors.primary.main}08` }}
                >
                  <span className="font-semibold text-lg tracking-widest" style={{ color: colors.primary.main }}>
                    CONFIDENTIAL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 pt-8 justify-end" style={{ borderTop: `2px solid ${colors.primary.main}33` }}>
            <button
              onClick={() => handleExport("docx")}
              className="flex items-center gap-2 px-6 py-2 font-medium rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: `${colors.primary.main}20`, color: colors.primary.main }}
            >
              <FileText className="w-4 h-4" />
              Export DOCX
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-6 py-2 text-white font-medium rounded-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: colors.primary.main }}
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
