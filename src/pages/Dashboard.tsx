import { colors } from '../design-system/colors';
import Sidebar from '../components/Sidebar';

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
}

const Dashboard = ({ onLogout, onOpenSuratPengantar, onOpenSuratUndangan, onOpenSuratTugas, onOpenAdmin, onOpenSuratKeterangan, onOpenSuratKeputusan, onOpenSuratProdi, onOpenSuratLaak, onOpenArsipSurat }: DashboardProps) => {
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user?.username || 'user';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.neutral.white }}>
      {/* Header - Dark Grey */}
      <header className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: colors.primary.dark }}>
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="w-12 h-12 rounded" style={{ backgroundColor: colors.primary.medium }}></div>
          <div>
            <h1 className="text-2xl font-bold text-white">SIPENA</h1>
            <p className="text-sm text-white/80">Sistem Pengelolaan Naskah Akademik</p>
          </div>
        </div>
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary.medium }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-white font-medium">{username}</span>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden relative" style={{ overflowX: 'hidden' }}>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: colors.neutral.white }}>
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
        </main>

        {/* Sidebar Component */}
        <Sidebar
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
          activeMenuItem="dashboard"
        />
      </div>

      {/* Footer - Dark Grey, Sticky */}
      <footer className="sticky bottom-0 px-6 py-4 text-center z-10" style={{ backgroundColor: colors.primary.dark }}>
        <p className="text-sm text-white">© 2025 Fakultas Informatika, Telkom University</p>
      </footer>
    </div>
  );
};

export default Dashboard;
