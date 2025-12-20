import { useState, useEffect } from 'react';
import { colors } from '../design-system/colors';
import Layout from '../components/Layout';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  onLogout?: () => void;
  onOpenSuratPengantar?: () => void;
  onOpenSuratUndangan?: () => void;
  onOpenSuratTugas?: () => void;
  onOpenAdmin?: () => void;
  onOpenSuratKeterangan?: () => void;
  onOpenSuratKeputusan?: () => void;
  onOpenSuratProdi?: () => void;
  onOpenSuratLaak?: () => void;
  onOpenArsipSurat?: () => void;
  onOpenTemplateManagement?: () => void;
}

interface DocumentStats {
  total: number;
  pending: number;
  completed: number;
  byType: Array<{ type: string; count: number }>;
  byMonth: Array<{ month: string; count: number }>;
}

const Dashboard = ({
  onLogout,
  onOpenSuratPengantar,
  onOpenSuratUndangan,
  onOpenSuratTugas,
  onOpenAdmin,
  onOpenSuratKeterangan,
  onOpenSuratKeputusan,
  onOpenSuratProdi,
  onOpenSuratLaak,
  onOpenArsipSurat,
  onOpenTemplateManagement 
}: DashboardProps) => {
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    pending: 0,
    completed: 0,
    byType: [],
    byMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/dashboard/documents/stats');
        setStats(response.data);
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.response?.data?.message || 'Gagal memuat statistik');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper function to format document type names
  const formatDocType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      surat_tugas: 'Surat Tugas',
      surat_undangan: 'Surat Undangan',
      surat_keterangan: 'Surat Keterangan',
      surat_pengantar: 'Surat Pengantar',
      surat_keputusan: 'Surat Keputusan',
      surat_prodi: 'Surat Prodi',
      surat_laak: 'Surat LAAK',
      general: 'Umum',
      unknown: 'Tidak Diketahui',
    };
    return typeMap[type] || type;
  };

  // Helper function to format month (YYYY-MM to Month Year)
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  // Prepare data for charts
  const pieChartData = stats.byType.map((item) => ({
    name: formatDocType(item.type),
    value: item.count,
  }));

  const barChartData = stats.byMonth.map((item) => ({
    month: formatMonth(item.month),
    count: item.count,
  }));

  // Colors for pie chart
  const COLORS = [colors.primary.main, colors.semantic.success, colors.semantic.warning, colors.primary.medium, colors.semantic.error, '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <Layout
      onLogout={onLogout}
      onOpenSuratPengantar={onOpenSuratPengantar}
      onOpenSuratTugas={onOpenSuratTugas}
      onOpenSuratUndangan={onOpenSuratUndangan}
      onOpenAdmin={onOpenAdmin}
      onOpenSuratKeterangan={onOpenSuratKeterangan}
      onOpenSuratKeputusan={onOpenSuratKeputusan}
      onOpenSuratProdi={onOpenSuratProdi}
      onOpenSuratLaak={onOpenSuratLaak}
      onOpenArsipSurat={onOpenArsipSurat}
      onOpenTemplateManagement={onOpenTemplateManagement}
      activeMenuItem="dashboard"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#1f2937' }}>
          Selamat Datang
        </h2>
        <p className="text-base" style={{ color: '#6b7280' }}>
          Dashboard Sistem Pengelolaan Naskah Akademik
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Surat */}
        <div className="border rounded-lg p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold" style={{ color: '#6b7280' }}>
              Total Surat
            </h3>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.primary.main }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: colors.primary.main }}></div>
              <span className="text-sm" style={{ color: '#6b7280' }}>
                Memuat...
              </span>
            </div>
          ) : error ? (
            <p className="text-sm" style={{ color: colors.semantic.error }}>
              {error}
            </p>
          ) : (
            <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
              {stats.total.toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Card 2: Surat Pending */}
        <div className="border rounded-lg p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold" style={{ color: '#6b7280' }}>
              Surat Pending
            </h3>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.semantic.warning }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: colors.semantic.warning }}></div>
              <span className="text-sm" style={{ color: '#6b7280' }}>
                Memuat...
              </span>
            </div>
          ) : error ? (
            <p className="text-sm" style={{ color: colors.semantic.error }}>
              {error}
            </p>
          ) : (
            <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
              {stats.pending.toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Card 3: Surat Selesai */}
        <div className="border rounded-lg p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold" style={{ color: '#6b7280' }}>
              Surat Selesai
            </h3>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.semantic.success }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: colors.semantic.success }}></div>
              <span className="text-sm" style={{ color: '#6b7280' }}>
                Memuat...
              </span>
            </div>
          ) : error ? (
            <p className="text-sm" style={{ color: colors.semantic.error }}>
              {error}
            </p>
          ) : (
            <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
              {stats.completed.toLocaleString('id-ID')}
            </p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1: Distribusi Dokumen Berdasarkan Tipe (Pie Chart) */}
          <div className="border rounded-lg p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1f2937' }}>
              Distribusi Dokumen Berdasarkan Tipe
            </h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name || 'Unknown'}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Tidak ada data untuk ditampilkan
                </p>
              </div>
            )}
          </div>

          {/* Chart 2: Trend Dokumen Per Bulan (Bar Chart) */}
          <div className="border rounded-lg p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1f2937' }}>
              Trend Dokumen (6 Bulan Terakhir)
            </h3>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.neutral.white,
                      border: `1px solid ${'#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Jumlah Dokumen" fill={colors.primary.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Tidak ada data untuk ditampilkan
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;