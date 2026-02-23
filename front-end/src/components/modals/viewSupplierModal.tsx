import React from 'react';
import { X, Truck, Phone, Mail, MapPin, Calendar, Building2 } from 'lucide-react';
import Button from '../button';

interface Supplier {
  id: number;
  name: string;
  category: string;
  status: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  registrationDate?: string;
  lastOrderDate?: string;
  totalOrders?: number;
  rating?: number;
  notes?: string;
}

interface ViewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit: (supplier: Supplier) => void;
}

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({ isOpen, onClose, supplier, onEdit }) => {
  if (!isOpen || !supplier) return null;

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

  const renderStars = (rating?: number) => {
    if (!rating) return 'No rating';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Truck className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{supplier.name}</h2>
              <p className="text-sm text-slate-600">Supplier Details</p>
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
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(supplier.status)}`}>
                {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-amber-600" />
                  Basic Information
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Company Name:</span>
                    <span className="font-medium text-slate-800">{supplier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Category:</span>
                    <span className="font-medium text-slate-800">{supplier.category}</span>
                  </div>
                  {supplier.contactPerson && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Contact Person:</span>
                      <span className="font-medium text-slate-800">{supplier.contactPerson}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Website:</span>
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                        {supplier.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Phone size={20} className="text-green-600" />
                  Contact Information
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-500" />
                      <span className="text-slate-800">{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-slate-500" />
                      <span className="text-slate-800">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-slate-500 mt-0.5" />
                      <span className="text-slate-800">{supplier.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  Business Information
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Registration Date:</span>
                    <span className="font-medium text-slate-800">{formatDate(supplier.registrationDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Order:</span>
                    <span className="font-medium text-slate-800">{formatDate(supplier.lastOrderDate)}</span>
                  </div>
                  {supplier.totalOrders !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Orders:</span>
                      <span className="font-medium text-slate-800">{supplier.totalOrders}</span>
                    </div>
                  )}
                  {supplier.rating && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Rating:</span>
                      <span className="font-medium text-slate-800">{renderStars(supplier.rating)} ({supplier.rating}/5)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {supplier.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    Notes
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-800">{supplier.notes}</p>
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
            onClick={() => onEdit(supplier)}
          >
            Edit Supplier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewSupplierModal;