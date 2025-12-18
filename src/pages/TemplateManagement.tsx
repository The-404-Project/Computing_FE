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
    variables: '',
    is_active: true,
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
      formDataToSend.append('variables', formData.variables || '[]');
      formDataToSend.append('is_active', formData.is_active.toString());

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
      }

      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ template_name: '', template_type: '', description: '', variables: '', is_active: true });
      setFile(null);
      fetchTemplates();
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
      variables: Array.isArray(template.variables) ? JSON.stringify(template.variables, null, 2) : template.variables || '',
      is_active: template.is_active,
    });
    setFile(null);
    setShowModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({ template_name: '', template_type: '', description: '', variables: '', is_active: true });
    setFile(null);
    setShowModal(true);
  };

  // Get template type label
  const getTemplateTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      surat_tugas: 'Surat Tugas',
      surat_undangan: 'Surat Undangan',
      surat_keterangan: 'Surat Keterangan',
      surat_pengantar: 'Surat Pengantar',
      surat_keputusan: 'Surat Keputusan',
      surat_prodi: 'Surat Prodi',
      surat_laak: 'Surat LAAK',
      sppd: 'SPPD',
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

      {/* Filters */}
      <div className="border rounded-lg p-4 mb-6" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
            Filter Jenis Template
          </label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#d1d5db' }}>
            <option value="">Semua Jenis</option>
            <option value="surat_tugas">Surat Tugas</option>
            <option value="surat_undangan">Surat Undangan</option>
            <option value="surat_keterangan">Surat Keterangan</option>
            <option value="surat_pengantar">Surat Pengantar</option>
            <option value="surat_keputusan">Surat Keputusan</option>
            <option value="surat_prodi">Surat Prodi</option>
            <option value="surat_laak">Surat LAAK</option>
            <option value="sppd">SPPD</option>
          </select>
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
                  style={{ borderColor: '#d1d5db' }}
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
                  style={{ borderColor: '#d1d5db' }}
                  required
                >
                  <option value="">Pilih Jenis</option>
                  <option value="surat_tugas">Surat Tugas</option>
                  <option value="surat_undangan">Surat Undangan</option>
                  <option value="surat_keterangan">Surat Keterangan</option>
                  <option value="surat_pengantar">Surat Pengantar</option>
                  <option value="surat_keputusan">Surat Keputusan</option>
                  <option value="surat_prodi">Surat Prodi</option>
                  <option value="surat_laak">Surat LAAK</option>
                  <option value="sppd">SPPD</option>
                </select>
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
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Variables (JSON Array)
                </label>
                <textarea
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ borderColor: '#d1d5db' }}
                  rows={4}
                  placeholder='["nomor_surat", "tanggal", "nama"]'
                />
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  Masukkan array JSON dari variable yang digunakan di template
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="is_active" className="text-sm font-semibold" style={{ color: '#374151' }}>
                  Aktif
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90" style={{ backgroundColor: colors.primary.main }}>
                  {editingTemplate ? 'Update' : 'Simpan'}
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
