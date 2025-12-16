import { colors } from '../design-system/colors';

interface DashboardProps {
  onLogout?: () => void;
  onOpenSuratPengantar?: () => void;
}

const Dashboard = ({ onLogout, onOpenSuratPengantar }: DashboardProps) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral.white }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.primary.main }}>
                SIPENA
              </h1>
              <p className="text-xs sm:text-sm font-normal mt-1" style={{ color: colors.primary.medium }}>
                Sistem Pengelolaan Naskah Akademik
              </p>
            </div>
            <button onClick={onLogout} className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:bg-gray-100" style={{ color: '#374151', border: '1px solid #d1d5db' }}>
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1f2937' }}>
            Selamat Datang
          </h2>
          <p className="text-sm sm:text-base" style={{ color: '#6b7280' }}>
            Dashboard Sistem Pengelolaan Naskah Akademik
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Card 1 */}
          <div className="border rounded-lg p-4 sm:p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#6b7280' }}>
                Total Surat
              </h3>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.primary.main }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1f2937' }}>
              0
            </p>
          </div>

          {/* Card 2 */}
          <div className="border rounded-lg p-4 sm:p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#6b7280' }}>
                Surat Pending
              </h3>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.semantic.warning }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1f2937' }}>
              0
            </p>
          </div>

          {/* Card 3 */}
          <div className="border rounded-lg p-4 sm:p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#6b7280' }}>
                Surat Selesai
              </h3>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.semantic.success }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1f2937' }}>
              0
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-4 sm:p-6 shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
          <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1f2937' }}>
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <button className="flex items-center gap-3 p-4 border rounded-lg transition-all hover:bg-gray-50 text-left" style={{ borderColor: '#e5e7eb' }}>
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.primary.main }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <p className="font-semibold text-sm sm:text-base" style={{ color: '#1f2937' }}>
                  Buat Surat Undangan
                </p>
                <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                  Buat surat undangan baru
                </p>
              </div>
            </button>

            <button 
                onClick={onOpenSuratPengantar}
                className="flex items-center gap-3 p-4 border rounded-lg transition-all hover:bg-gray-50 text-left" 
                style={{ borderColor: '#e5e7eb' }}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.primary.main }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-semibold text-sm sm:text-base" style={{ color: '#1f2937' }}>
                  Buat Surat Pengantar
                </p>
                <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                  Buat surat pengantar baru
                </p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 border rounded-lg transition-all hover:bg-gray-50 text-left" style={{ borderColor: '#e5e7eb' }}>
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.primary.main }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="font-semibold text-sm sm:text-base" style={{ color: '#1f2937' }}>
                  Lihat Semua Surat
                </p>
                <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                  Lihat daftar semua surat
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;