import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { UserStats } from '../types';

export default function UserStats() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof UserStats>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [users] = useState<UserStats[]>([
    {
      userId: 'user-1',
      simulationsSeen: 12,
      simulationsClicked: 2,
      credentialsEntered: 0,
      simulationsDetected: 10,
      averageDetectionTime: 8500,
      difficultyProgression: {
        currentLevel: 'medium',
        successRate: 0.83,
        consecutiveSuccesses: 3,
        consecutiveFailures: 0
      },
      riskScore: 35,
      lastUpdated: Date.now()
    },
    {
      userId: 'user-2',
      simulationsSeen: 15,
      simulationsClicked: 8,
      credentialsEntered: 3,
      simulationsDetected: 7,
      averageDetectionTime: 15200,
      difficultyProgression: {
        currentLevel: 'easy',
        successRate: 0.47,
        consecutiveSuccesses: 0,
        consecutiveFailures: 2
      },
      riskScore: 78,
      lastUpdated: Date.now()
    },
    {
      userId: 'user-3',
      simulationsSeen: 20,
      simulationsClicked: 1,
      credentialsEntered: 0,
      simulationsDetected: 19,
      averageDetectionTime: 4200,
      difficultyProgression: {
        currentLevel: 'expert',
        successRate: 0.95,
        consecutiveSuccesses: 8,
        consecutiveFailures: 0
      },
      riskScore: 15,
      lastUpdated: Date.now()
    }
  ]);

  const filteredUsers = users.filter(u => 
    u.userId.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortDirection === 'asc') {
      return (aValue as number) - (bValue as number);
    }
    return (bValue as number) - (aValue as number);
  });

  const handleSort = (field: keyof UserStats) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getRiskBadge = (score: number) => {
    if (score < 30) return <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-700">Low</span>;
    if (score < 70) return <span className="px-2 py-1 text-xs rounded-full bg-warning-100 text-warning-700">Medium</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-danger-100 text-danger-700">High</span>;
  };

  const getDetectionRate = (user: UserStats) => {
    if (user.simulationsSeen === 0) return 0;
    return (user.simulationsDetected / user.simulationsSeen) * 100;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Statistics</h1>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th 
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                onClick={() => handleSort('userId')}
              >
                <div className="flex items-center gap-1">
                  User ID
                  {sortField === 'userId' && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                onClick={() => handleSort('riskScore')}
              >
                <div className="flex items-center gap-1">
                  Risk Score
                  {sortField === 'riskScore' && (
                    sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Detection Rate</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Difficulty</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <>
                <tr 
                  key={user.userId} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium text-sm">
                          {user.userId.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRiskBadge(user.riskScore)}
                      <span className="text-sm text-gray-600">{user.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500"
                          style={{ width: `${getDetectionRate(user)}%` }}
                        />
                      </div>
                      <span className="text-sm">{getDetectionRate(user).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 capitalize">
                      {user.difficultyProgression.currentLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
                {expandedUser === user.userId && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Simulations Seen</p>
                          <p className="text-2xl font-bold">{user.simulationsSeen}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Links Clicked</p>
                          <p className={`text-2xl font-bold ${user.simulationsClicked > 0 ? 'text-warning-600' : ''}`}>
                            {user.simulationsClicked}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Credentials Entered</p>
                          <p className={`text-2xl font-bold ${user.credentialsEntered > 0 ? 'text-danger-600' : ''}`}>
                            {user.credentialsEntered}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Avg Detection Time</p>
                          <p className="text-2xl font-bold">{(user.averageDetectionTime / 1000).toFixed(1)}s</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-2">Success Rate</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-success-500"
                                style={{ width: `${user.difficultyProgression.successRate * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">{(user.difficultyProgression.successRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500 mb-2">Consecutive Successes</p>
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <ShieldCheckIcon 
                                key={i}
                                className={`w-5 h-5 ${
                                  i < user.difficultyProgression.consecutiveSuccesses 
                                    ? 'text-success-500' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
