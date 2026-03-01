import React from 'react';
import { X, TrendingDown, Calendar, Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './button';

interface Asset {
  id: number;
  name: string;
  category: string;
  status: string;
  purchaseDate: string;
  purchasePrice: string;
  model?: string;
  manufacturer?: string;
  lastMaintenance?: string;
}

interface MarketPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

interface PriceEstimate {
  currentMarketPrice: number;
  originalPrice: number;
  depreciationAmount: number;
  depreciationPercentage: number;
  ageInYears: number;
  condition: string;
  priceRange: {
    min: number;
    max: number;
  };
  factors: {
    name: string;
    impact: string;
    description: string;
  }[];
}

const MarketPriceModal: React.FC<MarketPriceModalProps> = ({ isOpen, onClose, asset }) => {
  if (!isOpen || !asset) return null;

  const calculateMarketPrice = (): PriceEstimate => {
    const originalPrice = parseFloat(asset.purchasePrice);
    const purchaseDate = new Date(asset.purchaseDate);
    const currentDate = new Date();
    const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    const categoryDepreciationRates: Record<string, number> = {
      technology: 0.25,
      equipment: 0.15,
      vehicle: 0.20,
      furniture: 0.10,
      property: 0.05,
      other: 0.12,
    };

    const baseDepreciationRate = categoryDepreciationRates[asset.category] || 0.12;

    const statusMultiplier: Record<string, number> = {
      active: 1.0,
      inactive: 0.85,
      maintenance: 0.75,
    };

    const conditionMultiplier = statusMultiplier[asset.status] || 1.0;

    let depreciationPercentage = Math.min(baseDepreciationRate * ageInYears * 100, 90);
    depreciationPercentage = depreciationPercentage * conditionMultiplier;

    const depreciationAmount = originalPrice * (depreciationPercentage / 100);
    const currentMarketPrice = Math.max(originalPrice - depreciationAmount, originalPrice * 0.05);

    const variance = currentMarketPrice * 0.15;
    const priceRange = {
      min: Math.max(currentMarketPrice - variance, 0),
      max: currentMarketPrice + variance,
    };

    const condition = asset.status === 'active' ? 'Good' : asset.status === 'maintenance' ? 'Fair' : 'Average';

    const factors = [
      {
        name: 'Age',
        impact: ageInYears > 3 ? 'High' : ageInYears > 1 ? 'Medium' : 'Low',
        description: `Asset is ${ageInYears.toFixed(1)} years old`,
      },
      {
        name: 'Category',
        impact: baseDepreciationRate > 0.2 ? 'High' : baseDepreciationRate > 0.1 ? 'Medium' : 'Low',
        description: `${getCategoryLabel(asset.category)} typically depreciates at ${(baseDepreciationRate * 100).toFixed(0)}% per year`,
      },
      {
        name: 'Condition',
        impact: asset.status === 'maintenance' ? 'High' : asset.status === 'inactive' ? 'Medium' : 'Low',
        description: `Asset status: ${getStatusLabel(asset.status)}`,
      },
      {
        name: 'Maintenance',
        impact: asset.lastMaintenance ? 'Positive' : 'Neutral',
        description: asset.lastMaintenance
          ? 'Regular maintenance recorded'
          : 'No maintenance history available',
      },
    ];

    return {
      currentMarketPrice,
      originalPrice,
      depreciationAmount,
      depreciationPercentage,
      ageInYears,
      condition,
      priceRange,
      factors,
    };
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      equipment: 'Equipment',
      vehicle: 'Vehicle',
      property: 'Property',
      furniture: 'Furniture',
      technology: 'Technology',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Under Maintenance',
    };
    return labels[status] || status;
  };

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getImpactColor = (impact: string): string => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'positive':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const estimate = calculateMarketPrice();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Second-Hand Market Price</h2>
              <p className="text-sm text-slate-600">{asset.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 mb-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Estimated Market Value</p>
                <p className="text-4xl font-bold text-emerald-600">
                  {formatPrice(estimate.currentMarketPrice)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Range: {formatPrice(estimate.priceRange.min)} - {formatPrice(estimate.priceRange.max)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">Original Price</p>
                <p className="text-2xl font-semibold text-slate-700">
                  {formatPrice(estimate.originalPrice)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-emerald-200">
              <div>
                <p className="text-xs text-slate-600 mb-1">Depreciation</p>
                <div className="flex items-center gap-1">
                  <TrendingDown size={16} className="text-red-500" />
                  <p className="text-lg font-semibold text-slate-800">
                    {estimate.depreciationPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Age</p>
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-blue-500" />
                  <p className="text-lg font-semibold text-slate-800">
                    {estimate.ageInYears.toFixed(1)} yrs
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Condition</p>
                <div className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-500" />
                  <p className="text-lg font-semibold text-slate-800">
                    {estimate.condition}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-slate-600" />
              Price Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Original Purchase Price</span>
                <span className="font-semibold text-slate-800">{formatPrice(estimate.originalPrice)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-slate-600">Total Depreciation</span>
                <span className="font-semibold text-red-600">-{formatPrice(estimate.depreciationAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                <span className="text-sm font-medium text-slate-700">Estimated Market Value</span>
                <span className="font-bold text-emerald-600">{formatPrice(estimate.currentMarketPrice)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-slate-600" />
              Value Impact Factors
            </h3>
            <div className="space-y-3">
              {estimate.factors.map((factor, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-800">{factor.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(factor.impact)}`}>
                      {factor.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-slate-600">
              <strong>Disclaimer:</strong> This is an estimated market value based on depreciation algorithms and asset condition.
              Actual market prices may vary based on demand, location, brand reputation, and current market conditions.
              For accurate valuation, consult with a professional appraiser.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketPriceModal;
