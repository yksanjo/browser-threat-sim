import { useState } from 'react';
import { 
  PlayIcon, 
  StopIcon, 
  PlusIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { RedTeamScenario } from '../types';

export default function RedTeam() {
  const [scenarios, setScenarios] = useState<RedTeamScenario[]>([
    {
      id: '1',
      name: 'Executive Impersonation',
      description: 'Simulate email from CEO requesting urgent wire transfer',
      attackVector: 'Business Email Compromise',
      targetUsers: ['exec-1', 'exec-2', 'exec-3'],
      successCriteria: ['User reports suspicious email', 'User does not click link'],
      createdAt: Date.now() - 86400000,
      status: 'completed'
    },
    {
      id: '2',
      name: 'Fake IT Support',
      description: 'Impersonate IT support requesting password reset',
      attackVector: 'Credential Harvesting',
      targetUsers: ['user-1', 'user-2', 'user-5', 'user-8'],
      successCriteria: ['User verifies via official channel', 'User reports phishing'],
      createdAt: Date.now(),
      status: 'active'
    },
    {
      id: '3',
      name: 'Vendor Invoice Scam',
      description: 'Send fake invoice from known vendor with updated banking details',
      attackVector: 'Invoice Fraud',
      targetUsers: ['finance-1', 'finance-2'],
      successCriteria: ['User verifies with vendor directly'],
      createdAt: Date.now(),
      status: 'pending'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    attackVector: '',
    targetUsers: '',
    customPayload: ''
  });

  const createScenario = () => {
    const scenario: RedTeamScenario = {
      id: String(Date.now()),
      name: newScenario.name,
      description: newScenario.description,
      attackVector: newScenario.attackVector,
      targetUsers: newScenario.targetUsers.split(',').map(u => u.trim()),
      successCriteria: ['User detects simulation'],
      createdAt: Date.now(),
      status: 'pending'
    };
    setScenarios([...scenarios, scenario]);
    setShowModal(false);
    setNewScenario({ name: '', description: '', attackVector: '', targetUsers: '', customPayload: '' });
  };

  const toggleScenario = (id: string) => {
    setScenarios(scenarios.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'active' ? 'completed' : 'active' as any };
      }
      return s;
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-700">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Red Team Operations</h1>
          <p className="text-gray-500 mt-1">Advanced attack simulations for security testing</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700"
        >
          <PlusIcon className="w-5 h-5" />
          New Scenario
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <BeakerIcon className="w-5 h-5 text-danger-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-danger-800">Red Team Mode Active</h3>
            <p className="text-sm text-danger-700 mt-1">
              These simulations are more sophisticated and targeted. Use with caution and ensure 
              proper authorization before deploying.
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Active Scenarios</h3>
        </div>
        <div className="divide-y">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-lg">{scenario.name}</h4>
                    {getStatusBadge(scenario.status)}
                  </div>
                  <p className="text-gray-600 mt-1">{scenario.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-500">
                      <strong>Vector:</strong> {scenario.attackVector}
                    </span>
                    <span className="text-gray-500">
                      <strong>Targets:</strong> {scenario.targetUsers.length} users
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">Success Criteria:</p>
                    <div className="flex gap-2">
                      {scenario.successCriteria.map((criteria, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded bg-gray-100">
                          {criteria}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {scenario.status === 'active' ? (
                    <button 
                      onClick={() => toggleScenario(scenario.id)}
                      className="p-2 rounded hover:bg-gray-100 text-danger-600"
                      title="Stop Scenario"
                    >
                      <StopIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => toggleScenario(scenario.id)}
                      className="p-2 rounded hover:bg-gray-100 text-success-600"
                      title="Start Scenario"
                    >
                      <PlayIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Red Team API</h3>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm text-green-400">
            {`// Trigger custom phishing simulation
fetch('/api/redteam/simulate', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    targetUsers: ['user-1', 'user-2'],
    type: 'credential_harvest',
    customPayload: 'Urgent: Action required on your account',
    difficulty: 'expert'
  })
});`}
          </code>
        </div>
      </div>

      {/* Create Scenario Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Create Red Team Scenario</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newScenario.name}
                  onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                  placeholder="e.g., Fake IT Support"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  value={newScenario.description}
                  onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                  placeholder="Describe the attack scenario..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attack Vector</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newScenario.attackVector}
                  onChange={(e) => setNewScenario({...newScenario, attackVector: e.target.value})}
                >
                  <option value="">Select vector...</option>
                  <option value="Credential Harvesting">Credential Harvesting</option>
                  <option value="Business Email Compromise">Business Email Compromise</option>
                  <option value="Invoice Fraud">Invoice Fraud</option>
                  <option value="Malware Delivery">Malware Delivery</option>
                  <option value="Social Engineering">Social Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Users</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newScenario.targetUsers}
                  onChange={(e) => setNewScenario({...newScenario, targetUsers: e.target.value})}
                  placeholder="user-1, user-2, user-3"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated user IDs</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Payload (optional)</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  value={newScenario.customPayload}
                  onChange={(e) => setNewScenario({...newScenario, customPayload: e.target.value})}
                  placeholder="Custom message content..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={createScenario}
                className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700"
              >
                Create Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
