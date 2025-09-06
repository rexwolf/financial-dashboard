import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Settings,
  ChevronLeft,
  Home,
  AlertTriangle,
  Coins
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  selectedSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedSection, onSectionChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

  const menuItems = [
    { id: 'overview', label: t('nav.overview'), icon: Home },
    { id: 'markets', label: t('nav.markets'), icon: TrendingUp },
    { id: 'commodities', label: t('nav.commodities'), icon: BarChart3 },
    { id: 'forex', label: t('nav.forex'), icon: DollarSign },
    { id: 'crypto', label: t('nav.crypto'), icon: Coins },
    { id: 'opportunities', label: t('nav.opportunities'), icon: Zap },
    { id: 'alerts', label: t('nav.alerts'), icon: AlertTriangle },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!collapsed && <span className="font-semibold text-gray-900 dark:text-white">{t('nav.navigation')}</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className={`flex-1 space-y-2 ${collapsed ? 'px-2 py-4' : 'p-4'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selectedSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                localStorage.setItem('selectedSection', item.id);
              }}
              className={`w-full flex items-center transition-colors ${
                collapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3 py-2.5'
              } rounded-lg ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-500'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'} transition-all`} />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white ${collapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          {!collapsed ? (
            <>
              <div className="text-sm font-medium">{t('market.status')}</div>
              <div className="text-xs opacity-90 mt-1">{t('market.open')}</div>
            </>
          ) : (
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title={t('market.open')}></div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;