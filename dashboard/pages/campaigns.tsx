import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { Campaign } from '../types';

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Q1 Security Awareness',
      description: 'Baseline phishing simulation for all employees',
      targetPlatforms: ['github', 'linkedin', 'gmail'],
      schedule: {
        startDate: Date.now(),
        frequency: 'weekly'
      },
      metrics: {
        participants: 156,
        emailsSent: 468,
        linksClicked: 89,
        credentialsEntered: 23,
        detectionRate: 68.5,
        averageTimeToDetection: 12400
      },
      active: true,
      createdAt: Date.now() - 86400000 * 7
    },
    {
      id: '2',
      name: 'Executive Training',
      description: 'Advanced simulations for C-level executives',
      targetPlatforms: ['gmail', 'linkedin'],
      schedule: {
        startDate: Date.now() - 86400000 * 14,
        frequency: 'daily'
      },
      metrics: {
        participants: 12,
        emailsSent: 84,
        linksClicked: 8,
        credentialsEntered: 2,
        detectionRate: 82.1,
        averageTimeToDetection: 8200
      },
      active: true,
      createdAt: Date.now() - 86400000 * 14
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const toggleCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const getStatusBadge = (active: boolean) => {
    return active 
      ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">Active</span>
      : <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Paused</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
        <button 
          onClick={() => { setEditingCampaign(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <PlusIcon className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Campaign</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Platforms</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Participants</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Detection Rate</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-500">{campaign.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {campaign.targetPlatforms.map(platform => (
                        <span key={platform} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 capitalize">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{campaign.metrics.participants}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500"
                          style={{ width: `${campaign.metrics.detectionRate}%` }}
                        />
                      </div>
                      <span className="text-sm">{campaign.metrics.detectionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(campaign.active)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleCampaign(campaign.id)}
                        className="p-1 rounded hover:bg-gray-100"
                        title={campaign.active ? 'Pause' : 'Resume'}
                      >
                        {campaign.active ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => { setEditingCampaign(campaign); setShowModal(true); }}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteCampaign(campaign.id)}
                        className="p-1 rounded hover:bg-gray-100 text-danger-600"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2"
                  defaultValue={editingCampaign?.name}
                  placeholder="e.g., Q2 Security Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  defaultValue={editingCampaign?.description}
                  placeholder="Campaign description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Platforms</label>
                <div className="flex gap-4">
                  {['github', 'linkedin', 'gmail'].map(platform => (
                    <label key={platform} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        defaultChecked={editingCampaign?.targetPlatforms.includes(platform)}
                      />
                      <span className="text-sm capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select className="w-full border rounded-lg px-3 py-2" defaultValue={editingCampaign?.schedule.frequency || 'weekly'}>
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="continuous">Continuous</option>
                </select>
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingCampaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
