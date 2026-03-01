import  { useEffect, useState } from 'react';
import { Truck, Plus, Search, Phone, Mail, Edit, Trash2, Eye } from 'lucide-react';
import Button from '../button';
import AddSupplierModal, { type SupplierFormData } from '../modals/AddSupplierModal';
import ViewSupplierModal from '../modals/ViewSupplierModal';
import EditSupplierModal from '../modals/EditSupplierModal';
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from '../../api/suppliers';

interface Supplier {
  id: number;
  name: string;
  category: string | null;
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

const SuppliersPanel = () => {
  // const [suppliers, setSuppliers] = useState<Supplier[]>([
  //   {
  //     id: 1,
  //     name: 'TechCorp Solutions',
  //     category: 'technology',
  //     status: 'active',
  //     contactPerson: 'Alice Johnson',
  //     phone: '+1 234 567 8901',
  //     email: 'contact@techcorp.com',
  //     address: '123 Tech Street, Silicon Valley, CA 94000',
  //     website: 'https://techcorp.com',
  //     registrationDate: '2023-01-15',
      
  //     lastOrderDate: '2024-01-15',
  //     totalOrders: 25,
  //     rating: 5,
  //     notes: 'Excellent technology supplier with fast delivery times.'
  //   },
  //   {
  //     id: 2,
  //     name: 'Office Plus Supplies',
  //     category: 'office_supplies',
  //     status: 'active',
  //     contactPerson: 'Bob Smith',
  //     phone: '+1 234 567 8902',
  //     email: 'orders@officeplus.com',
  //     address: '456 Business Ave, New York, NY 10001',
  //     website: 'https://officeplus.com',
  //     registrationDate: '2023-03-20',
  //     lastOrderDate: '2024-01-10',
  //     totalOrders: 18,
  //     rating: 4,
  //     notes: 'Reliable office supplies with competitive pricing.'
  //   },
  //   {
  //     id: 3,
  //     name: 'Modern Furniture Co.',
  //     category: 'furniture',
  //     status: 'active',
  //     contactPerson: 'Carol Davis',
  //     phone: '+1 234 567 8903',
  //     email: 'sales@modernfurniture.com',
  //     address: '789 Design Blvd, Los Angeles, CA 90210',
  //     website: 'https://modernfurniture.com',
  //     registrationDate: '2023-05-10',
  //     lastOrderDate: '2023-12-20',
  //     totalOrders: 12,
  //     rating: 4,
  //     notes: 'High-quality furniture with modern designs.'
  //   },
  //   {
  //     id: 4,
  //     name: 'Industrial Equipment Ltd.',
  //     category: 'equipment',
  //     status: 'inactive',
  //     contactPerson: 'David Wilson',
  //     phone: '+1 234 567 8904',
  //     email: 'info@industrialequip.com',
  //     address: '321 Industrial Park, Detroit, MI 48201',
  //     registrationDate: '2023-02-28',
  //     lastOrderDate: '2023-08-15',
  //     totalOrders: 8,
  //     rating: 3,
  //     notes: 'Good equipment supplier but delivery can be slow.'
  //   },
  //   {
  //     id: 5,
  //     name: 'Professional Services Inc.',
  //     category: 'services',
  //     status: 'active',
  //     contactPerson: 'Eva Brown',
  //     phone: '+1 234 567 8905',
  //     email: 'contact@proservices.com',
  //     website: 'https://proservices.com',
  //     registrationDate: '2023-07-05',
  //     lastOrderDate: '2024-01-08',
  //     totalOrders: 15,
  //     rating: 5,
  //     notes: 'Excellent professional services with great customer support.'
  //   }
  // ]);

      const [suppliers, setSuppliers] = useState<Supplier[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

useEffect(() => {
    const fetchSuppliers = async () => {
      try{
        const data = await getSuppliers();
        setSuppliers(data as Supplier[]);
      } catch (error) {
        setError('Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) return <div>Loading Suppliers...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  const getCategoryLabel = (category: string | null): string => {
    if (!category) return 'Uncategorized';
    switch (category) {
      case 'technology': return 'Technology';
      case 'office_supplies': return 'Office Supplies';
      case 'furniture': return 'Furniture';
      case 'equipment': return 'Equipment';
      case 'services': return 'Services';
      case 'other': return 'Other';
      default: return category;
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

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryLabel(supplier.category).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSupplier = async (supplierData: SupplierFormData) => {
      const newSupplier: Supplier = {
        id: Math.max(...suppliers.map(u => u.id), 0) + 1,
        ...supplierData,
        lastOrderDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
      };
      const insertSupplier: Partial<Supplier> = {
        ...supplierData,
         lastOrderDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
      };
      await createSupplier(insertSupplier);
      setSuppliers(prev => [...prev, newSupplier]);
    };

  const handleUpdateSupplier = async (updatedSupplier: Supplier) => {
      const {id, ...supplierToUpdate} = updatedSupplier;
      await updateSupplier(id, supplierToUpdate);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? updatedSupplier : supplier
      ));
    };

  const handleDeleteSupplier = async (id: number) => {
      if (window.confirm('Are you sure you want to delete this supplier?')) {
        await deleteSupplier(id);
        setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      }
    };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleEditFromView = (_supplier: Supplier) => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">Suppliers</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search suppliers..."
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Truck className="text-slate-400" size={24} />
          </div>
          <h3 className="font-medium text-slate-800 mb-1">No Suppliers Found</h3>
          <p className="text-slate-500 mb-4">
            {searchQuery ? 'No suppliers match your search criteria' : 'Get started by adding your first supplier'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Supplier
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <div 
              key={supplier.id} 
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Truck className="text-amber-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800 truncate">{supplier.name}</h3>
                  <p className="text-sm text-slate-500">{getCategoryLabel(supplier.category)}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                    {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                  </span>
                </div>
                {supplier.contactPerson && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Contact</span>
                    <span className="text-slate-800 font-medium text-right">
                      {supplier.contactPerson}
                    </span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} />
                    <span className="truncate">{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.rating && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Rating</span>
                    {renderStars(supplier.rating)}
                  </div>
                )}
                {supplier.lastOrderDate && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-500">Last Order</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(supplier.lastOrderDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  onClick={() => handleViewSupplier(supplier)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye size={14} />
                  View
                </button>
                <button 
                  onClick={() => handleEditSupplier(supplier)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSupplier}
      />

      <ViewSupplierModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        supplier={selectedSupplier as any}
        onEdit={handleEditFromView}
      />

      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplier={selectedSupplier as any}
        onSubmit={handleUpdateSupplier}
      />
    </div>
  );
};

export default SuppliersPanel;