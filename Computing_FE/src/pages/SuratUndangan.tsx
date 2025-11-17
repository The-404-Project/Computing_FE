import { useState, type ChangeEvent } from 'react';
import { colors } from '../design-system/colors';

interface Recipient {
  id: number;
  name: string;
  position: string;
}

const SuratUndangan = () => {
  const [jenisAcara, setJenisAcara] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [agenda, setAgenda] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPosition, setNewRecipientPosition] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'jenisAcara':
        setJenisAcara(value);
        break;
      case 'lokasi':
        setLokasi(value);
        break;
      case 'tanggal':
        setTanggal(value);
        break;
      case 'waktu':
        setWaktu(value);
        break;
      case 'agenda':
        setAgenda(value);
        break;
      case 'newRecipientName':
        setNewRecipientName(value);
        break;
      case 'newRecipientPosition':
        setNewRecipientPosition(value);
        break;
    }
  };

  const handleAddRecipient = () => {
    if (newRecipientName.trim() && newRecipientPosition.trim()) {
      setRecipients([
        ...recipients,
        {
          id: Date.now(),
          name: newRecipientName.trim(),
          position: newRecipientPosition.trim(),
        },
      ]);
      setNewRecipientName('');
      setNewRecipientPosition('');
    }
  };

  return (
    <div
      className="min-h-screen w-full p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: colors.neutral.white }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.primary.dark }}>
                Buat Surat Undangan Baru
              </h1>
              <p className="mt-1 text-sm sm:text-base font-normal" style={{ color: colors.primary.medium }}>
                Isi detail di bawah untuk membuat dan mengekspor surat undangan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                className="text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: colors.primary.medium }}
              >
                Simpan Draft
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: colors.primary.main, color: colors.neutral.white }}
              >
                Export PDF Per Undangan
              </button>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                style={{ backgroundColor: colors.primary.main, color: colors.neutral.white }}
              >
                Export PDF Semua
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Detail Acara">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  id="jenisAcara"
                  name="jenisAcara"
                  label="Jenis Acara"
                  value={jenisAcara}
                  onChange={handleChange}
                  as="select"
                  required
                >
                  <option value="" disabled>Pilih Jenis Acara</option>
                  <option value="rapat">Rapat</option>
                  <option value="seminar">Seminar</option>
                  <option value="kegiatan_akademik">Kegiatan Akademik</option>
                </TextField>
                <TextField
                  id="lokasi"
                  name="lokasi"
                  label="Lokasi"
                  value={lokasi}
                  onChange={handleChange}
                  placeholder="Contoh: Gedung Serba Guna"
                  required
                />
                <div className="relative">
                  <TextField
                    id="tanggal"
                    name="tanggal"
                    label="Tanggal"
                    type="date"
                    value={tanggal}
                    onChange={handleChange}
                    required
                  />
                  
                </div>
                <div className="relative">
                  <TextField
                    id="waktu"
                    name="waktu"
                    label="Waktu"
                    type="time"
                    value={waktu}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <TextField
                id="agenda"
                name="agenda"
                label="Agenda"
                value={agenda}
                onChange={handleChange}
                as="textarea"
                rows={4}
                placeholder="Tuliskan agenda acara di sini..."
                required
              />
            </FormSection>
          </div>

          {/* Right Column - Templates */}
          <div className="lg:col-span-1">
            <FormSection title="Pilih Template Surat">
              <div className="grid grid-cols-3 gap-4">
                <TemplateCard
                  title="Formal"
                  isSelected={selectedTemplate === 'formal'}
                  onClick={() => setSelectedTemplate('formal')}
                />
                <TemplateCard
                  title="Seminar"
                  isSelected={selectedTemplate === 'seminar'}
                  onClick={() => setSelectedTemplate('seminar')}
                />
                <TemplateCard
                  title="Rapat"
                  isSelected={selectedTemplate === 'rapat'}
                  onClick={() => setSelectedTemplate('rapat')}
                />
              </div>
            </FormSection>
          </div>
        </div>

        {/* Bottom Section - Recipients */}
        <div className="mt-8">
          <hr className="my-6" style={{ borderColor: '#e5e7eb' }} />
          <h2 className="text-xl font-semibold" style={{ color: colors.primary.dark }}>Daftar Undangan</h2>
          <div className="flex items-end gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4 flex-grow">
              <TextField
                id="newRecipientName"
                name="newRecipientName"
                label="Nama Lengkap"
                value={newRecipientName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              <TextField
                id="newRecipientPosition"
                name="newRecipientPosition"
                label="Jabatan/Afiliasi"
                value={newRecipientPosition}
                onChange={handleChange}
                placeholder="Mahasiswa"
              />
            </div>
            <button
              type="button"
              onClick={handleAddRecipient}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
              style={{ backgroundColor: colors.primary.main }}
            >
              Tambah
            </button>
          </div>
          <h3 className="mt-6 text-md font-semibold" style={{ color: colors.primary.medium }}>
            Penerima Surat ({recipients.length})
          </h3>
          <div className="mt-4 border rounded-lg" style={{ borderColor: '#e5e7eb' }}>
            <ul className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {recipients.length > 0 ? (
                recipients.map((recipient) => (
                  <li key={recipient.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold" style={{ color: colors.primary.dark }}>{recipient.name}</p>
                      <p className="text-sm" style={{ color: colors.primary.medium }}>{recipient.position}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-10 text-center text-sm" style={{ color: colors.primary.medium }}>
                  Belum ada penerima yang ditambahkan.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ title, children }: FormSectionProps) => (
  <div
    className="w-full border rounded-lg overflow-hidden shadow-sm"
    style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}
  >
    <div className="text-left py-4 px-6 border-b" style={{ borderColor: '#e5e7eb' }}>
      <h2 className="text-lg font-semibold" style={{ color: '#1f2937' }}>
        {title}
      </h2>
    </div>
    <div className="p-6 space-y-4">{children}</div>
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
  React.InputHTMLAttributes<HTMLInputElement> |
  React.TextareaHTMLAttributes<HTMLTextAreaElement> |
  React.SelectHTMLAttributes<HTMLSelectElement>
);

const TextField = ({ id, name, label, as = 'input', children, className = '', ...props }: InputProps) => {
  const commonProps = {
    id,
    name,
    className: `w-full bg-transparent border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:border-gray-400 ${className}`,
    style: {
      borderColor: '#d1d5db',
      color: '#111827',
      backgroundColor: '#f9fafb',
    },
    ...props,
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: colors.primary.medium }}>
        {label}
      </label>
      <div className="relative flex items-center">
        {as === 'input' && <input {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)} />}
        {as === 'textarea' && <textarea {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />}
        {as === 'select' && (
          <>
            <select {...(commonProps as React.SelectHTMLAttributes<HTMLSelectElement>)} className={`${commonProps.className} appearance-none pr-9`}>
              {children}
            </select>
            <div className="absolute right-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface TemplateCardProps {
  title: string;
  isSelected: boolean;
  onClick: () => void;
}

const TemplateCard = ({ title, isSelected, onClick }: TemplateCardProps) => (
  <div
    onClick={onClick}
    className={`h-24 border-2 rounded-lg cursor-pointer flex items-center justify-center text-center p-2 transition-all ${
      isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
    }`}
    style={{
        borderColor: isSelected ? colors.primary.main : '#d1d5db',
        backgroundColor: isSelected ? '#FFFBEB' : '#f9fafb'
    }}
  >
    <p className="text-sm font-semibold" style={{ color: isSelected ? colors.primary.main : colors.primary.dark }}>
      {title}
    </p>
  </div>
);

// --- Icon Components ---
const CalendarIcon = () => (
  <svg className="w-5 h-5" style={{ color: colors.primary.medium }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" style={{ color: colors.primary.medium }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default SuratUndangan;
