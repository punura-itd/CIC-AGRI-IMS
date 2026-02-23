import React, { useEffect, useState } from 'react';
import { X, Package, MapPin, Cpu, DollarSign, Shield, Wrench, Barcode } from 'lucide-react';
import Button from '../button';
import InputField from '../inputFeild';
// import FormField from '../FormField';
// import Input from '../Input';
import QRCodeDisplay from '../QRCodeDisplay';
import type { User as UserType } from '../../types/User';
import { getUsers } from '../../api/users';


interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assetData: AssetFormData) => void;
}

export interface AssetFormData {
  name: string;
  category: string;
  description: string;
  model: string;
  serialNumber: string;
  specifications: string;
  purchaseDate: string;
  purchasePrice: string;
  assignedTo: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  location: string;
  company: string;
  supplier: string;
  invoiceNumber: string;
  warranty: number;
  status: string;
  assetCode?: string;
  qrCodeData?: string;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: '',
    description: '',
    model: '',
    serialNumber: '',
    specifications: '',
    purchaseDate: '',
    purchasePrice: '',
    assignedTo: '',
    location: '',
    company: '',
    supplier: '',
    invoiceNumber: '',
    warranty: 0,
    warrantyExpiry: '',
    lastMaintenance: '',
    status: 'active',
    assetCode: ''
  });

  const [errors, setErrors] = useState<Partial<AssetFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showQRPreview, setShowQRPreview] = useState(false);
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


  const categories = [
    { value: 'agri_cultural_equipment', label: 'Agri Cultural Equipment' },
    { value: 'computer_com_equipment', label: 'Computer & Com. Equipment' },
    { value: 'cutlery_cookery', label: 'Cutlery & Cookery' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'fh_building_at_cost', label: 'F/H Building at Cost' },
    { value: 'fh_land_at_valuation', label: 'F/H Land at Valuation' },
    { value: 'fh_plant_machinery', label: 'F/H Plant & Machinery' },
    { value: 'furniture_fittings', label: 'Furniture & Fittings' },
    { value: 'lh_building_at_cost', label: 'L/H Building at Cost' },
    { value: 'lh_land_at_cost', label: 'L/H Land at Cost' },
    { value: 'lab_equipment', label: 'Lab Equipment' },
    { value: 'motor_vehicles', label: 'Motor Vehicles' },
    { value: 'office_equipment', label: 'Office Equipment' },
    { value: 'pallet', label: 'Pallet' }
  ];

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
    { value: 'midigama', label: 'Midigama' },
    { value: 'jawatta', label: 'Jawatta' },
    { value: 'north_and_east', label: 'North & East' },
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

  const generateAssetCode = () => {
    const prefix = formData.category.toUpperCase().slice(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const generateQRCodeData = (assetData: AssetFormData) => {
    const qrData = {
      assetCode: assetData.assetCode || generateAssetCode(),
      supplier: assetData.supplier,
      warranty: assetData.warranty,
      warrantyExpiry: assetData.warrantyExpiry,
      generatedAt: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  };

  const handleInputChange = (field: keyof AssetFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AssetFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.company) newErrors.company = 'Company is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (!formData.purchasePrice.trim()) newErrors.purchasePrice = 'Purchase price is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePreview = () => {
    if (!formData.assetCode || !formData.category) {
      alert('Please fill in at least Asset Code and Category to preview QR code');
      return;
    }

    const assetCode = formData.assetCode || generateAssetCode();
    setFormData(prev => ({ ...prev, assetCode }));
    setShowQRPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const assetCode = formData.assetCode || generateAssetCode();
      const qrCodeData = generateQRCodeData({ ...formData, assetCode });

      const finalAssetData = {
        ...formData,
        assetCode,
        qrCodeData
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(finalAssetData);
      handleClose();
    } catch (error) {
      console.error('Error adding asset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      model: '',
      serialNumber: '',
      specifications: '',
      purchaseDate: '',
      purchasePrice: '',
      assignedTo: '',
      location: '',
      company: '',
      supplier: '',
      invoiceNumber: '',
      warranty: 0,
      warrantyExpiry: '',
      lastMaintenance: '',
      status: 'active',
      assetCode: ''
    });
    setErrors({});
    setShowQRPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  const currentQRData = showQRPreview && formData.name ? generateQRCodeData(formData) : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Add New Asset</h2>
              <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Enter asset details to add to inventory</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="flex-1 p-4 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Basic Information */}
                  <div className="sm:col-span-2">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Package size={18} className="text-blue-600" />
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

                  <InputField
                    label="Asset Code"
                    id="assetCode"
                    type="text"
                    value={formData.assetCode}
                    onChange={(e) => handleInputChange('assetCode', e.target.value)}
                    placeholder="Auto-generated if empty"
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

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter asset description"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>

                  {/* Technical Details */}
                  <div className="sm:col-span-2 mt-2 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Cpu size={18} className="text-green-600" />
                      Technical Details
                    </h3>
                  </div>

                  <InputField
                    label="Model"
                    id="model"
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Enter model"
                  />

                  <InputField
                    label="Serial Number"
                    id="serialNumber"
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="Enter serial number"
                  />

                  <InputField
                    label="Supplier"
                    id="supplier"
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Enter supplier name"
                  />

                  <InputField
                    label="Invoice Number"
                    id="invoiceNumber"
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    placeholder="Enter invoice number"
                  />

                  <div className="sm:col-span-2">
                    <InputField
                      label="Specifications"
                      id="specifications"
                      type="text"
                      value={formData.specifications}
                      onChange={(e) => handleInputChange('specifications', e.target.value)}
                      placeholder="Enter specifications"
                    />
                  </div>

                  {/* Financial Information */}
                  <div className="sm:col-span-2 mt-2 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-600" />
                      Financial Information
                    </h3>
                  </div>

                  <InputField
                    label="Purchase Date"
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    required
                    error={errors.purchaseDate}
                  />

                  <InputField
                    label="Purchase Price"
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="0.00"
                    required
                    error={errors.purchasePrice}
                  />

                  {/* Warranty Information */}
                  <div className="sm:col-span-2 mt-2 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Shield size={18} className="text-amber-600" />
                      Warranty Information
                    </h3>
                  </div>

                  <InputField
                    label="Warranty Period (months)"
                    id="warranty"
                    type="number"
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', Number(e.target.value))}
                    placeholder="12"
                  />

                  <InputField
                    label="Warranty Expiry Date"
                    id="warrantyExpiry"
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleInputChange("warrantyExpiry", e.target.value)}
                  />

                  {/* Maintenance Information */}
                  <div className="sm:col-span-2 mt-2 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Wrench size={18} className="text-orange-600" />
                      Maintenance Information
                    </h3>
                  </div>

                  <div className="sm:col-span-2">
                    <InputField
                      label="Last Maintenance Date"
                      id="lastMaintenance"
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) => handleInputChange("lastMaintenance", e.target.value)}
                    />
                  </div>

                  {/* Location & Assignment */}
                  <div className="sm:col-span-2 mt-2 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-rose-600" />
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

                  <div className="sm:col-span-2">
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

            {/* QR Code Preview Section - Responsive */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 p-4 sm:p-6">
              <div className="lg:sticky lg:top-0">
                <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <Barcode size={18} className="text-slate-700" />
                  Asset QR Code
                </h3>

                {!showQRPreview ? (
                  <div className="text-center">
                    <div className="w-full h-40 sm:h-48 bg-slate-200 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Barcode size={40} className="text-slate-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                      Preview QR code that will be generated for this asset
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePreview}
                      className="w-full"
                    >
                      Generate Preview
                    </Button>
                  </div>
                ) : (
                  <div>
                    <QRCodeDisplay
                      data={currentQRData}
                      size={180}
                      label="Asset QR Code"
                      downloadable={true}
                    />
                    <div className="mt-3 sm:mt-4 p-3 bg-white rounded-lg border text-xs">
                      <p className="font-medium text-slate-700 mb-2">QR Code Contains:</p>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Asset Code: {formData.assetCode}</li>
                        <li>• Company: {formData.company}</li>
                        <li>• Location: {formData.location}</li>
                        <li>• Supplier: {formData.supplier}</li>
                        <li>• Warranty: {formData.warranty} months</li>
                        <li>• Purchase Date: {formData.purchaseDate}</li>
                        <li>• Status: {formData.status}</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="w-full sm:w-auto sm:min-w-[120px]"
          >
            Add Asset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;
