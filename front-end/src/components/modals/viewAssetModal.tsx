import React, { useEffect, useState } from 'react';
import { X, Package, MapPin, IndianRupee, User, Shield, Wrench, Cpu, Barcode } from 'lucide-react';
import Button from '../button';
import QRCodeDisplay from '../QRCodeDisplay';
import { getUsers } from '../../api/users';
import type { User as UserType } from '../../types/User';

interface Asset {
  id: number;
  name: string;
  category: string;
  status: string;
  assignedTo?: string | number;
  location: string;
  company: string;
  purchaseDate: string;
  purchasePrice: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  description?: string;
  supplier?: string;
  invoiceNumber?: string;
  warranty?: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  specifications?: string;
  assetCode?: string;
  qrCodeData?: string;
}

interface ViewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit: (asset: Asset) => void;
}

const ViewAssetModal: React.FC<ViewAssetModalProps> = ({ isOpen, onClose, asset, onEdit }) => {
  if (!isOpen || !asset) return null;

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Under Maintenance';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLocationLabel = (location: string): string => {
    switch (location) {
      case 'head_office': return 'Head Office';
      case 'branch_a': return 'Branch A';
      case 'branch_b': return 'Branch B';
      case 'warehouse': return 'Warehouse';
      default: return location;
    }
  };

  const getCompanyLabel = (company: string): string => {
    switch (company) {
      case 'cic_agri': return 'CIC Agri Businesses';
      case 'cic_holdings': return 'CIC Holdings';
      case 'cic_foods': return 'CIC Foods';
      default: return company;
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'equipment': return 'Equipment';
      case 'vehicle': return 'Vehicle';
      case 'property': return 'Property';
      case 'furniture': return 'Furniture';
      case 'technology': return 'Technology';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    
  const formatPrice = (price: string): string => {
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const isWarrantyExpired = (warrantyExpiry?: string): boolean => {
    if (!warrantyExpiry) return false;
    return new Date(warrantyExpiry) < new Date();
  };

  const getQRCodeData = (): string => {
    if (asset.qrCodeData) {
      return asset.qrCodeData;
    }

    const qrData = {
      assetCode: asset.assetCode || `ASSET${asset.id}`,
      generatedAt: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
              <Package className="text-blue-600" size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-semibold text-slate-800 truncate">{asset.name}</h2>
              <p className="text-xs sm:text-sm text-slate-600 truncate">
                ID: #{asset.id} | {asset.assetCode || `ASSET${asset.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors shrink-0"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6">
              {/* Status Badge */}
              <div className="mb-4 sm:mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(asset.status)}`}>
                  {getStatusLabel(asset.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Package size={18} className="text-blue-600" />
                    Basic Information
                  </h3>

                  <div className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-600 text-sm">Asset Name:</span>
                      <span className="font-medium text-slate-800 text-sm break-words">{asset.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-600 text-sm">Asset Code:</span>
                      <span className="font-medium text-slate-800 text-sm">{asset.assetCode || `ASSET${asset.id}`}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-600 text-sm">Category:</span>
                      <span className="font-medium text-slate-800 text-sm">{getCategoryLabel(asset.category)}</span>
                    </div>

                    {asset.description && (
                      <div>
                        <span className="text-slate-600 text-sm">Description:</span>
                        <p className="mt-1 text-slate-800 text-sm">{asset.description}</p>
                      </div>
                    )}
                    {asset.assignedTo && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-slate-600 flex items-center gap-1 text-sm">
                          <User size={14} />
                          Assigned To:
                        </span>
                        <span className="font-medium text-slate-800 text-sm">{users.find(u => u.id === asset.assignedTo)?.name || 'Unassigned'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical & Financial in Grid on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Technical Details */}
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Cpu size={18} className="text-green-600" />
                      Technical Details
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                      {asset.manufacturer && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-slate-600 text-sm">Manufacturer:</span>
                          <span className="font-medium text-slate-800 text-sm break-words">{asset.manufacturer}</span>
                        </div>
                      )}
                      {asset.model && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-slate-600 text-sm">Model:</span>
                          <span className="font-medium text-slate-800 text-sm break-words">{asset.model}</span>
                        </div>
                      )}
                      {asset.serialNumber && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-slate-600 text-sm">Serial Number:</span>
                          <span className="font-medium text-slate-800 text-sm break-words">{asset.serialNumber}</span>
                        </div>
                      )}
                      {asset.supplier && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-slate-600 text-sm">Supplier:</span>
                          <span className="font-medium text-slate-800 text-sm break-words">{asset.supplier}</span>
                        </div>
                      )}
                      {asset.invoiceNumber && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-slate-600 text-sm">Invoice Number:</span>
                          <span className="font-medium text-slate-800 text-sm">{asset.invoiceNumber}</span>
                        </div>
                      )}
                      {asset.specifications && (
                        <div>
                          <span className="text-slate-600 text-sm">Specifications:</span>
                          <p className="font-medium text-slate-800 text-sm mt-1">{asset.specifications}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <IndianRupee size={18} className="text-emerald-600" />
                      Financial Information
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-slate-600 text-sm">Purchase Date:</span>
                        <span className="font-medium text-slate-800 text-sm">{formatDate(asset.purchaseDate)}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-slate-600 text-sm">Purchase Price:</span>
                        <span className="font-medium text-slate-800 text-sm">{formatPrice(asset.purchasePrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warranty & Maintenance in Grid on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Warranty Information */}
                  {(asset.warranty || asset.warrantyExpiry) && (
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-blue-600" />
                        Warranty Information
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                        {asset.warranty && (
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-slate-600 text-sm">Warranty Period:</span>
                            <span className="font-medium text-slate-800 text-sm">{asset.warranty} months</span>
                          </div>
                        )}
                        {asset.warrantyExpiry && (
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span className="text-slate-600 text-sm">Warranty Expires:</span>
                            <span className={`font-medium text-sm ${isWarrantyExpired(asset.warrantyExpiry) ? 'text-red-600' : 'text-slate-800'}`}>
                              {formatDate(asset.warrantyExpiry)}
                              {isWarrantyExpired(asset.warrantyExpiry) && (
                                <span className="ml-1 text-xs bg-red-100 text-red-700 px-1 rounded">Expired</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Maintenance Information */}
                  {asset.lastMaintenance && (
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                        <Wrench size={18} className="text-orange-600" />
                        Maintenance Information
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-slate-600 text-sm">Last Maintenance:</span>
                          <span className="font-medium text-slate-800 text-sm">{formatDate(asset.lastMaintenance)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Assignment */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-red-600" />
                    Location & Assignment
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-600 text-sm">Location:</span>
                      <span className="font-medium text-slate-800 text-sm">{getLocationLabel(asset.location)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-slate-600 text-sm">Company:</span>
                      <span className="font-medium text-slate-800 text-sm">{getCompanyLabel(asset.company)}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Section - Mobile Only */}
                <div className="lg:hidden">
                  <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Barcode size={18} className="text-slate-600" />
                    Asset QR Code
                  </h3>

                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col items-center">
                    <QRCodeDisplay
                      data={getQRCodeData()}
                      size={180}
                      label={`${asset.name} QR Code`}
                      downloadable={true}
                      className="mb-4"
                    />

                    <div className="w-full p-3 bg-white rounded-lg border text-xs">
                      <p className="font-medium text-slate-700 mb-2">QR Code Information:</p>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>Asset Code:</span>
                          <span className="font-mono">{asset.assetCode || `ASSET${asset.id}`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span>{getCategoryLabel(asset.category)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span>{getLocationLabel(asset.location)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span>{getStatusLabel(asset.status)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <p className="text-slate-500 text-xs">
                          Scan to view asset details or update information
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section - Desktop Only */}
            <div className="hidden lg:block lg:w-80 border-l border-slate-200 bg-slate-50 p-6 shrink-0">
              <div className="sticky top-0">
                <h3 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Barcode size={20} className="text-slate-600" />
                  Asset QR Code
                </h3>

                <QRCodeDisplay
                  data={getQRCodeData()}
                  size={220}
                  label={`${asset.name} QR Code`}
                  downloadable={true}
                  className="mb-4"
                />

                <div className="p-4 bg-white rounded-lg border text-xs">
                  <p className="font-medium text-slate-700 mb-2">QR Code Information:</p>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Asset Code:</span>
                      <span className="font-mono">{asset.assetCode || `ASSET${asset.id}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{getCategoryLabel(asset.category)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{getLocationLabel(asset.location)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{getStatusLabel(asset.status)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-slate-500 text-xs">
                      Scan to view asset details or update information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-200 bg-slate-50 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-sm sm:text-base"
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onEdit(asset)}
            className="text-sm sm:text-base"
          >
            Edit Asset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewAssetModal;
