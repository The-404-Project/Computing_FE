import { useState } from 'react';
import { colors } from '../design-system/colors';

interface RegisterProps {
  onRegisterSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

const Register = ({ onRegisterSuccess, onNavigateToLogin }: RegisterProps) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ namaLengkap, email, password, konfirmasiPassword, role });
    // Call the callback to notify parent component
    if (onRegisterSuccess) {
      onRegisterSuccess();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-2 px-4 sm:py-4 sm:px-6" style={{ backgroundColor: colors.neutral.white }}>
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        {/* Header Section */}
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: colors.primary.main }}>
            SIPENA
          </h1>
          <p className="text-xs sm:text-sm font-normal" style={{ color: colors.primary.medium }}>
            Sistem Pengelolaan Naskah Akademik
          </p>
        </div>

        {/* Register Form Container */}
        <div
          className="w-full border rounded-lg overflow-hidden shadow-sm"
          style={{
            borderColor: '#e5e7eb',
            backgroundColor: colors.neutral.white,
          }}
        >
          {/* Form Header */}
          <div className="text-center py-3 sm:py-4 px-4 sm:px-6 border-b" style={{ borderColor: '#e5e7eb' }}>
            <h2 className="text-lg sm:text-xl font-bold mb-0.5" style={{ color: '#1f2937' }}>
              Daftar Akun Baru
            </h2>
            <p className="text-xs font-normal" style={{ color: '#6b7280' }}>
              Selamat Datang
            </p>
          </div>

          {/* Form Fields */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              {/* Nama Lengkap Field */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label htmlFor="namaLengkap" className="text-xs sm:text-sm font-semibold" style={{ color: '#374151' }}>
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="namaLengkap"
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan Nama Lengkap"
                    className="w-full bg-transparent border rounded pl-10 pr-3 py-2 text-sm outline-none transition-colors focus:border-gray-400"
                    style={{
                      borderColor: '#d1d5db',
                      color: '#111827',
                      backgroundColor: '#f9fafb',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label htmlFor="email" className="text-xs sm:text-sm font-semibold" style={{ color: '#374151' }}>
                  Email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@staff.telkomuniversity.ac.id"
                    className="w-full bg-transparent border rounded pl-10 pr-3 py-2 text-sm outline-none transition-colors focus:border-gray-400"
                    style={{
                      borderColor: '#d1d5db',
                      color: '#111827',
                      backgroundColor: '#f9fafb',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold" style={{ color: '#374151' }}>
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password"
                    className="w-full bg-transparent border rounded pl-10 pr-10 py-2 text-sm outline-none transition-colors focus:border-gray-400"
                    style={{
                      borderColor: '#d1d5db',
                      color: '#111827',
                      backgroundColor: '#f9fafb',
                    }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors" style={{ color: '#6b7280' }}>
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Field */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label htmlFor="konfirmasiPassword" className="text-xs sm:text-sm font-semibold" style={{ color: '#374151' }}>
                  Konfirmasi Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="konfirmasiPassword"
                    type={showKonfirmasiPassword ? 'text' : 'password'}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    placeholder="Konfirmasi Password"
                    className="w-full bg-transparent border rounded pl-10 pr-10 py-2 text-sm outline-none transition-colors focus:border-gray-400"
                    style={{
                      borderColor: '#d1d5db',
                      color: '#111827',
                      backgroundColor: '#f9fafb',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKonfirmasiPassword(!showKonfirmasiPassword)}
                    className="absolute right-2 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
                    style={{ color: '#6b7280' }}
                  >
                    {showKonfirmasiPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Role Field */}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label htmlFor="role" className="text-xs sm:text-sm font-semibold" style={{ color: '#374151' }}>
                  Role
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none z-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-transparent border rounded pl-10 pr-9 py-2 text-sm outline-none appearance-none cursor-pointer transition-colors focus:border-gray-400"
                    style={{
                      borderColor: '#d1d5db',
                      color: '#111827',
                      backgroundColor: '#f9fafb',
                    }}
                    required
                  >
                    <option value="" disabled>
                      Pilih Role Anda
                    </option>
                    <option value="admin">Admin</option>
                    <option value="dosen">Dosen</option>
                    <option value="mahasiswa">Mahasiswa</option>
                  </select>
                  <div className="absolute right-2 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full py-2.5 sm:py-3 font-semibold text-sm mt-2.5 rounded-lg transition-all hover:bg-gray-700 active:scale-[0.98]" style={{ backgroundColor: '#374151', color: colors.neutral.white }}>
                Daftar
              </button>
            </form>

            {/* Link to Login */}
            <div className="text-center mt-2.5">
              <p className="text-xs font-normal" style={{ color: '#6b7280' }}>
                Sudah punya akun?{' '}
                <button type="button" onClick={onNavigateToLogin} className="font-semibold hover:underline bg-transparent border-none cursor-pointer p-0" style={{ color: colors.primary.main }}>
                  Masuk
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
