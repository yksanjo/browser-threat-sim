import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardStats, SimulationEvent } from '../types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockStats: DashboardStats = {
      totalUsers: 156,
      activeUsers: 134,
      totalSimulations: 2847,
      overallDetectionRate: 68.5,
      averageRiskScore: 42.3,
      recentEvents: [
        { id: '1', simulationId: 'sim-1', type: 'SIMULATION_DETECTED', timestamp: Date.now() - 300000, url: 'https://github.com', userId: 'user-1' },
        { id: '2', simulationId: 'sim-2', type: 'LINK_CLICKED', timestamp: Date.now() - 600000, url: 'https://linkedin.com', userId: 'user-2' },
        { id: '3', simulationId: 'sim-3', type: 'CREDENTIAL_ENTERED', timestamp: Date.now() - 900000, url: 'https://fake-site.com', userId: 'user-3' },
        { id: '4', simulationId: 'sim-4', type: 'SIMULATION_DETECTED', timestamp: Date.now() - 1200000, url: 'https://github.com', userId: 'user-4' },
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const mockChartData = [
    { name: 'Mon', detections: 45, clicks: 12, credentials: 3 },
    { name: 'Tue', detections: 52, clicks: 8, credentials: 2 },
    { name: 'Wed', detections: 38, clicks: 15, credentials: 5 },
    { name: 'Thu', detections: 65, clicks: 10, credentials: 1 },
    { name: 'Fri', detections: 48, clicks: 18, credentials: 4 },
    { name: 'Sat', detections: 25, clicks: 5, credentials: 0 },
    { name: 'Sun', detections: 30, clicks: 7, credentials: 1 },
  ];

  const platformData = [
    { name: 'GitHub', value: 45 },
    { name: 'LinkedIn', value: 30 },
    { name: 'Gmail', value: 25 },
  ];

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend,
    trendUp,
    color = 'blue' 
  }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: string;
    trendUp?: boolean;
    color?: 'blue' | 'green' | 'yellow' | 'red';
  }) => {
    const colorClasses = {
      blue: 'bg-primary-50 text-primary-700',
      green: 'bg-success-50 text-success-700',
      yellow: 'bg-warning-50 text-warning-700',
      red: 'bg-danger-50 text-danger-700',
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-success-600' : 'text-danger-600'}`}>
                {trendUp ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers.toString() || '0'} 
          icon={UsersIcon}
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <StatCard 
          title="Detection Rate" 
          value={`${stats?.overallDetectionRate.toFixed(1) || 0}%`} 
          icon={ShieldCheckIcon}
          trend="+5.2%"
          trendUp={true}
          color="green"
        />
        <StatCard 
          title="Avg Risk Score" 
          value={stats?.averageRiskScore.toFixed(1) || '0'} 
          icon={ExclamationTriangleIcon}
          trend="-8.1%"
          trendUp={false}
          color="yellow"
        />
        <StatCard 
          title="Simulations Run" 
          value={stats?.totalSimulations.toString() || '0'} 
          icon={ClockIcon}
          trend="+23%"
          trendUp={true}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Response Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="detections" stroke="#10b981" name="Detected" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#f59e0b" name="Clicked" strokeWidth={2} />
              <Line type="monotone" dataKey="credentials" stroke="#ef4444" name="Credentials" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Simulations by Platform</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Events</h3>
        </div>
        <div className="divide-y">
          {stats?.recentEvents.map((event) => (
            <div key={event.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  event.type === 'SIMULATION_DETECTED' ? 'bg-success-500' :
                  event.type === 'CREDENTIAL_ENTERED' ? 'bg-danger-500' :
                  'bg-warning-500'
                }`} />
                <div>
                  <p className="font-medium">{event.type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-500">{event.url}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
