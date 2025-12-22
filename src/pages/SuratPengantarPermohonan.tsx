import { useState, useEffect, type ChangeEvent } from 'react';
import { colors } from '../design-system/colors';
import api from '../services/api';

// --- Types & Interfaces ---

interface Student {
  nama: string;
  nim: string;
}

interface DateRange {
  start: string;
  end: string;
  deadline: string;
}

interface ContentBlock {
  pembuka: string;
  isi: string;
  penutup: string;
}

interface FormData {
  tujuanSurat: string;
  nomorSurat: string;
  lampiran: string;
  perihal: string;
  alamatTujuan: string;
  tembusan: string;
}

interface Template {
  template_id: number;
  template_name: string;
  template_type: string;
  file_path: string;
}

/**
 * Component: SuratPengantarPermohonan
 * Description: Main form for generating administrative letters (Magang, Penelitian, etc.).
 * Handles dynamic data inputs, file uploads, and interaction with the backend generation API.
 */
const SuratPengantarPermohonan = () => {
  
  // --- State Initialization ---
  
  const [formData, setFormData] = useState<FormData>({
    tujuanSurat: '',
    nomorSurat: '',
    lampiran: '', 
    perihal: '',
    alamatTujuan: '',
    tembusan: '',
  });

  const [content, setContent] = useState<ContentBlock>({
    pembuka: '',
    isi: '',
    penutup: ''
  });

  // Dynamic lists for students and date configuration
  const [students, setStudents] = useState<Student[]>([{ nama: '', nim: '' }]);
  const [dates, setDates] = useState<DateRange>({ start: '', end: '', deadline: '' });
  
  // UI States
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk template kustom
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch templates kustom untuk surat pengantar
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/dashboard/templates/by-type/surat_pengantar');
        setTemplates(response.data.templates || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  /**
   * Effect: Auto-Populate Template Content
   * Updates the 'Perihal' and content blocks automatically when the letter type changes.
   */
  useEffect(() => {
    let newPerihal = '';
    let newContent = { pembuka: '', isi: '', penutup: '' };

    switch (formData.tujuanSurat) {
      case 'pengantar_magang':
        newPerihal = 'Permohonan Kerja Praktek (Reguler)';
        newContent = {
          pembuka: "Sebagai bagian pada proses studi di Program S1 Informatika Fakultas Informatika Universitas Telkom, mahasiswa berikut ini:",
          isi: "Mohon mahasiswa tersebut dapat diberi ijin untuk melaksanakan Kerja Praktek (Reguler) di Instansi/Perusahaan yang Bapak/Ibu pimpin.",
          penutup: "Kami mohon surat balasan (diijinkan atau tidak) dapat kami terima sesuai tanggal batas waktu. Demikian kami sampaikan, atas perhatian dan kerjasamanya diucapkan terima kasih."
        };
        break;
      case 'pengantar_penelitian':
        newPerihal = 'Permohonan Izin Penelitian Skripsi';
        newContent = {
          pembuka: "Sehubungan dengan penyusunan Tugas Akhir mahasiswa Program Studi S1 Informatika, kami mohon bantuan Bapak/Ibu untuk memberikan izin pengambilan data.",
          isi: "Adapun data yang dibutuhkan akan digunakan semata-mata untuk kepentingan akademis.",
          penutup: "Demikian permohonan ini kami sampaikan. Atas bantuan dan kerjasamanya kami ucapkan terima kasih."
        };
        break;
      case 'permohonan_izin_kegiatan':
        newPerihal = 'Permohonan Izin Kegiatan Akademik';
        newContent = {
          pembuka: "Sehubungan dengan akan dilaksanakannya kegiatan mahasiswa...",
          isi: "Kami bermaksud memohon izin penggunaan tempat/fasilitas...",
          penutup: "Atas perhatian dan izin yang diberikan, kami ucapkan terima kasih."
        };
        break;
    }

    if (newPerihal) {
      setFormData(prev => ({ ...prev, perihal: newPerihal }));
      setContent(newContent);
    }
  }, [formData.tujuanSurat]);

  // --- Event Handlers ---

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Student List Handlers (Add, Remove, Update)
  const handleStudentChange = (index: number, field: keyof Student, value: string) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };
  
  const addStudent = () => setStudents([...students, { nama: '', nim: '' }]);
  
  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  /**
   * Helper: Formats YYYY-MM-DD string to Indonesian date format (e.g., 20 Januari 2025).
   */
  const formatDateIndo = (dateString: string) => {
    if (!dateString) return '-';
    // Split manually to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  /**
   * Constructs the payload object to match the backend expected structure.
   */
  const constructPayload = () => {
    return {
      jenis_surat: formData.tujuanSurat,
      metadata: {
        nomor_surat: formData.nomorSurat || "-", 
        lampiran: formData.lampiran || "-", 
        perihal: formData.perihal,
        alamat_array: formData.alamatTujuan.split('\n'),
        cc_array: formData.tembusan ? formData.tembusan.split(',').map(s => s.trim()) : [],
        lampiran_file: file ? file.name : "-" 
      },
      content_blocks: content,
      dynamic_data: {
        students: students,
        dates: {
          start: formatDateIndo(dates.start),
          end: formatDateIndo(dates.end),
          deadline: formatDateIndo(dates.deadline)
        }
      }
    };
  };

  /**
   * Submits the data to the backend API and handles the file download.
   */
  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!formData.tujuanSurat) {
      alert("Mohon pilih Tujuan Surat terlebih dahulu!");
      return;
    }

    try {
      setIsLoading(true);
      const payload = constructPayload();
      
      // Ensure the port matches your backend server
      const endpoint = `http://localhost:4000/api/surat-pengantar/generate?format=${format}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.message || 'Failed to generate document');
      }

      // Convert response to Blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const cleanPerihal = formData.perihal.replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Surat_${cleanPerihal}_${Date.now()}.${format}`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Export Error:', error);
      alert(`Gagal: ${error.message}\nPastikan backend jalan di port 4000.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isStudentDataNeeded = 
    formData.tujuanSurat === 'pengantar_magang' || 
    formData.tujuanSurat === 'pengantar_penelitian';

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8" style={{ backgroundColor: colors.neutral.white }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-6 md:mb-8 pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:mx-20 mx-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.primary.dark }}>
                Buat Surat Pengantar & Permohonan
              </h1>
              <p className="mt-1 text-sm sm:text-base font-normal" style={{ color: colors.primary.medium }}>
                Isi formulir di bawah ini untuk membuat surat secara otomatis.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleExport('docx')}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-gray-700 disabled:bg-gray-400"
                style={{ backgroundColor: '#2563EB', color: 'white' }}
              >
                <FileIcon />
                {isLoading ? 'Loading...' : 'Export DOCX'}
              </button>
              
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-gray-700 disabled:bg-gray-400"
                style={{ backgroundColor: '#DC2626', color: 'white' }}
              >
                <FileIcon />
                {isLoading ? 'Converting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <form className="space-y-6 md:space-y-8 md:mx-30 mx-20" onSubmit={(e) => e.preventDefault()}>
          
          <FormSection title="Informasi Dasar Surat">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <TextField
                id="tujuanSurat"
                name="tujuanSurat"
                label="Jenis / Tujuan Surat"
                value={formData.tujuanSurat}
                onChange={handleChange}
                as="select"
                required
              >
                <option value="" disabled>Pilih Jenis Surat</option>
                <option value="pengantar_magang">Surat Pengantar Magang (KP)</option>
                <option value="pengantar_penelitian">Surat Pengantar Penelitian</option>
                <option value="permohonan_izin_kegiatan">Surat Izin Kegiatan</option>
                <option value="permohonan_kerjasama">Surat Permohonan Kerjasama</option>
                
                {/* Template Kustom dari Database */}
                {templates.length > 0 && (
                  <>
                    <optgroup label="Template Kustom">
                      {templates.map((template) => (
                        <option key={template.template_id} value={`template_${template.template_id}`}>
                          {template.template_name}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </TextField>

              <TextField
                id="nomorSurat"
                name="nomorSurat"
                label="Nomor Surat (Manual)"
                value={formData.nomorSurat}
                onChange={handleChange}
                placeholder="Contoh: 001/AKD/2025"
                required
              />
            </div>

            <div className="mt-4">
               <TextField
                id="lampiran"
                name="lampiran"
                label="Lampiran"
                value={formData.lampiran}
                onChange={handleChange}
                placeholder="Contoh: 1 (satu) Berkas Proposal"
                required
              />
            </div>

            <div className="mt-4">
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

            <div className="mt-4">
                <TextField
                    id="alamatTujuan"
                    name="alamatTujuan"
                    label="Alamat Tujuan"
                    value={formData.alamatTujuan}
                    onChange={handleChange}
                    as="textarea"
                    rows={4}
                    placeholder={`Yth. Bapak/Ibu [Nama]\n[Jabatan]\n[Nama Instansi]\n[Alamat Lengkap]`}
                    className="font-mono text-sm"
                    required
                />
            </div>
          </FormSection>

          {/* Dynamic Section: Students & Dates */}
          {isStudentDataNeeded && (
            <div className="w-full border rounded-lg overflow-hidden shadow-sm bg-blue-50 border-blue-200">
              <div className="text-left py-4 px-4 sm:px-6 border-b border-blue-200">
                <h2 className="text-lg font-semibold text-blue-800">Data Mahasiswa & Waktu</h2>
              </div>
              <div className="px-4 sm:px-6 py-5 space-y-4">
                
                {/* Student List */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Daftar Mahasiswa</label>
                  {students.map((student, idx) => (
                    <div key={idx} className="flex gap-3 mb-2">
                      <div className="w-1/3">
                         <input 
                           placeholder="NIM" 
                           className="w-full border rounded px-3 py-2 text-sm"
                           value={student.nim}
                           onChange={e => handleStudentChange(idx, 'nim', e.target.value)}
                         />
                      </div>
                      <div className="w-2/3 flex gap-2">
                         <input 
                           placeholder="Nama Lengkap" 
                           className="w-full border rounded px-3 py-2 text-sm"
                           value={student.nama}
                           onChange={e => handleStudentChange(idx, 'nama', e.target.value)}
                         />
                         {students.length > 1 && (
                            <button type="button" onClick={() => removeStudent(idx)} className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
                         )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addStudent} className="text-sm text-blue-600 font-medium hover:underline mt-1">
                    + Tambah Mahasiswa Lain
                  </button>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-100">
                   <div>
                     <label className="text-xs font-semibold text-gray-600 block mb-1">Tanggal Mulai</label>
                     <input type="date" className="w-full border rounded p-2 text-sm" onChange={e => setDates({...dates, start: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-gray-600 block mb-1">Tanggal Selesai</label>
                     <input type="date" className="w-full border rounded p-2 text-sm" onChange={e => setDates({...dates, end: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-gray-600 block mb-1">Batas Waktu Balasan</label>
                     <input type="date" className="w-full border rounded p-2 text-sm" onChange={e => setDates({...dates, deadline: e.target.value})} />
                   </div>
                </div>
              </div>
            </div>
          )}

          <FormSection title="Konten Surat (Dapat Diedit)">
            <TextField
              id="pembuka"
              name="pembuka"
              label="Paragraf Pembuka"
              value={content.pembuka}
              onChange={handleContentChange}
              as="textarea"
              rows={3}
            />
            <TextField
              id="isi"
              name="isi"
              label="Detail Permohonan (Isi Utama)"
              value={content.isi}
              onChange={handleContentChange}
              as="textarea"
              rows={4}
            />
            <TextField
              id="penutup"
              name="penutup"
              label="Paragraf Penutup"
              value={content.penutup}
              onChange={handleContentChange}
              as="textarea"
              rows={3}
            />
          </FormSection>

          <FormSection title="Lampiran & Tambahan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* File Upload Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: '#374151' }}>Dokumen Pendukung</label>
                <div className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg bg-gray-50 border-gray-300">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <UploadIcon />
                      {file ? (
                        <p className="font-semibold text-sm mt-2">{file.name}</p>
                      ) : (
                        <><p className="mb-1 text-sm text-gray-500 font-semibold">Klik untuk unggah</p><p className="text-xs text-gray-500">PDF, DOCX (MAX. 5MB)</p></>
                      )}
                    </div>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.jpg" />
                  </label>
                </div>
              </div>

              <TextField
                id="tembusan"
                name="tembusan"
                label="Tembusan (CC)"
                value={formData.tembusan}
                onChange={handleChange}
                as="textarea"
                placeholder="Kaprodi S1 Informatika, Dosen Wali..."
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

// --- Helper Components & Icons ---

interface FormSectionProps { title: string; children: React.ReactNode; }
const FormSection = ({ title, children }: FormSectionProps) => (
  <div className="w-full border rounded-lg overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
    <div className="text-left py-4 px-4 sm:px-6 border-b" style={{ borderColor: '#e5e7eb' }}>
      <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#1f2937' }}>{title}</h2>
    </div>
    <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-4">{children}</div>
  </div>
);

type InputProps = { id: string; name: string; label: string; as?: 'input' | 'textarea' | 'select'; children?: React.ReactNode; className?: string; } & (React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement> | React.SelectHTMLAttributes<HTMLSelectElement>);
const TextField = ({ id, name, label, as = 'input', children, className = '', ...props }: InputProps) => {
  const commonProps = {
    id, name,
    className: `w-full bg-transparent border rounded px-3 py-2.5 text-sm outline-none transition-colors focus:border-gray-400 ${className}`,
    style: { borderColor: '#d1d5db', color: '#111827', backgroundColor: '#f9fafb' },
    ...props,
  };
  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <label htmlFor={id} className="text-sm font-semibold" style={{ color: '#374151' }}>{label}</label>
      <div className="relative flex items-center">
        {as === 'input' && <input {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)} />}
        {as === 'textarea' && <textarea {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />}
        {as === 'select' && (
          <>
            <select {...(commonProps as React.SelectHTMLAttributes<HTMLSelectElement>)} className={`${commonProps.className} appearance-none pr-9`}>{children}</select>
            <div className="absolute right-3 flex items-center pointer-events-none"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></div>
          </>
        )}
      </div>
    </div>
  );
};

const FileIcon = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>);
const UploadIcon = () => (<svg className="w-8 h-8 mb-3 text-gray-500" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>);