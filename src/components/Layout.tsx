import { colors } from '../design-system/colors';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
  onBackToDashboard?: () => void;
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
  activeMenuItem?: string;
}

const Layout = ({
  children,
  onLogout,
  onBackToDashboard,
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
  activeMenuItem = 'dashboard',
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.neutral.white }}>
      {/* Header */}
      <Header onBackToDashboard={onBackToDashboard} activeMenuItem={activeMenuItem} />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden relative" style={{ overflowX: 'hidden' }}>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: colors.neutral.white }}>
          {children}
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
          onOpenTemplateManagement={onOpenTemplateManagement}
          activeMenuItem={activeMenuItem}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
