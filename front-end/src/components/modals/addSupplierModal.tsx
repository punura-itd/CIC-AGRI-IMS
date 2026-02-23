import React, { useState } from 'react';
import { X, Truck, Plus } from 'lucide-react';
import Button from '../button';
import InputField from '../inputFeild';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplierData: SupplierFormData) => void;
}

export interface SupplierFormData {
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

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    category: '',
    status: 'active',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    website: '',    
    registrationDate: new Date().toISOString().split('T')[0],
    lastOrderDate: new Date().toISOString().split('T')[0],
    totalOrders: 0,
    rating: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<SupplierFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'office_supplies', label: 'Office Supplies' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleInputChange = (field: keyof SupplierFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SupplierFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.category) newErrors.category = 'Category is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Website validation
    if (formData.website && !formData.website.startsWith('http')) {
      setFormData(prev => ({ ...prev, website: `https://${prev.website}` }));
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
      console.error('Error adding supplier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      status: 'active',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      registrationDate: new Date().toISOString().split('T')[0],
      lastOrderDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      rating: 0,
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Plus className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Add New Supplier</h2>
              <p className="text-sm text-slate-600">Register a new supplier in the system</p>
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
                  <Truck size={20} className="text-amber-600" />
                  Basic Information
                </h3>
              </div>

              <InputField
                label="Company Name"
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
                required
                error={errors.name}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>

              <InputField
                label="Contact Person"
                id="contactPerson"
                type="text"
                value={formData.contactPerson || ''}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="Enter contact person name"
              />

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

              {/* Contact Information */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-green-600" />
                  Contact Information
                </h3>
              </div>

              <InputField
                label="Phone Number"
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />

              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                error={errors.email}
              />

              <InputField
                label="Website"
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Enter website URL"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Business Information */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-purple-600" />
                  Business Information
                </h3>
              </div>

              <InputField
                label="Registration Date"
                id="registrationDate"
                type="date"
                value={formData.registrationDate || ''}
                onChange={(e) => handleInputChange('registrationDate', e.target.value)}
              />

              <InputField
                label="Last Order Date"
                id="lastOrderDate"
                type="date"
                value={formData.lastOrderDate || ''}
                onChange={(e) => handleInputChange('lastOrderDate', e.target.value)}
              />

              {/* <InputField
                label="Total Orders"
                id="totalOrders"
                type="number"
                value={formData.totalOrders || ''}
                onChange={(e) => handleInputChange('totalOrders', e.target.value)}
                placeholder="Enter total orders"
              /> */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-5)</label>
                <select
                  value={formData.rating || ''}
                  onChange={(e) => handleInputChange('rating', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">No rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter additional notes about the supplier"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
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
            Add Supplier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;