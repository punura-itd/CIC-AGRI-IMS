import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, Edit } from 'lucide-react';
import Button from '../button';
import InputField from '../inputFeild';
import { useAuth } from '../../context/authContext';
import { getUsers } from '../../api/users';
import type { User as UserType } from '../../types/users';



interface Asset {
  id: number;
  name: string;
  assignedTo: string;
  category: string;
  status: string;
  location: string;
  company: string;
  purchaseDate: string;
  purchasePrice: string;
  serialNumber?: string;
  description?: string;
  supplier?: string;
  warranty?: string;
}

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSubmit: (assetData: Asset) => void;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({ isOpen, onClose, asset, onSubmit }) => {
  const {  } = useAuth();
  const [formData, setFormData] = useState<Asset>({
    id: 0,
    name: '',
    assignedTo: '',
    category: '',
    description: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    location: '',
    company: '',
    supplier: '',
    warranty: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Partial<Asset>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when asset changes
  useEffect(() => {
    if (asset) {
      setFormData(asset);
    }
  }, [asset]);

  // const categories = [
  //   { value: 'equipment', label: 'Equipment' },
  //   { value: 'vehicle', label: 'Vehicle' },
  //   { value: 'property', label: 'Property' },
  //   { value: 'furniture', label: 'Furniture' },
  //   { value: 'technology', label: 'Technology' },
  //   { value: 'other', label: 'Other' }
  // ];

  const locations = [
    { value: 'head_office', label: 'Head Office' },
    { value: 'peliyagoda_plant', label: 'Peliyagoda Plant' },
    { value: 'peliyagoda_logistics', label: 'Peliyagoda Logistics' },
    { value: 'kurunegala', label: 'Kurunegala' },
    { value: 'kandy', label: 'Kandy' },
    { value: 'rathnapura', label: 'Rathnapura' },
    { value: 'welimada', label: 'Welimada' },
    { value: 'pelwehera', label: 'Pelwehera' },
    { value: 'hingurakgoda', label: 'Hingurakgoda' },
    { value: 'talawa', label: 'Talawa' },
    { value: 'maho', label: 'Maho' },
    { value: 'it_division_ekala', label: 'IT Division Ekala' },
    { value: 'it_division_peliyagoda', label: 'IT Division Peliyagoda' },
    { value: 'ekala', label: 'Ekala' }
  ];

  const companies = [
    { value: 'agri_Businesses', label: 'Agri Businesses' },
    { value: 'cic_holdings', label: 'CIC Holdings' },
    { value: 'dairies', label: 'Dairies' },
    { value: 'agri_produce_export', label: 'Agri Produce Export' },
    { value: 'fresheez', label: 'Fresheez' },
    { value: 'seeds', label: 'Seeds' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Under Maintenance' }
  ];

  const handleInputChange = (field: keyof Asset, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
      // Fetch users for assignment dropdown
      const fetchUsers = async () => {
        try {
          const res = await getUsers();
          setUsers(res);
        } catch (error) {
          console.error('Error fetching users:', error);  
        }
      };
  
      fetchUsers();
    }, []);
  

  const validateForm = (): boolean => {
    const newErrors: Partial<Asset> = {};

    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.purchasePrice.trim()) newErrors.purchasePrice = 'Purchase price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error updating asset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Edit className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Edit Asset</h2>
              <p className="text-sm text-slate-600">Update asset information</p>
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
                  <Package size={20} className="text-blue-600" />
                  Basic Information
                </h3>
              </div>

              <InputField
                label="Asset Name"
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter asset name"
                required
                error={errors.name}
              />

               <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assigned To <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    >
                      <option value="">Select assignee</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    {errors.assignedTo && <p className="mt-1 text-sm text-red-500">{errors.assignedTo}</p>}
                  </div>

              

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter asset description"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              
              
              {/* Location & Assignment */}
              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-600" />
                  Location & Assignment
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select company</option>
                  {companies.map(comp => (
                    <option key={comp.value} value={comp.value}>{comp.label}</option>
                  ))}
                </select>
                {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
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
            Update Asset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAssetModal;