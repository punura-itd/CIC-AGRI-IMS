import { useEffect, useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Eye, Barcode, Filter, X, Download } from 'lucide-react';
import Button from '../button';
import AddAssetModal, { type AssetFormData } from '../modals/addAssetModal';
import ViewAssetModal from '../modals/viewAssetModal';
import EditAssetModal from '../modals/editAssetModal';
import { createAsset, deleteAsset, getAssets, updateAsset } from '../../api/assets';
import { useAuth } from '../../context/authContext';

import { getUsers } from '../../api/users';
import type { User as UserType } from '../../types/User';

const AssetsPanel = () => {
  const { hasPermission, isAuthenticated, user } = useAuth();

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
    warranty?: number;
    warrantyExpiry?: string;
    lastMaintenance?: string;
    specifications?: string;
    assetCode?: string;
    qrCodeData?: string;
  }

  interface Filters {
    category: string;
    status: string;
    location: string;
    company: string;
  }

  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: '',
    status: '',
    location: '',
    company: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Export to Excel function
  const exportToExcel = () => {
    // Dynamically import xlsx only when needed
    import('xlsx').then(XLSX => {
      // Prepare data for export
      const data = filteredAssets.map(asset => ({
        ID: asset.id,
        Name: asset.name,
        Category: getCategoryLabel(asset.category),
        Status: getStatusLabel(asset.status),
        AssignedTo: asset.assignedTo ?? '',
        Location: getLocationLabel(asset.location),
        Company: getCompanyLabel(asset.company),
        PurchaseDate: asset.purchaseDate,
        PurchasePrice: asset.purchasePrice,
        Model: asset.model ?? '',
        SerialNumber: asset.serialNumber ?? '',
        Manufacturer: asset.manufacturer ?? '',
        Description: asset.description ?? '',
        Supplier: asset.supplier ?? '',
        InvoiceNumber: asset.invoiceNumber ?? '',
        Warranty: asset.warranty ?? '',
        WarrantyExpiry: asset.warrantyExpiry ?? '',
        LastMaintenance: asset.lastMaintenance ?? '',
        Specifications: asset.specifications ?? '',
        AssetCode: asset.assetCode ?? '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
      XLSX.writeFile(workbook, 'assets.xlsx');
    });
  };

  // Filter options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'agri_cultural_equipment', label: 'Agri Cultural Equipment' },
    { value: ' Z1030 Computer & Com. Equi', label: 'Z1030 Computer & Com. Equi' },
    { value: 'cutlery_cookery', label: 'Cutlery & Cookery' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'fh_building_at_cost', label: 'F/H Building at Cost' },
    { value: 'fh_land_at_valuation', label: 'F/H Land at Valuation' },
    { value: 'fh_plant_machinery', label: 'F/H Plant & Machinery' },
    { value: ' Z1100 Furniture & Fittings', label: 'Z1100 Furniture & Fittings' },
    { value: 'lh_building_at_cost', label: 'L/H Building at Cost' },
    { value: 'lh_land_at_cost', label: 'L/H Land at Cost' },
    { value: 'lab_equipment', label: 'Lab Equipment' },
    { value: 'motor_vehicles', label: 'Motor Vehicles' },
    { value: 'office_equipment', label: 'Office Equipment' },
    { value: 'pallet', label: 'Pallet' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Under Maintenance' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'head_office', label: 'Head Office' },
    { value: 'peliyagoda', label: 'Peliyagoda' },
    { value: 'ekala', label: 'Ekala' },
    { value: 'pelwehera', label: 'Pelwehera' },
    { value: 'mahawa', label: 'Mahawa' },
    { value: 'thalawa', label: 'Thalawa' },
    { value: 'rathnapura', label: 'Rathnapura' },
    { value: 'kurunegala', label: 'Kurunegala' },
    { value: 'jawatta', label: 'Jawatta' },
    { value: 'asiri_central', label: 'Asiri Central' },
    { value: 'ncc', label: 'NCC' },
    { value: 'peliyagoda', label: 'Peliyagoda' },
    { value: 'kandy', label: 'Kandy' }
  ];

  const companyOptions = [
    { value: '', label: 'All Companies' },
    { value: 'agri_Businesses', label: 'Agri Businesses' },
    { value: 'cic_holdings', label: 'CIC Holdings' },
    { value: 'dairies', label: 'Dairies' },
    { value: 'agri_produce_export', label: 'Agri Produce Export' },
    { value: 'fresheez', label: 'Fresheez' },
    { value: 'seeds', label: 'Seeds' }
  ];

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Under Maintenance';
      default: return status;
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try{
        const data = await getAssets();
        setAssets(data as any);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
        setError('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
    fetchAssets();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <div className="p-4 text-slate-600">Please log in to view assets.</div>;
  if (loading) return <div>Loading Assets...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

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

  const getCategoryIcon = (_category: string) => {
    const iconClass = "text-blue-600";
    return <Package className={iconClass} size={24} />;
  };

  // Enhanced filtering logic
  const filteredAssets = assets.filter(asset => {
    // Search filter
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryLabel(asset.category).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocationLabel(asset.location).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyLabel(asset.company).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assetCode && asset.assetCode.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = !filters.category || asset.category === filters.category;

    // Status filter
    const matchesStatus = !filters.status || asset.status === filters.status;

    // Location filter
    const matchesLocation = !filters.location || asset.location === filters.location;

    // Company filter
    const matchesCompany = !filters.company || asset.company === filters.company;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation && matchesCompany;
  });

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      status: '',
      location: '',
      company: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '') || searchQuery !== '';
  const activeFilterCount = Object.values(filters).filter(filter => filter !== '').length;

  const handleAddAsset = async (assetData: AssetFormData) => {
      const newAsset: Asset = {
        id: Math.max(...assets.map(u => u.id), 0) + 1,
        ...assetData,
        purchaseDate: new Date().toISOString(),
      };
      // Remove qrCodeData before sending to API
      const { qrCodeData, ...assetDataWithoutQr } = assetData;

      const users = await getUsers();
      const assignedUser = users.find(u => u.id === Number(assetData.assignedTo));

      const insertAsset: Partial<Asset> = {
        ...assetDataWithoutQr,
        purchaseDate: new Date().toISOString(),
        warranty: assetData.warranty ? Number(assetData.warranty) as any : null,
        warrantyExpiry: assetData.warrantyExpiry ? new Date(assetData.warrantyExpiry) as any : null,
        lastMaintenance: assetData.lastMaintenance ? new Date(assetData.lastMaintenance) as any : null,
        assignedTo: assignedUser ? assignedUser.id : ''
      };
      await createAsset(insertAsset as any);
      setAssets(prev => [...prev, newAsset]);
    };

  const handleUpdateAsset = async (updatedAsset: Asset) => {
    const {id, ...assetData} = updatedAsset;
    await updateAsset(id, assetData as any);
    setAssets(prev => prev.map(asset => 
      asset.id === updatedAsset.id ? updatedAsset : asset
    ));
  };

  const handleDeleteAsset = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(id); 
      setAssets(prev => prev.filter(asset => asset.id !== id));
    }
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsViewModalOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleEditFromView = (_asset: Asset) => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-800">Assets</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search assets..."
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-blue-200 bg-blue-50 text-blue-700' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToExcel}
              disabled={filteredAssets.length === 0}
            >
              <Download size={16} className="mr-2" />
              Export Excel
            </Button>
            
            {hasPermission('create_assets') && (
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Asset
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  >
                    {locationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <select
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                  >
                    {companyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      Category: {getCategoryLabel(filters.category)}
                      <button onClick={() => handleFilterChange('category', '')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      Status: {getStatusLabel(filters.status)}
                      <button onClick={() => handleFilterChange('status', '')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      Location: {getLocationLabel(filters.location)}
                      <button onClick={() => handleFilterChange('location', '')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filters.company && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      Company: {getCompanyLabel(filters.company)}
                      <button onClick={() => handleFilterChange('company', '')}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {filteredAssets.length} of {assets.length} assets
            {hasActiveFilters && ' (filtered)'}
          </p>
          {filteredAssets.length > 0 && (
            <p className="text-sm text-slate-500">
              {hasActiveFilters ? 'Export will include filtered results only' : 'Export will include all assets'}
            </p>
          )}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package className="text-slate-400" size={24} />
          </div>
          <h3 className="font-medium text-slate-800 mb-1">
            {hasActiveFilters ? 'No Assets Match Your Filters' : 'No Assets Found'}
          </h3>
          <p className="text-slate-500 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or clearing the filters'
              : 'Get started by adding your first asset'
            }
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          ) : (
            hasPermission('create_assets') && (
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Asset
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  {getCategoryIcon(asset.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 truncate">{asset.name}</h3>
                  <p className="text-sm text-slate-500">{getCategoryLabel(asset.category)}</p>
                </div>
                {asset.qrCodeData && (
                  <div className="p-1 bg-indigo-50 rounded-lg">
                    <Barcode className="text-indigo-600" size={16} />
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                    {getStatusLabel(asset.status)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Asset Code</span>
                  <span className="text-slate-800 font-medium font-mono text-right">
                    {asset.assetCode || `ASSET${asset.id}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Location</span>
                  <span className="text-slate-800 font-medium text-right">
                    {getLocationLabel(asset.location)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Company</span>
                  <span className="text-slate-800 font-medium text-right">
                    {getCompanyLabel(asset.company)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Assigned To</span>
                  <span className="text-slate-800 font-medium">
                    {users.find(u => u.id === asset.assignedTo)?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => handleViewAsset(asset)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye size={14} />
                  View
                </button>
                {hasPermission('update_assets') && (
                  <button 
                    onClick={() => handleEditAsset(asset)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                )}
                {hasPermission('delete_assets') && (
                  <button 
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAsset}
      />

      <ViewAssetModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        asset={selectedAsset as any}
        onEdit={handleEditFromView as any}
      />

      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        asset={selectedAsset as any}
        onSubmit={handleUpdateAsset as any}
      />
    </div>
  );
};

export default AssetsPanel;