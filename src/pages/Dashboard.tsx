import { colors } from '../design-system/colors';
import Layout from '../components/Layout';

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
  onOpenTemplateManagement,
}: DashboardProps) => {
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
          <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
            0
          </p>
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
          <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
            0
          </p>
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
          <p className="text-3xl font-bold" style={{ color: '#1f2937' }}>
            0
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
