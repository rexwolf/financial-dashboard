import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Mail, 
  Phone, 
  FileText,
  Search,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  Users,
  Zap,
  Shield
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  popular: boolean;
}

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I get started with FinancialHub?',
      answer: 'Getting started is simple! Sign up for a free account, verify your email, and you\'ll have immediate access to real-time market data, portfolio tracking, and basic analytics. You can upgrade to Pro or Enterprise plans for advanced features.',
      category: 'getting-started'
    },
    {
      id: '2',
      question: 'What markets and exchanges do you support?',
      answer: 'We support major global markets including NYSE, NASDAQ, LSE, TSX, as well as forex pairs, cryptocurrencies, and commodities. Our data covers 150+ countries and is updated in real-time during market hours.',
      category: 'data'
    },
    {
      id: '3',
      question: 'How accurate is your market data?',
      answer: 'Our market data comes directly from official exchange feeds and tier-1 financial data providers. We maintain 99.9% uptime and sub-second latency for real-time quotes. All data is professionally validated and cross-referenced.',
      category: 'data'
    },
    {
      id: '4',
      question: 'Can I export my data and analysis?',
      answer: 'Yes! Pro and Enterprise users can export data in multiple formats (CSV, Excel, JSON, PDF). You can export watchlists, historical data, custom analysis, and generate professional reports.',
      category: 'features'
    },
    {
      id: '5',
      question: 'What are your subscription plans?',
      answer: 'We offer Free (100 API calls/day), Pro ($29/month - 1,000 calls/day), and Enterprise ($199/month - 10,000 calls/day) plans. All plans include real-time data, portfolio tracking, and email support.',
      category: 'pricing'
    },
    {
      id: '6',
      question: 'Is my financial data secure?',
      answer: 'Absolutely. We use bank-level AES-256 encryption, are SOC 2 Type II certified, and comply with GDPR. Your data is stored in secure, geo-redundant data centers with 24/7 monitoring.',
      category: 'security'
    },
    {
      id: '7',
      question: 'Do you have a mobile app?',
      answer: 'Our web platform is fully responsive and optimized for mobile devices. Native iOS and Android apps are currently in development and will be available Q2 2024.',
      category: 'features'
    },
    {
      id: '8',
      question: 'How do I contact support?',
      answer: 'You can reach us via the feedback widget, email (support@financialhub.com), or phone. Pro and Enterprise users get priority support with guaranteed response times.',
      category: 'support'
    }
  ];

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Complete API Documentation',
      description: 'Comprehensive guide to integrating with our REST API, including authentication, rate limits, and examples.',
      category: 'api',
      readTime: 15,
      popular: true
    },
    {
      id: '2',
      title: 'Setting Up Your First Portfolio',
      description: 'Step-by-step guide to creating and managing investment portfolios with real-time tracking.',
      category: 'getting-started',
      readTime: 8,
      popular: true
    },
    {
      id: '3',
      title: 'Understanding Market Data Types',
      description: 'Learn about different data types: real-time quotes, historical data, options chains, and more.',
      category: 'data',
      readTime: 12,
      popular: false
    },
    {
      id: '4',
      title: 'Advanced Charting Features',
      description: 'Master our charting tools: technical indicators, drawing tools, and custom analysis.',
      category: 'features',
      readTime: 20,
      popular: true
    },
    {
      id: '5',
      title: 'Security Best Practices',
      description: 'How to secure your account, manage API keys, and protect sensitive financial data.',
      category: 'security',
      readTime: 10,
      popular: false
    },
    {
      id: '6',
      title: 'Billing and Subscription Management',
      description: 'Managing your subscription, understanding usage limits, and upgrading your plan.',
      category: 'pricing',
      readTime: 5,
      popular: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'data', name: 'Market Data', icon: FileText },
    { id: 'features', name: 'Features', icon: Star },
    { id: 'api', name: 'API', icon: FileText },
    { id: 'pricing', name: 'Pricing', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'support', name: 'Support', icon: MessageCircle }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqItems 
    : faqItems.filter(faq => faq.category === selectedCategory);

  const filteredArticles = selectedCategory === 'all' 
    ? helpArticles 
    : helpArticles.filter(article => article.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          How Can We Help You?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find answers to common questions, browse our help articles, or get in touch with our support team.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for help articles, FAQs, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
            <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get instant help from our support team</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Start Chat
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Response within 24 hours</p>
          <a 
            href="mailto:support@financialhub.com"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Send Email
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-4">
            <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Pro & Enterprise users only</p>
          <span className="text-orange-600 dark:text-orange-400 font-semibold">
            +1 (555) 123-4567
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  selectedCategory === category.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <IconComponent className="h-5 w-5 mb-2" />
                <div className="font-medium text-sm">{category.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setSelectedFAQ(selectedFAQ === faq.id ? null : faq.id)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{faq.question}</h3>
                  <ChevronRight 
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      selectedFAQ === faq.id ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
              </button>
              {selectedFAQ === faq.id && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help Articles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Help Articles</h2>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
            View All Articles →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex-1">{article.title}</h3>
                {article.popular && (
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs px-2 py-1 rounded-full ml-2">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{article.readTime} min read</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Systems Operational</h3>
              <p className="text-gray-600 dark:text-gray-400">99.9% uptime • Last updated 2 minutes ago</p>
            </div>
          </div>
          <button className="text-green-600 hover:text-green-700 dark:text-green-400 text-sm font-medium">
            View Status Page →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;