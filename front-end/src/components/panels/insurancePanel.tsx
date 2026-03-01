import { Shield, Plus, Search, AlertCircle } from 'lucide-react';
import Button from '../button';

const InsurancePanel = () => {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-slate-800">Insurance</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search insurance records..."
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={16} className="mr-2" />
          Add Insurance
        </Button>
      </div>

      {/* Insurance Records */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1].map((insurance) => (
          <div key={insurance} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Shield className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Policy #{insurance}</h3>
                <p className="text-sm text-slate-500">Asset Insurance</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Provider</span>
                <span className="text-slate-800 font-medium">Ceylinco General</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Coverage</span>
                <span className="text-slate-800 font-medium">300,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Renewal Date</span>
                <span className="text-green-600 font-medium">In 3 months</span>
              </div>
            </div>
            {insurance === 2 && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Renewal coming up</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsurancePanel;