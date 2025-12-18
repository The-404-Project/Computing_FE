import { useState, useEffect } from 'react';
import { colors } from '../design-system/colors';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'kaprodi' | 'dekan';
  full_name: string | null;
  email: string | null;
}

interface AdminPageProps {
  onBack?: () => void;
}

const AdminPage = ({ onBack }: AdminPageProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' as User['role'],
    full_name: '',
    email: '',
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/dashboard/users');
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengambil data users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Prepare data for submission
      const submitData: any = {
        username: formData.username,
        role: formData.role,
        full_name: formData.full_name || null,
        email: formData.email || null,
      };

      // Only include password if it's provided (for create) or if it's not empty (for update)
      if (!editingUser) {
        // Create: password is required
        if (!formData.password) {
          setError('Password wajib diisi');
          return;
        }
        submitData.password = formData.password;
      } else {
        // Update: only include password if it's not empty
        if (formData.password && formData.password.trim() !== '') {
          submitData.password = formData.password;
        }
      }

      if (editingUser) {
        // Update user
        await api.put(`/dashboard/users/${editingUser.id}`, submitData);
      } else {
        // Create user
        await api.post('/dashboard/users', submitData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'staff', full_name: '', email: '' });
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menyimpan user';
      setError(errorMessage);
      console.error('Submit error:', err);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/dashboard/users/${userToDelete}`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menghapus user';
      setError(errorMessage);
      console.error('Delete error:', err);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  // Open edit modal
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      full_name: user.full_name || '',
      email: user.email || '',
    });
    setShowModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'staff', full_name: '', email: '' });
    setShowModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'kaprodi':
        return 'bg-blue-100 text-blue-800';
      case 'dekan':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral.white }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: '#e5e7eb', backgroundColor: colors.neutral.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: colors.primary.main }}>
                Manajemen User
              </h1>
              <p className="text-xs sm:text-sm font-normal mt-1" style={{ color: colors.primary.medium }}>
                Kelola pengguna sistem
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold rounded-lg transition-all" style={{ backgroundColor: colors.primary.main, color: colors.neutral.white }}>
                + Tambah User
              </button>
              {onBack && (
                <button onClick={onBack} className="px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:bg-gray-100" style={{ color: '#374151', border: '1px solid #d1d5db' }}>
                  Kembali
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

        {/* Users Table */}
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#6b7280' }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center" style={{ color: '#6b7280' }}>
                      Memuat data...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center" style={{ color: '#6b7280' }}>
                      Tidak ada data user
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t" style={{ borderColor: '#e5e7eb' }}>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#1f2937' }}>
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                        {user.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>
                        {user.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(user.role)}`}>{user.role.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(user)} className="text-sm font-semibold px-3 py-1 rounded transition-colors" style={{ color: colors.primary.main, backgroundColor: '#f0f9ff' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteClick(user.id)} className="text-sm font-semibold px-3 py-1 rounded transition-colors text-red-600 hover:bg-red-50">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Popup Form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#1f2937' }}>
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                style={{ lineHeight: '1' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#d1d5db' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Password {editingUser ? '(kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#d1d5db' }}
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#d1d5db' }}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="kaprodi">Kaprodi</option>
                  <option value="dekan">Dekan</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90" style={{ backgroundColor: colors.primary.main }}>
                  {editingUser ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db', color: '#374151' }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#1f2937' }}>
                Konfirmasi Hapus
              </h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                style={{ lineHeight: '1' }}
              >
                ×
              </button>
            </div>
            <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
              Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all hover:opacity-90" style={{ backgroundColor: '#dc2626' }}>
                Hapus
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-gray-50"
                style={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
