import { useState, useEffect } from 'react';
import { colors } from '../design-system/colors';
import api from '../services/api';

interface Template {
  template_id: number;
  template_name: string;
  template_type: string;
  file_path: string;
  variables: any;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    template_name: '',
    template_type: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [filterType, setFilterType] = useState('');

  // Fetch templates
  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filterType) params.template_type = filterType;

      const response = await api.get('/dashboard/templates', { params });
      setTemplates(response.data.templates);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data templates');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filterType]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('template_name', formData.template_name);
      formDataToSend.append('template_type', formData.template_type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', 'true');

      if (editingTemplate) {
        // Update template
        if (file) {
          formDataToSend.append('file', file);
        }
        await api.put(`/dashboard/templates/${editingTemplate.template_id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setShowModal(false);
        setEditingTemplate(null);
        setFormData({ template_name: '', template_type: '', description: '' });
        setFile(null);
        fetchTemplates();
      } else {
        // Create template
        if (!file) {
          setError('File template wajib diupload');
          return;
        }
        formDataToSend.append('file', file);
        await api.post('/dashboard/templates', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Template berhasil dibuat, tetap di halaman ini
      setShowModal(false);
      setEditingTemplate(null);
        setFormData({ template_name: '', template_type: '', description: '' });
      setFile(null);
      fetchTemplates();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menyimpan template';
      setError(errorMessage);
      console.error('Submit error:', err);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setTemplateToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await api.delete(`/dashboard/templates/${templateToDelete}`);
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus template';
      setError(errorMessage);
      console.error('Delete error:', err);
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
    }
  };

  // Open edit modal
  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_type: template.template_type,
      description: template.description || '',
    });
    setFile(null);
    setShowModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ template_name: '', template_type: '', description: '' });
    setFile(null);
    setShowModal(true);
  };

  // Handle download template
  const handleDownloadTemplate = async () => {
    // Download template berdasarkan jenis yang dipilih
    const templateType = formData.template_type;
    if (!templateType) {
      setError('Pilih jenis template terlebih dahulu');
      return;
    }

    // Mapping jenis template ke nama file template dari folder templates
    const templateMap: { [key: string]: string } = {
      // Surat Tugas & Perintah
      'surat_tugas': 'template_surat_tugas.docx',
      'sppd': 'template_sppd.docx',
      
      // Surat Undangan
      'surat_undangan': 'template_undangan.docx',
      
      // Surat Keterangan
      'surat_keterangan_aktif_kuliah': 'template_surat_keterangan_mahasiswa_aktif.docx',
      'surat_keterangan_lulus': 'template_surat_keterangan_lulus.docx',
      'surat_keterangan_kelakuan_baik': 'template_surat_keterangan_kelakuan_baik.docx',
      'surat_keterangan_bebas_pinjaman': 'template_surat_keterangan_bebas_pinjaman.docx',
      'surat_keterangan': 'template_surat_keterangan_mahasiswa_aktif.docx', // Default untuk surat_keterangan
      
      // Surat Pengantar & Permohonan
      'surat_pengantar_A': 'template_pengantarpermohonan_A.docx',
      'surat_pengantar_B': 'template_pengantarpermohonan_B.docx',
      'surat_pengantar': 'template_pengantarpermohonan_A.docx', // Default untuk surat_pengantar
      
      // Surat Keputusan & Edaran
      'sk_dekan': 'template_surat_keputusan_dekan.docx',
      'sk_panitia': 'template_surat_keputusan_panitia.docx',
      'se_akademik': 'template_surat_edaran_akademik.docx',
      'se_umum': 'template_surat_edaran_umum.docx',
      
      // Surat Program Studi
      'surat_prodi': 'template_surat_program_studi.docx',
      
      // Surat LAAK
      'surat_permohonan_akreditasi': 'template_surat_permohonan_akreditasi.docx',
      'berita_acara_visitasi': 'template_berita_acara_visitasi.docx',
      'laporan_audit_internal': 'template_laporan_audit_internal.docx',
      'surat_tindak_lanjut_audit': 'template_surat_tindak_lanjut_audit.docx',
      'laak_default': 'template_laak_default.docx',
    };

    const templateFileName = templateMap[templateType];
    if (templateFileName) {
      try {
        setError(''); // Clear previous errors
        
        // Encode filename untuk URL
        const encodedFilename = encodeURIComponent(templateFileName);
        
        console.log('[Download Template] Requesting:', `/dashboard/templates/download/${encodedFilename}`);
        
        // Download dari endpoint dashboard templates menggunakan api service
        const response = await api.get(`/dashboard/templates/download/${encodedFilename}`, {
          responseType: 'blob',
        });
        
        console.log('[Download Template] Response received:', response.status, response.headers);
        
        // response.data sudah berupa blob dari axios
        const blob = response.data;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = templateFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log('[Download Template] Download triggered successfully');
      } catch (err: any) {
        console.error('[Download Template] Error details:', err);
        console.error('[Download Template] Error response:', err.response);
        
        // Jika error response adalah blob (dari server), coba parse sebagai text
        if (err.response?.data instanceof Blob) {
          try {
            const errorText = await err.response.data.text();
            const errorJson = JSON.parse(errorText);
            setError(errorJson.message || 'Gagal mengunduh template');
          } catch (parseErr) {
            setError('Gagal mengunduh template. File tidak ditemukan atau terjadi kesalahan server.');
          }
        } else {
          const errorMessage = err.response?.data?.message || err.message || 'Gagal mengunduh template';
          setError(errorMessage);
        }
      }
    } else {
      setError('Template untuk jenis ini belum tersedia');
    }
  };

  // Get styling based on template type
  // Get template type label
  const getTemplateTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      // Surat Tugas
      surat_tugas: 'Surat Tugas',
      
      // Surat Undangan
      surat_undangan: 'Surat Undangan',
      
      // Surat Keterangan
      surat_keterangan_aktif_kuliah: 'Surat Keterangan Aktif Kuliah',
      surat_keterangan_lulus: 'Surat Keterangan Lulus',
      surat_keterangan_kelakuan_baik: 'Surat Keterangan Kelakuan Baik',
      surat_keterangan_bebas_pinjaman: 'Surat Keterangan Bebas Pinjaman',
      surat_keterangan: 'Surat Keterangan',
      
      // Surat Pengantar & Permohonan
      surat_pengantar_A: 'Surat Pengantar A',
      surat_pengantar_B: 'Surat Pengantar B',
      surat_pengantar: 'Surat Pengantar & Permohonan',
      
      // Surat Keputusan & Edaran
      sk_dekan: 'Surat Keputusan Dekan',
      sk_panitia: 'Surat Keputusan Panitia',
      se_akademik: 'Surat Edaran Akademik',
      se_umum: 'Surat Edaran Umum',
      
      // Surat Program Studi
      surat_prodi: 'Surat Program Studi',
      
      // Surat LAAK
      surat_permohonan_akreditasi: 'Surat Permohonan Akreditasi',
      berita_acara_visitasi: 'Berita Acara Visitasi',
      laporan_audit_internal: 'Laporan Audit Internal',
      surat_tindak_lanjut_audit: 'Surat Tindak Lanjut Audit',
      laak_default: 'LAAK Default',
    };
    return labels[type] || type;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f2937' }}>
            Manajemen Template
          </h2>
          <p className="text-base" style={{ color: '#6b7280' }}>
            Kelola template surat yang digunakan untuk generate dokumen
          </p>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: colors.primary.main, color: colors.neutral.white }}>
          + Tambah Template
        </button>
      </div>

      {/* Compact Filter - Dropdown di samping */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-semibold whitespace-nowrap" style={{ color: '#374151' }}>
          Filter Jenis Template:
        </label>
        <div className="relative flex-1 max-w-xs">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white pr-8" 
            style={{ borderColor: '#d1d5db' }}
          >
            <option value="">Semua Jenis</option>
            <optgroup label="Surat Tugas">
              <option value="surat_tugas">Surat Tugas</option>
            </optgroup>
            <optgroup label="Surat Undangan">
              <option value="surat_undangan">Surat Undangan</option>
            </optgroup>
            <optgroup label="Surat Keterangan">
              <option value="surat_keterangan_aktif_kuliah">Surat Keterangan Aktif Kuliah</option>
              <option value="surat_keterangan_lulus">Surat Keterangan Lulus</option>
              <option value="surat_keterangan_kelakuan_baik">Surat Keterangan Kelakuan Baik</option>
              <option value="surat_keterangan_bebas_pinjaman">Surat Keterangan Bebas Pinjaman</option>
              <option value="surat_keterangan">Surat Keterangan (Umum)</option>
            </optgroup>
            <optgroup label="Surat Pengantar & Permohonan">
              <option value="surat_pengantar_A">Surat Pengantar A</option>
              <option value="surat_pengantar_B">Surat Pengantar B</option>
              <option value="surat_pengantar">Surat Pengantar & Permohonan (Umum)</option>
            </optgroup>
            <optgroup label="Surat Keputusan & Edaran">
              <option value="sk_dekan">Surat Keputusan Dekan</option>
              <option value="sk_panitia">Surat Keputusan Panitia</option>
              <option value="se_akademik">Surat Edaran Akademik</option>
              <option value="se_umum">Surat Edaran Umum</option>
            </optgroup>
            <optgroup label="Surat Program Studi">
              <option value="surat_prodi">Surat Program Studi</option>
            </optgroup>
            <optgroup label="Surat LAAK">
              <option value="surat_permohonan_akreditasi">Surat Permohonan Akreditasi</option>
              <option value="berita_acara_visitasi">Berita Acara Visitasi</option>
              <option value="laporan_audit_internal">Laporan Audit Internal</option>
              <option value="surat_tindak_lanjut_audit">Surat Tindak Lanjut Audit</option>
              <option value="laak_default">LAAK Default</option>
            </optgroup>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Templates Table */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Nama Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center" style={{ color: '#6b7280' }}>
                    Memuat data...
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center" style={{ color: '#6b7280' }}>
                    Tidak ada template ditemukan
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.template_id} className="border-t" style={{ borderColor: '#e5e7eb' }}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1f2937' }}>
                      {template.template_name}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                      {getTemplateTypeLabel(template.template_type)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                      {template.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                      {formatDate(template.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleEdit(template)} className="text-sm font-semibold px-3 py-1 rounded transition-colors" style={{ color: colors.primary.main, backgroundColor: '#f0f9ff' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(template.template_id)} className="text-sm font-semibold px-3 py-1 rounded transition-colors text-red-600 hover:bg-red-50">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl border max-h-[90vh] overflow-y-auto" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#1f2937' }}>
                {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                  setFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                style={{ lineHeight: '1' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Nama Template *
                </label>
                <input
                  type="text"
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: '#d1d5db',
                    backgroundColor: 'white'
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Jenis Template *
                </label>
                <select
                  value={formData.template_type}
                  onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: '#d1d5db',
                    backgroundColor: 'white'
                  }}
                  required
                >
                  <option value="">Pilih Jenis</option>
                  <optgroup label="Surat Tugas">
                    <option value="surat_tugas">Surat Tugas</option>
                  </optgroup>
                  <optgroup label="Surat Undangan">
                    <option value="surat_undangan">Surat Undangan</option>
                  </optgroup>
                  <optgroup label="Surat Keterangan">
                    <option value="surat_keterangan_aktif_kuliah">Surat Keterangan Aktif Kuliah</option>
                    <option value="surat_keterangan_lulus">Surat Keterangan Lulus</option>
                    <option value="surat_keterangan_kelakuan_baik">Surat Keterangan Kelakuan Baik</option>
                    <option value="surat_keterangan_bebas_pinjaman">Surat Keterangan Bebas Pinjaman</option>
                    <option value="surat_keterangan">Surat Keterangan (Umum)</option>
                  </optgroup>
                  <optgroup label="Surat Pengantar & Permohonan">
                    <option value="surat_pengantar_A">Surat Pengantar A</option>
                    <option value="surat_pengantar_B">Surat Pengantar B</option>
                    <option value="surat_pengantar">Surat Pengantar & Permohonan (Umum)</option>
                  </optgroup>
                  <optgroup label="Surat Keputusan & Edaran">
                    <option value="sk_dekan">Surat Keputusan Dekan</option>
                    <option value="sk_panitia">Surat Keputusan Panitia</option>
                    <option value="se_akademik">Surat Edaran Akademik</option>
                    <option value="se_umum">Surat Edaran Umum</option>
                  </optgroup>
                  <optgroup label="Surat Program Studi">
                    <option value="surat_prodi">Surat Program Studi</option>
                  </optgroup>
                  <optgroup label="Surat LAAK">
                    <option value="surat_permohonan_akreditasi">Surat Permohonan Akreditasi</option>
                    <option value="berita_acara_visitasi">Berita Acara Visitasi</option>
                    <option value="laporan_audit_internal">Laporan Audit Internal</option>
                    <option value="surat_tindak_lanjut_audit">Surat Tindak Lanjut Audit</option>
                    <option value="laak_default">LAAK Default</option>
                  </optgroup>
                </select>
                {/* Button Unduh Template - muncul ketika nama dan jenis sudah diisi */}
                {formData.template_name && formData.template_type && !editingTemplate && (
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: colors.semantic.success, color: colors.neutral.white }}
                  >
                    📥 Unduh Template Contoh
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  File Template {!editingTemplate && '*'}
                </label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db' }}
                  required={!editingTemplate}
                />
                {editingTemplate && (
                  <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                    Kosongkan jika tidak ingin mengubah file
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db' }}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90" style={{ backgroundColor: colors.primary.main }}>
                  {editingTemplate ? 'Update' : 'Buat Template'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                    setFile(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db', color: '#374151' }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#1f2937' }}>
                Konfirmasi Hapus
              </h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTemplateToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                style={{ lineHeight: '1' }}
              >
                ×
              </button>
            </div>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Yakin ingin menghapus template ini? File template juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90" style={{ backgroundColor: '#dc2626' }}>
                Hapus
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTemplateToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-gray-50"
                style={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
