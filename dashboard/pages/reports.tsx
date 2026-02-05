import { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  EnvelopeIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { Report } from '../types';

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      type: 'organization',
      title: 'Q1 2024 Security Awareness Report',
      createdAt: Date.now() - 86400000 * 3,
      data: {}
    },
    {
      id: '2',
      type: 'campaign',
      title: 'Executive Training Campaign Results',
      createdAt: Date.now() - 86400000 * 7,
      data: {}
    },
    {
      id: '3',
      type: 'user',
      title: 'High-Risk Users Analysis',
      createdAt: Date.now() - 86400000 * 14,
      data: {}
    }
  ]);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'organization',
    dateRange: '30d',
    includeCharts: true,
    includeRecommendations: true
  });

  const generateReport = () => {
    const newReport: Report = {
      id: String(Date.now()),
      type: reportConfig.type as any,
      title: `Generated ${reportConfig.type} Report`,
      createdAt: Date.now(),
      data: {}
    };
    setReports([newReport, ...reports]);
    setShowGenerateModal(false);
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'organization':
        return <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700">Org</span>;
      case 'campaign':
        return <span className="px-2 py-1 text-xs rounded bg-success-100 text-success-700">Campaign</span>;
      case 'user':
        return <span className="px-2 py-1 text-xs rounded bg-warning-100 text-warning-700">User</span>;
      default:
        return null;
    }
  };

  const exportReport = (reportId: string, format: 'pdf' | 'csv') => {
    // In production, this would trigger a download
    console.log(`Exporting report ${reportId} as ${format}`);
    alert(`Report exported as ${format.toUpperCase()}`);
  };

  const emailReport = (reportId: string) => {
    // In production, this would open email dialog
    console.log(`Emailing report ${reportId}`);
    alert('Email dialog opened');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button 
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Generate Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold mt-1">{reports.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Last Report Generated</p>
          <p className="text-2xl font-bold mt-1">
            {new Date(reports[0]?.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Scheduled Reports</p>
          <p className="text-2xl font-bold mt-1">2</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Generated Reports</h3>
        </div>
        <div className="divide-y">
          {reports.map((report) => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                {getReportIcon(report.type)}
                <div>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-gray-500">
                    Generated on {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => exportReport(report.id, 'pdf')}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Download PDF"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => emailReport(report.id)}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Email Report"
                >
                  <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Scheduled Reports</h3>
        </div>
        <div className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Weekly Security Summary</p>
                <p className="text-sm text-gray-500">Every Monday at 9:00 AM</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-700">Active</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">Monthly Executive Report</p>
                <p className="text-sm text-gray-500">1st of every month</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs rounded-full bg-success-100 text-success-700">Active</span>
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Generate Report</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2"
                  value={reportConfig.type}
                  onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}
                >
                  <option value="organization">Organization Overview</option>
                  <option value="campaign">Campaign Analysis</option>
                  <option value="user">User Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2"
                  value={reportConfig.dateRange}
                  onChange={(e) => setReportConfig({...reportConfig, dateRange: e.target.value})}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig({...reportConfig, includeCharts: e.target.checked})}
                  />
                  <span className="text-sm">Include charts and visualizations</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={reportConfig.includeRecommendations}
                    onChange={(e) => setReportConfig({...reportConfig, includeRecommendations: e.target.checked})}
                  />
                  <span className="text-sm">Include training recommendations</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={generateReport}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
