import { colors } from '../design-system/colors';

interface HeaderProps {
  onBackToDashboard?: () => void;
  activeMenuItem?: string;
}

const Header = ({ onBackToDashboard, activeMenuItem = 'dashboard' }: HeaderProps) => {
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user?.username || user?.fullName || 'user';

  const isDashboard = activeMenuItem === 'dashboard';

  return (
    <header className="sticky top-0 flex items-center justify-between px-6 py-4 z-50" style={{ backgroundColor: colors.primary.dark }}>
      <div className="flex items-center gap-4">
        {/* Back Button - hanya muncul jika bukan dashboard */}
        {!isDashboard && onBackToDashboard && (
          <button onClick={onBackToDashboard} className="flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:opacity-80" style={{ backgroundColor: colors.primary.medium }} aria-label="Kembali ke Dashboard">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {/* SIPENA Logo/Text - Clickable */}
        <div onClick={onBackToDashboard} className="cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-3">
          <img src="/Logo Sipena.png" alt="Logo SIPENA" className="h-16 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-white">SIPENA</h1>
            <p className="text-sm text-white/80">Sistem Pengelolaan Naskah Akademik</p>
          </div>
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
  );
};

export default Header;
