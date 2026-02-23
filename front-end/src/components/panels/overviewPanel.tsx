import React from 'react';
import { 
  ArrowUpRight, 
  Package, 
  UserPlus, 
  Server 
} from 'lucide-react';

const OverviewPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Assets"
          value="2,543"
          change="+12.5%"
          trend="up"
          icon={<Package className="text-blue-500" />}
        />
        <StatsCard 
          title="Active Users"
          value="387"
          change="+8.2%"
          trend="up"
          icon={<UserPlus className="text-green-500" />}
        />
        <StatsCard 
          title="Devices"
          value="1,204"
          change="-3.1%"
          trend="down"
          icon={<Server className="text-purple-500" />}
        />
       
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Asset Allocation</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            Chart placeholder - Asset allocation by department
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Monthly Activity</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            Chart placeholder - Monthly asset check-ins/check-outs
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-800">Recent Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
        </div>
        <div className="divide-y divide-slate-100">
          <ActivityItem 
            title="New laptop assigned"
            description='MacBook Pro 16" assigned to Sarah Johnson'
            time="2 hours ago"
          />
          <ActivityItem 
            title="Software license renewed"
            description="Adobe Creative Cloud subscription extended"
            time="Yesterday"
          />
          <ActivityItem 
            title="Hardware maintenance"
            description="5 workstations scheduled for RAM upgrade"
            time="2 days ago"
          />
          <ActivityItem 
            title="New user onboarded"
            description="Mark Wilson from Engineering added to system"
            time="3 days ago"
          />
          <ActivityItem 
            title="Asset check-in completed"
            description="Annual inventory verification completed"
            time="1 week ago"
          />
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md">
      <div className="flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className={`mt-2 text-sm flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        <ArrowUpRight className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
        <span>{change} from last month</span>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, time }) => {
  return (
    <div className="py-3 flex items-start">
      <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-slate-800">{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <div className="text-xs text-slate-400">{time}</div>
    </div>
  );
};

export default OverviewPanel;