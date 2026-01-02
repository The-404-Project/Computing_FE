import { useState, useEffect } from 'react';
import { colors } from '../design-system/colors';
import api from '../services/api';

interface Document {
  id: number;
  doc_number: string;
  doc_type: string;
  status: string;
  metadata: any;
  file_path: string | null;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    username: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

const ArsipSurat = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (docType) params.doc_type = docType;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('/dashboard/documents/search', { params });
      
      // Normalize metadata - ensure it's an object, not a string
      const normalizedDocuments = response.data.documents.map((doc: Document) => {
        let metadata = doc.metadata;
        
        // If metadata is a string, try to parse it
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            console.warn('Failed to parse metadata as JSON:', e);
            metadata = null;
          }
        }
        
        // If metadata is null or undefined, set to empty object
        if (!metadata || typeof metadata !== 'object') {
          metadata = {};
        }
        
        return {
          ...doc,
          metadata
        };
      });
      
      setDocuments(normalizedDocuments);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data dokumen');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, docType, dateFrom, dateTo]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchDocuments();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle download
  const handleDownload = async (doc: Document, format: 'docx' | 'pdf' = 'docx') => {
    try {
      const response = await api.get(`/dashboard/documents/${doc.id}/download`, {
        params: { format },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'pdf' ? 'pdf' : 'docx';
      link.setAttribute('download', `${doc.doc_number}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunduh dokumen');
      console.error('Download error:', err);
    }
  };

  // Handle export history
  const handleExportHistory = async () => {
    try {
      const params: any = {};

      if (search) params.search = search;
      if (docType) params.doc_type = docType;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('/dashboard/documents/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = `arsip_surat_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengekspor history');
      console.error('Export error:', err);
    }
  };

  // Get doc type label - prioritize metadata.jenis_surat for more specific labels
  const getDocTypeLabel = (doc: Document) => {
    // Ensure metadata is an object
    const metadata = doc.metadata && typeof doc.metadata === 'object' ? doc.metadata : {};
    
    // First, check if there's a specific jenis_surat in metadata
    const jenisSurat = metadata.jenis_surat;
    
    // Debug logging (can be removed later)
    if (process.env.NODE_ENV === 'development' && jenisSurat) {
      console.log('Document jenis_surat:', jenisSurat, 'for doc:', doc.doc_number);
    }
    
    // Normalize jenis_surat for case-insensitive matching
    const normalizedJenisSurat = typeof jenisSurat === 'string' 
      ? jenisSurat.toLowerCase().trim() 
      : jenisSurat;
    
    // Mapping for specific jenis_surat values (keys are normalized to lowercase)
    const specificLabels: { [key: string]: string } = {
      // Surat Tugas specific types
      'surat_tugas_dosen': 'Surat Tugas Dosen',
      'surat_tugas_staf': 'Surat Tugas Staf',
      'sppd': 'Surat Perintah Perjalanan Dinas (SPPD)',
      
      // Surat Undangan specific types
      'undangan_rapat': 'Undangan Rapat',
      'undangan_seminar': 'Undangan Seminar',
      'undangan_kegiatan': 'Undangan Kegiatan',
      
      // Surat Pengantar specific types
      'pengantar_magang': 'Surat Pengantar Magang',
      'pengantar_penelitian': 'Surat Pengantar Penelitian',
      'surat_permohonan': 'Surat Permohonan',
      
      // Surat Keterangan specific types (from modul3)
      'surat keterangan aktif kuliah': 'Surat Keterangan Aktif Kuliah',
      'surat keterangan lulus': 'Surat Keterangan Lulus',
      'surat keterangan bebas perpustakaan': 'Surat Keterangan Bebas Perpustakaan',
      'surat keterangan bebas lab': 'Surat Keterangan Bebas Lab',
      'surat keterangan bebas administrasi': 'Surat Keterangan Bebas Administrasi',
      'surat keterangan bebas pinjaman': 'Surat Keterangan Bebas Pinjaman',
      'surat keterangan kelakuan baik': 'Surat Keterangan Kelakuan Baik',
      'surat keterangan lainnya': 'Surat Keterangan Lainnya',
      
      // Surat Keputusan & Edaran specific types
      'sk_dekan': 'SK Dekan',
      'sk_panitia': 'SK Panitia',
      'se_akademik': 'SE Akademik',
      'se_umum': 'SE Umum',
      
      // Surat Prodi specific types
      'surat rekomendasi mahasiswa': 'Surat Rekomendasi Mahasiswa',
      'surat persetujuan krs': 'Surat Persetujuan KRS',
      'surat tugas pembimbing akademik': 'Surat Tugas Pembimbing Akademik',
      'surat keterangan penelitian/skripsi': 'Surat Keterangan Penelitian/Skripsi',
      
      // Surat LAAK specific types
      'surat permohonan akreditasi': 'Surat Permohonan Akreditasi',
      'laporan audit internal': 'Laporan Audit Internal',
      'surat tindak lanjut audit': 'Surat Tindak Lanjut Audit',
      'berita acara visitasi': 'Berita Acara Visitasi',
      
      // Surat Pengantar additional types (from template management)
      'surat_pengantar_a': 'Surat Pengantar A',
      'surat_pengantar_b': 'Surat Pengantar B',
    };
    
    // If jenis_surat exists in metadata, use it
    if (normalizedJenisSurat && specificLabels[normalizedJenisSurat]) {
      return specificLabels[normalizedJenisSurat];
    }
    
    // If jenis_surat exists but not in mapping, format it nicely
    if (jenisSurat && typeof jenisSurat === 'string') {
      // Handle template_ prefix
      if (jenisSurat.toLowerCase().startsWith('template_')) {
        return metadata.template_name || 'Template Kustom';
      }
      // If already has spaces and proper capitalization, return as is
      if (jenisSurat.includes(' ') && /^[A-Z]/.test(jenisSurat.trim())) {
        return jenisSurat.trim();
      }
      // Format the string: replace underscores/slashes with spaces and capitalize
      return jenisSurat
        .replace(/[_\//]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
    }
    
    // Fallback to doc_type mapping
    const generalLabels: { [key: string]: string } = {
      surat_tugas: 'Surat Tugas',
      surat_undangan: 'Surat Undangan',
      surat_keterangan: 'Surat Keterangan',
      surat_pengantar: 'Surat Pengantar',
      surat_permohonan: 'Surat Permohonan',
      surat_keputusan: 'Surat Keputusan',
      surat_prodi: 'Surat Prodi',
      surat_laak: 'Surat LAAK',
    };
    
    return generalLabels[doc.doc_type] || doc.doc_type;
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

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setDocType('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f2937' }}>
            Arsip Surat
          </h2>
          <p className="text-base" style={{ color: '#6b7280' }}>
            Cari dan filter dokumen surat yang telah dibuat
          </p>
        </div>
        <button onClick={handleExportHistory} className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: colors.primary.main, color: colors.neutral.white }}>
          Export CSV
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="border rounded-lg p-6 mb-6" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
              Cari Dokumen
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor surat atau kata kunci..."
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#d1d5db' }}
            />
          </div>

          {/* Filter: Doc Type */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
              Jenis Surat
            </label>
            <select
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#d1d5db' }}
            >
              <option value="">Semua Jenis</option>
              <option value="surat_tugas">Surat Tugas</option>
              <option value="surat_undangan">Surat Undangan</option>
              <option value="surat_keterangan">Surat Keterangan</option>
              <option value="surat_pengantar">Surat Pengantar</option>
              <option value="surat_keputusan">Surat Keputusan</option>
              <option value="surat_prodi">Surat Prodi</option>
              <option value="surat_laak">Surat LAAK</option>
            </select>
          </div>

          {/* Filter: Date From */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
              Tanggal Dari
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#d1d5db' }}
            />
          </div>

          {/* Filter: Date To */}
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
              Tanggal Sampai
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#d1d5db' }}
            />
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button onClick={handleResetFilters} className="w-full px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-gray-50" style={{ borderColor: '#d1d5db', color: '#374151' }}>
              Reset Filter
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm" style={{ color: '#6b7280' }}>
          Menampilkan {documents.length} dari {total} dokumen
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Documents Table */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Nomor Surat
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                  Pembuat
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
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center" style={{ color: '#6b7280' }}>
                    Tidak ada dokumen ditemukan
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="border-t" style={{ borderColor: '#e5e7eb' }}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1f2937' }}>
                      {doc.doc_number}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                      {getDocTypeLabel(doc)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                      {doc.created_by?.full_name || doc.created_by?.username || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleDownload(doc, 'docx')} className="text-sm font-semibold px-3 py-1 rounded transition-colors" style={{ color: colors.primary.main, backgroundColor: '#f0f9ff' }} title="Download DOCX">
                          DOCX
                        </button>
                        <button onClick={() => handleDownload(doc, 'pdf')} className="text-sm font-semibold px-3 py-1 rounded transition-colors" style={{ color: '#dc2626', backgroundColor: '#fee2e2' }} title="Download PDF">
                          PDF
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm" style={{ color: '#6b7280' }}>
            Halaman {page} dari {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-semibold rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              style={{ borderColor: '#d1d5db', color: '#374151' }}
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-semibold rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              style={{ borderColor: '#d1d5db', color: '#374151' }}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArsipSurat;
