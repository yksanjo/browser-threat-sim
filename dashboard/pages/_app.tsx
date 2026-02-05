import type { AppProps } from 'next/app';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  BeakerIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import './globals.css';

const navigation = [
  { name: 'Overview', href: '/', icon: ChartBarIcon },
  { name: 'Campaigns', href: '/campaigns', icon: ShieldCheckIcon },
  { name: 'User Stats', href: '/users', icon: UsersIcon },
  { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
  { name: 'Red Team', href: '/redteam', icon: BeakerIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-bold text-primary-600">BTS Dashboard</span>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    router?.pathname === item.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r">
          <div className="flex items-center h-16 px-6 border-b">
            <ShieldCheckIcon className="w-8 h-8 text-primary-600 mr-3" />
            <span className="text-lg font-bold text-gray-900">BTS Dashboard</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  router?.pathname === item.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium">C</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">CISO Admin</p>
                <p className="text-xs text-gray-500">Security Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-50"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}
