import { useState } from 'react';
import { 
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  GlobeIcon
} from '@heroicons/react/24/outline';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    apiEndpoint: 'http://localhost:3000',
    apiKey: '',
    organizationId: '',
    emailNotifications: true,
    slackNotifications: false,
    riskThreshold: 70,
    autoEscalate: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: ShieldCheckIcon },
    { id: 'api', name: 'API Configuration', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeIcon },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border">
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">General Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Score Threshold
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.riskThreshold}
                  onChange={(e) => setSettings({...settings, riskThreshold: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Low Risk (0)</span>
                  <span className="font-medium">{settings.riskThreshold}</span>
                  <span>High Risk (100)</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoEscalate}
                    onChange={(e) => setSettings({...settings, autoEscalate: e.target.checked})}
                  />
                  <span className="text-sm">Auto-escalate high-risk users to security team</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">API Configuration</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dashboard API Endpoint
                </label>
                <input
                  type="text"
                  value={settings.apiEndpoint}
                  onChange={(e) => setSettings({...settings, apiEndpoint: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="http://localhost:3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={settings.organizationId}
                  onChange={(e) => setSettings({...settings, organizationId: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="org-xxx"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Extension Configuration</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Use these settings to configure the browser extension:
                </p>
                <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm">
                  {JSON.stringify({
                    apiEndpoint: settings.apiEndpoint,
                    apiKey: settings.apiKey ? '***' : '',
                    organizationId: settings.organizationId
                  }, null, 2)}
                </code>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Notification Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive alerts via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Slack Notifications</p>
                    <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.slackNotifications}
                    onChange={(e) => setSettings({...settings, slackNotifications: e.target.checked})}
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Integrations</h2>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-bold">SSO</span>
                      </div>
                      <div>
                        <p className="font-medium">Single Sign-On</p>
                        <p className="text-sm text-gray-500">Connect with your identity provider</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Configure
                    </button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-700 font-bold">SIEM</span>
                      </div>
                      <div>
                        <p className="font-medium">SIEM Integration</p>
                        <p className="text-sm text-gray-500">Export logs to your SIEM</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 border-t flex justify-end gap-3">
            {saved && (
              <span className="px-4 py-2 text-success-600">Settings saved!</span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
