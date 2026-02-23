import React from 'react';
import { X, User, Building2, Calendar, Shield } from 'lucide-react';
import Button from '../button';

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

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user, onEdit }) => {
  if (!isOpen || !user) return null;

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{user.name}</h2>
              <p className="text-sm text-slate-600">User Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Basic Information
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Full Name:</span>
                    <span className="font-medium text-slate-800">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium text-slate-800">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium text-slate-800">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Role & Department */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-green-600" />
                  Role & Department
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Role:</span>
                    <span className="font-medium text-slate-800">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Department:</span>
                    <span className="font-medium text-slate-800">{user.department}</span>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  Activity Information
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Join Date:</span>
                    <span className="font-medium text-slate-800">{formatDate(user.joinDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Login:</span>
                    <span className="font-medium text-slate-800">{formatDate(user.lastLogin)}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              {user.permissions && user.permissions.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-orange-600" />
                    Permissions
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {/* {user.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {permission}
                        </span>
                      ))} */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onEdit(user)}
          >
            Edit User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;