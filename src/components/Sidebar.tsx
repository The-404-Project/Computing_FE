import { useState } from 'react';
import { colors } from '../design-system/colors';
import { LayoutDashboard, Archive, UserCog, LogOut, ChevronRight, ChevronDown, Building2, GraduationCap, Award, FileText } from 'lucide-react';

interface SidebarProps {
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
  activeMenuItem?: string;
}

const Sidebar = ({
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
  activeMenuItem = 'dashboard',
}: SidebarProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    suratFakultas: true,
    suratProdi: true,
    suratLaak: true,
  });

  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  // Calculate toggle button position (sejajar dengan Dashboard item)
  // p-4 (1rem) + header text height (~1.5rem) + mb-4 (1rem) + py-2.5 (0.625rem) = ~4.125rem from sidebar top
  const toggleButtonTop = '4.125rem';

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      {/* Toggle Button - Di luar sidebar, menjorok ke kiri (Saat Sidebar Terbuka) */}
      {isSidebarOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen(false);
          }}
          className="absolute flex items-center justify-center rounded-r-lg transition-all shadow-lg hover:shadow-xl hover:opacity-90 cursor-pointer"
          style={{
            left: '-32px',
            top: toggleButtonTop,
            width: '32px',
            height: '40px',
            backgroundColor: colors.primary.main,
            color: '#ffffff',
            zIndex: 100,
          }}
          aria-label="Tutup Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Toggle Button - Saat Sidebar Tertutup (Muncul di ujung kanan layar agar terlihat) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed flex items-center justify-center rounded-l-lg shadow-lg transition-all hover:shadow-xl hover:opacity-90 cursor-pointer"
          style={{
            right: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '40px',
            backgroundColor: colors.primary.main,
            color: '#ffffff',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
          aria-label="Buka Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className="relative shrink-0 border-l transition-all duration-300 flex flex-col"
        style={{
          backgroundColor: '#f3f4f6',
          borderColor: '#e5e7eb',
          width: isSidebarOpen ? '16rem' : '0',
          overflow: isSidebarOpen ? 'hidden' : 'hidden',
          minWidth: isSidebarOpen ? '16rem' : '0',
          height: '100%',
        }}
      >
        {isSidebarOpen && (
          <div className="p-4 relative flex flex-col h-full">
            {/* Navigation Menu Items - Diklasifikasikan berdasarkan jenis surat */}
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {/* Dashboard */}
              <div>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeMenuItem === 'dashboard' ? '' : 'hover:bg-white'}`}
                  style={{
                    backgroundColor: activeMenuItem === 'dashboard' ? '#d3d3d3' : 'transparent',
                    color: '#1f2937',
                  }}
                >
                  <LayoutDashboard className="w-5 h-5" style={{ color: colors.primary.main }} />
                  <span className="font-medium">Dashboard</span>
                </button>
              </div>

              {/* Surat Fakultas (Modul 1-5) */}
              <div>
                <button
                  onClick={() => setExpandedMenus({ ...expandedMenus, suratFakultas: !expandedMenus.suratFakultas })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white"
                  style={{ color: '#1f2937' }}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5" style={{ color: colors.primary.main }} />
                    <span className="font-semibold text-sm">Surat Fakultas</span>
                  </div>
                  {expandedMenus.suratFakultas ? <ChevronDown className="w-4 h-4" style={{ color: colors.primary.main }} /> : <ChevronRight className="w-4 h-4" style={{ color: colors.primary.main }} />}
                </button>
                {expandedMenus.suratFakultas && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: colors.primary.light }}>
                    <button
                      onClick={onOpenSuratTugas}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_tugas' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat Tugas & Surat Perintah</span>
                    </button>
                    <button
                      onClick={onOpenSuratUndangan}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_undangan' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat Undangan</span>
                    </button>
                    <button
                      onClick={onOpenSuratKeterangan}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_keterangan' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat Keterangan</span>
                    </button>
                    <button
                      onClick={onOpenSuratPengantar}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_pengantar' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat Pengantar & Permohonan</span>
                    </button>
                    <button
                      onClick={onOpenSuratKeputusan}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_keputusan' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat Keputusan (SK) & Edaran</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Surat Program Studi (Modul 6) */}
              <div>
                <button
                  onClick={() => setExpandedMenus({ ...expandedMenus, suratProdi: !expandedMenus.suratProdi })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white"
                  style={{ color: '#1f2937' }}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5" style={{ color: colors.primary.main }} />
                    <span className="font-semibold text-sm">Surat Program Studi</span>
                  </div>
                  {expandedMenus.suratProdi ? <ChevronDown className="w-4 h-4" style={{ color: colors.primary.main }} /> : <ChevronRight className="w-4 h-4" style={{ color: colors.primary.main }} />}
                </button>
                {expandedMenus.suratProdi && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: colors.primary.light }}>
                    <button
                      onClick={onOpenSuratProdi}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_prodi' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat Program Studi</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Surat LAAK (Modul 7) */}
              <div>
                <button
                  onClick={() => setExpandedMenus({ ...expandedMenus, suratLaak: !expandedMenus.suratLaak })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white"
                  style={{ color: '#1f2937' }}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5" style={{ color: colors.primary.main }} />
                    <span className="font-semibold text-sm">Surat LAAK</span>
                  </div>
                  {expandedMenus.suratLaak ? <ChevronDown className="w-4 h-4" style={{ color: colors.primary.main }} /> : <ChevronRight className="w-4 h-4" style={{ color: colors.primary.main }} />}
                </button>
                {expandedMenus.suratLaak && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: colors.primary.light }}>
                    <button
                      onClick={onOpenSuratLaak}
                      className="w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'surat_laak' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <span className="text-sm">Surat LAAK (Akreditasi & Audit)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Management System */}
              <div className="pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                <div className="space-y-1">
                  <button
                    onClick={onOpenArsipSurat}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white"
                    style={{
                      color: '#1f2937',
                      backgroundColor: activeMenuItem === 'arsip_surat' ? '#d3d3d3' : 'transparent',
                    }}
                  >
                    <Archive className="w-5 h-5" style={{ color: colors.primary.main }} />
                    <span className="font-semibold text-sm">Arsip Surat</span>
                  </button>
                  {isAdmin && onOpenAdmin && (
                    <button
                      onClick={onOpenAdmin}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'admin' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <UserCog className="w-5 h-5" style={{ color: colors.primary.main }} />
                      <span className="font-semibold text-sm">Manajemen User</span>
                    </button>
                  )}
                  {isAdmin && onOpenTemplateManagement && (
                    <button
                      onClick={onOpenTemplateManagement}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white"
                      style={{
                        color: '#1f2937',
                        backgroundColor: activeMenuItem === 'template_management' ? '#d3d3d3' : 'transparent',
                      }}
                    >
                      <FileText className="w-5 h-5" style={{ color: colors.primary.main }} />
                      <span className="font-semibold text-sm">Manajemen Template</span>
                    </button>
                  )}
                </div>
              </div>
            </nav>

            {/* Logout Button - Sticky di bawah */}
            <div className="mt-auto pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white" style={{ backgroundColor: colors.primary.dark, color: '#ffffff' }}>
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Sidebar;
