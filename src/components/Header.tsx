import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Search, Sun, Moon, ChevronDown, Plus, Clock, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { searchService, SearchResult } from '../services/searchService';
import { MarketHours } from '../utils/marketHours';

interface HeaderProps {
  onAddToWatchlist: (symbol: string, name: string, type: 'stock' | 'commodity' | 'currency' | 'crypto', exchange: string, region: string) => Promise<void>;
  marketStatus?: {
    us: MarketHours;
    china: MarketHours;
    hongKong: MarketHours;
  };
}

const Header: React.FC<HeaderProps> = ({ onAddToWatchlist, marketStatus }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (searchValue.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchService.searchSymbols(searchValue, 8);
          setSearchResults(results);
          setIsSearchDropdownOpen(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const handleLanguageChange = (lang: 'en' | 'zh') => {
    setLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  const handleSearchResultClick = async (result: SearchResult) => {
    try {
      // Map search result type to watchlist type
      let watchlistType: 'stock' | 'commodity' | 'currency' | 'crypto';
      switch (result.type) {
        case 'stock':
        case 'index':
          watchlistType = 'stock';
          break;
        case 'commodity':
          watchlistType = 'commodity';
          break;
        case 'currency':
          watchlistType = 'currency';
          break;
        case 'crypto':
          watchlistType = 'crypto';
          break;
        default:
          watchlistType = 'stock';
      }

      await onAddToWatchlist(result.symbol, result.name, watchlistType, result.exchange, result.region);
      setSearchValue('');
      setIsSearchDropdownOpen(false);
      console.log(`Added ${result.symbol} to ${watchlistType} watchlist`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setIsSearchDropdownOpen(false);
      console.log('Searching for:', searchValue);
    }
  };

  const languageOptions = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  const currentLanguage = languageOptions.find(lang => lang.code === language);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MonkeyTradingClub</h1>
            <span className="hidden sm:inline-block text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {t('header.realtime')}
            </span>
            
            {/* Market Status */}
            {marketStatus && (
              <div className="hidden lg:flex items-center space-x-2 ml-4">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${marketStatus.us.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">US</span>
                    <span className={`font-medium ${marketStatus.us.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {marketStatus.us.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${marketStatus.china.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">CN</span>
                    <span className={`font-medium ${marketStatus.china.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {marketStatus.china.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${marketStatus.hongKong.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-600 dark:text-gray-400">HK</span>
                    <span className={`font-medium ${marketStatus.hongKong.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {marketStatus.hongKong.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Search Bar */}
            <div className="relative hidden md:block" ref={searchDropdownRef}>
              <form onSubmit={handleSearch}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-300 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400 group-hover:text-blue-500'}`} />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search stocks, forex, crypto, commodities..."
                    className="relative pl-12 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg font-medium text-sm"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {!isSearching && searchValue.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue('');
                        setIsSearchDropdownOpen(false);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {isSearchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/30 dark:to-gray-600/30 mx-3 rounded-lg mb-2">
                    <div className="flex items-center justify-between">
                      <span>Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
                      <Search className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="space-y-1 px-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.symbol}-${index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="w-full px-4 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 flex items-center space-x-4 transition-all duration-300 group rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-gray-600 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="text-2xl transform group-hover:scale-110 transition-transform duration-200">
                            {searchService.getTypeIcon(result.type)}
                          </div>
                          <div className="text-lg">{searchService.getRegionFlag(result.region)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white text-xl">{result.symbol}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-3 py-1 rounded-full font-medium">
                              {result.exchange}
                            </span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full font-semibold">
                              {result.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 truncate font-medium">{result.name}</div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-4 w-4 transform group-hover:rotate-90 transition-transform duration-200" />
                          <span className="text-sm">Add</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50 text-center mt-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/20 dark:to-gray-600/20 mx-3 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <Plus className="h-3 w-3" />
                      <span>Click on any item to add to your watchlist</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* No Results */}
              {isSearchDropdownOpen && searchResults.length === 0 && searchValue.length > 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-8 z-50">
                  <div className="px-6 text-center">
                    <div className="text-gray-400 mb-4">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        <Search className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 font-semibold text-lg mb-2">No results found</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      Try searching for <span className="font-medium text-blue-600 dark:text-blue-400">"AAPL"</span>, <span className="font-medium text-orange-600 dark:text-orange-400">"BTC"</span>, <span className="font-medium text-green-600 dark:text-green-400">"EUR"</span>, or <span className="font-medium text-yellow-600 dark:text-yellow-400">"GOLD"</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Language Switcher */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                title="Language / 语言"
              >
                <span className="text-lg">{currentLanguage?.flag}</span>
                <span className="text-sm font-medium hidden sm:block">{language.toUpperCase()}</span>
                <ChevronDown className={`h-4 w-4 transition-all duration-200 ${isLanguageDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'en' | 'zh')}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-all duration-200 ${
                        language === lang.code 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{lang.label}</span>
                        <span className="text-xs opacity-60">{lang.code.toUpperCase()}</span>
                      </div>
                      {language === lang.code && (
                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;