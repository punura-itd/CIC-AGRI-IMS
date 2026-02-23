import React, { useState } from 'react';
import { X, User, Plus, Building } from 'lucide-react';
import Button from '../button';
import InputField from '../inputFeild';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  phone?: string;
  joinDate?: string;
  permissions?: string;
  username?: string;
  password?: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active',
    phone: '',
    joinDate: new Date().toISOString(),
    permissions: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ];

  const departments = [
    { value: 'agri_Businesses', label: 'Agri Businesses' },
    { value: 'cic_holdings', label: 'CIC Holdings' },
    { value: 'dairies', label: 'Dairies' },
    { value: 'agri_produce_export', label: 'Agri Produce Export' },
    { value: 'fresheez', label: 'Fresheez' },
    { value: 'seeds', label: 'Seeds' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'active',
      phone: '',
      joinDate: new Date().toISOString(),
      permissions: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Add New User</h2>
              <p className="text-sm text-slate-600">Create a new user account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Basic Information
                </h3>
              </div>

              <InputField
                label="Full Name"
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
                error={errors.name}
              />

              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
                error={errors.email}
              />

              <InputField
                label="Phone Number"
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />

              <InputField
                label="User Name"
                id="username"
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter user name"
                required
                error={errors.username}
              />

              <InputField
                label="Password"
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                required
                error={errors.password}
              />

              

              {/* Role & Department */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Building size={20} className="text-green-600" />
                  Role & Department
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
                {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="min-w-[120px]"
          >
            Add User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;