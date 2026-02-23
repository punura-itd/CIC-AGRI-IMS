import { useEffect, useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Button from '../button';
import AddUserModal, { type UserFormData } from '../modals/AddUserModal';
import ViewUserModal from '../modals/ViewUserModal';
import EditUserModal from '../modals/EditUserModal';
import { createUser, deleteUser, getUsers, updateUser } from '../../api/users';
import { useAuth } from '../../context/AuthContext';



interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  phone?: string;
  joinDate?: string;
  lastLogin?: string;
  permissions?: string;
}

const UsersPanel = () => {
  const { hasPermission, isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      console.log('UsersPanel useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
      
      if (!isAuthenticated || !user) {
        console.log('Not authenticated or no user, skipping fetch');
        setLoading(false);
        return;
      }

      console.log('Attempting to fetch users...');
      try {
        const data = await getUsers();
        console.log('Users fetched successfully:', data);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <div className="p-4 text-slate-600">Please log in to view users.</div>;
  if (loading) return <div className="p-4 text-slate-600">Loading users...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'administrator': return 'Administrator';
      case 'manager': return 'Manager';
      case 'employee': return 'Employee';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  const getDepartmentLabel = (department: string): string => {
    switch (department) {
      case 'it': return 'IT Department';
      case 'hr': return 'Human Resources';
      case 'finance': return 'Finance';
      case 'operations': return 'Operations';
      case 'marketing': return 'Marketing';
      default: return department;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getRoleLabel(user.role).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getDepartmentLabel(user.department).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async (userData: UserFormData) => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...userData,
      lastLogin: new Date().toISOString(),
      permissions: userData.role === 'administrator' ? 'System Settings' :
                   userData.role === 'manager' ? 'User Management' :
                   userData.role === 'employee' ? 'Asset Management' : 'View Only'
    };
    const insertUser: Partial<User> = {
      ...userData,
      lastLogin: new Date().toISOString(),
      permissions: userData.role === 'administrator' ? 'System Settings' :
                   userData.role === 'manager' ? 'User Management' :
                   userData.role === 'employee' ? 'Asset Management' : 'View Only'
    };
    await createUser(insertUser);
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const { id, ...userToUpdate } = updatedUser;
    await updateUser(updatedUser.id, userToUpdate);
    setUsers(prev => prev.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">Users</h2>
          {hasPermission('create_users') && (
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="sm:w-auto">
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Users className="text-slate-400" size={24} />
          </div>
          <h3 className="font-medium text-slate-800 mb-1">No Users Found</h3>
          <p className="text-slate-500 mb-4">
            {searchQuery ? 'No users match your search criteria' : 'Get started by adding your first user'}
          </p>
          {hasPermission('create_users') && (
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add User
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{user.name}</p>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{getRoleLabel(user.role)}</td>
                    <td className="py-3 px-4 text-slate-600">{getDepartmentLabel(user.department)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {hasPermission('update_users') && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}
                        {hasPermission('delete_users') && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{user.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Role</span>
                    <span className="font-medium text-slate-800">{getRoleLabel(user.role)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Department</span>
                    <span className="font-medium text-slate-800">{getDepartmentLabel(user.department)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleViewUser(user)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {hasPermission('update_users') && (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                  {hasPermission('delete_users') && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
        onEdit={handleEditFromView}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
};

export default UsersPanel;
