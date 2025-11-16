import { useState, type ChangeEvent } from 'react';
import { colors } from '../design-system/colors';

interface FormData {
  tujuanSurat: string;
  perihal: string;
  alamatTujuan: string;
  paragrafPembuka: string;
  detailPermohonan: string;
  paragrafPenutup: string;
  tembusan: string;
}

const SuratPengantarPermohonan = () => {
  const [formData, setFormData] = useState<FormData>({
    tujuanSurat: '',
    perihal: '',
    alamatTujuan: `Yth. Bapak/Ibu [Nama Pimpinan]
[Jabatan]
[Nama Instansi/Perusahaan]
[Alamat Lengkap]`,
    paragrafPembuka: 'Dengan hormat, sehubungan dengan...',
    detailPermohonan: 'Adapun tujuan dari permohonan ini adalah untuk...',
    paragrafPenutup:
      'Demikian surat permohonan ini kami sampaikan. Atas perhatian Bapak/Ibu, kami ucapkan terima kasih.',
    tembusan: '',
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSimpanDraft = () => {
    console.log('Menyimpan Draft:', { formData, file });
  };

  const handleExportPDF = () => {
    console.log('Export PDF:', { formData, file });
  };

  const handleExportDOCX = () => {
    console.log('Export DOCX:', { formData, file });
  };

  return (
    <div
      className="min-h-screen w-full p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: colors.neutral.white }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:mx-20 mx-10">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: colors.primary.dark }}
              >
                Buat Surat Pengantar & Permohonan
              </h1>
              <p
                className="mt-1 text-sm sm:text-base font-normal"
                style={{ color: colors.primary.medium }}
              >
                Isi formulir di bawah ini untuk membuat surat secara otomatis.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSimpanDraft}
                className="text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: colors.primary.medium }}
              >
                Simpan Draft
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-gray-700 active:scale-[0.98]"
                style={{
                  backgroundColor: '#374151',
                  color: colors.neutral.white,
                }}
              >
                <FileIcon />
                Export PDF
              </button>
              <button
                type="button"
                onClick={handleExportDOCX}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-gray-700 active:scale-[0.98]"
                style={{
                  backgroundColor: '#374151',
                  color: colors.neutral.white,
                }}
              >
                <FileIcon />
                Export DOCX
              </button>
            </div>
          </div>
        </header>

        <form className="space-y-6 md:space-y-8 md:mx-30 mx-20">
          <FormSection title="Informasi Dasar Surat">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <TextField
                id="tujuanSurat"
                name="tujuanSurat"
                label="Tujuan Surat"
                value={formData.tujuanSurat}
                onChange={handleChange}
                as="select"
                required
              >
                <option value="" disabled>
                  Pilih Tujuan Surat
                </option>
                <option value="pengantar_penelitian">Surat Pengantar Penelitian</option>
                <option value="pengantar_magang">Surat Pengantar Magang</option>
                <option value="permohonan_izin_kegiatan">Surat Permohonan Izin Kegiatan</option>
                <option value="permohonan_kerjasama">Surat Permohonan Kerjasama</option>
              </TextField>

              <TextField
                id="perihal"
                name="perihal"
                label="Perihal"
                value={formData.perihal}
                onChange={handleChange}
                placeholder="Contoh: Permohonan Izin Penelitian Skripsi"
                required
              />
            </div>

            <TextField
              id="alamatTujuan"
              name="alamatTujuan"
              label="Alamat Tujuan"
              value={formData.alamatTujuan}
              onChange={handleChange}
              as="textarea"
              rows={5}
              className="font-mono"
              required
            />
          </FormSection>

          <FormSection title="Konten Surat">
            <TextField
              id="paragrafPembuka"
              name="paragrafPembuka"
              label="Paragraf Pembuka"
              value={formData.paragrafPembuka}
              onChange={handleChange}
              as="textarea"
              rows={3}
              required
            />
            <TextField
              id="detailPermohonan"
              name="detailPermohonan"
              label="Detail Permohonan (Isi)"
              value={formData.detailPermohonan}
              onChange={handleChange}
              as="textarea"
              rows={5}
              required
            />
            <TextField
              id="paragrafPenutup"
              name="paragrafPenutup"
              label="Paragraf Penutup"
              value={formData.paragrafPenutup}
              onChange={handleChange}
              as="textarea"
              rows={3}
              required
            />
          </FormSection>

          <FormSection title="Lampiran & Tambahan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold"
                  style={{ color: '#374151' }}
                >
                  Dokumen Pendukung
                </label>
                <div
                  className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg"
                  style={{
                    borderColor: '#d1d5db',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <UploadIcon />
                      {file ? (
                        <p
                          className="font-semibold text-sm mt-2"
                          style={{ color: '#1f2937' }}
                        >
                          {file.name}
                        </p>
                      ) : (
                        <>
                          <p
                            className="mb-1 text-sm"
                            style={{ color: '#6b7280' }}
                          >
                            <span className="font-semibold">
                              Klik untuk unggah
                            </span>{' '}
                            atau seret file
                          </p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>
                            PDF, DOCX, JPG (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>

              <TextField
                id="tembusan"
                name="tembusan"
                label="Tembusan (CC) (Opsional)"
                value={formData.tembusan}
                onChange={handleChange}
                as="textarea"
                placeholder="Masukkan nama atau jabatan, pisahkan dengan koma"
                className="h-48"
              />
            </div>
          </FormSection>
          <div className='mt-15'></div>
        </form>
      </div>
    </div>
  );
};

export default SuratPengantarPermohonan;

// --- Helper Components ---
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => (
  <div
    className="w-full border rounded-lg overflow-hidden shadow-sm"
    style={{
      borderColor: '#e5e7eb',
      backgroundColor: colors.neutral.white,
    }}
  >
    <div
      className="text-left py-4 px-4 sm:px-6 border-b"
      style={{ borderColor: '#e5e7eb' }}
    >
      <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#1f2937' }}>
        {title}
      </h2>
    </div>
    <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-4">{children}</div>
  </div>
);

type InputProps = {
  id: string;
  name: string;
  label: string;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode;
  className?: string;
} & (
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>
  | React.SelectHTMLAttributes<HTMLSelectElement>
);

const TextField = ({
  id,
  name,
  label,
  as = 'input',
  children,
  className = '',
  ...props
}: InputProps) => {
  const commonProps = {
    id,
    name,
    className: `w-full bg-transparent border rounded px-3 py-2.5 text-sm outline-none transition-colors focus:border-gray-400 ${className}`,
    style: {
      borderColor: '#d1d5db',
      color: '#111827',
      backgroundColor: '#f9fafb',
    },
    ...props,
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: '#374151' }}>
        {label}
      </label>
      <div className="relative flex items-center">
        {as === 'input' && (
          <input {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)} />
        )}
        {as === 'textarea' && (
          <textarea
            {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )}
        {as === 'select' && (
          <>
            <select
              {...(commonProps as React.SelectHTMLAttributes<HTMLSelectElement>)}
              className={`${commonProps.className} appearance-none pr-9`}
            >
              {children}
            </select>
            <div className="absolute right-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#6b7280' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Icon Components ---

const FileIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const UploadIcon = () => (
  <svg
    className="w-8 h-8 mb-3"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 16"
    style={{ color: '#6b7280' }}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
    />
  </svg>
);