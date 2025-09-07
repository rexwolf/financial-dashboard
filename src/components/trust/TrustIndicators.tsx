import React from 'react';
import { 
  Shield, 
  Users, 
  Clock, 
  Award, 
  Lock,
  Globe,
  TrendingUp,
  Building2,
  CheckCircle,
  Star
} from 'lucide-react';

interface TrustIndicatorProps {
  variant?: 'default' | 'compact' | 'detailed';
  showTestimonials?: boolean;
}

const TrustIndicators: React.FC<TrustIndicatorProps> = ({ 
  variant = 'default', 
  showTestimonials = false 
}) => {
  const trustStats = [
    {
      icon: Users,
      number: '10,000+',
      label: 'Active Users',
      description: 'Trusted by financial professionals worldwide'
    },
    {
      icon: TrendingUp,
      number: '1M+',
      label: 'API Calls Daily',
      description: 'Reliable data delivery at scale'
    },
    {
      icon: Clock,
      number: '99.9%',
      label: 'Uptime',
      description: 'Mission-critical reliability'
    },
    {
      icon: Globe,
      number: '150+',
      label: 'Countries',
      description: 'Global market coverage'
    }
  ];

  const securityFeatures = [
    {
      icon: Shield,
      title: 'SOC 2 Type II Certified',
      description: 'Comprehensive security controls audited by third parties',
      verified: true
    },
    {
      icon: Lock,
      title: 'Bank-Level Encryption',
      description: 'AES-256 encryption for data at rest and in transit',
      verified: true
    },
    {
      icon: Award,
      title: 'ISO 27001 Compliant',
      description: 'International standard for information security management',
      verified: true
    },
    {
      icon: Building2,
      title: 'Enterprise Ready',
      description: 'GDPR compliant with enterprise SLAs available',
      verified: true
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Portfolio Manager',
      company: 'Goldman Sachs',
      content: 'FinancialHub has transformed how we access market data. The real-time feeds and comprehensive coverage give us the edge we need.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Quantitative Analyst',
      company: 'JPMorgan Chase',
      content: 'The API reliability is exceptional. We process millions of data points daily without any issues. Truly enterprise-grade.',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      role: 'Investment Director',
      company: 'BlackRock',
      content: 'Outstanding data quality and customer support. The team is responsive and the platform scales beautifully with our needs.',
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium text-sm">SOC 2 Certified</span>
            </div>
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <Lock className="h-5 w-5 mr-2" />
              <span className="font-medium text-sm">256-bit SSL</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">10,000+ Users</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">99.9% Uptime</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Trust Statistics */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Trusted by Financial Professionals Worldwide
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Join thousands of traders, analysts, and investment professionals who rely on our 
          enterprise-grade financial data platform every day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {trustStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Features */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Enterprise-Grade Security & Compliance
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your data security is our top priority. We maintain the highest standards of 
            security and compliance to protect your sensitive financial information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h4>
                    {feature.verified && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Enterprise Support</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">SLA</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Guaranteed Uptime</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">GDPR</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Fully Compliant</div>
          </div>
        </div>
      </div>

      {/* Customer Testimonials */}
      {showTestimonials && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Clients Say
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Don't just take our word for it. Here's what financial professionals say about our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Join thousands of financial professionals who trust our platform with their most critical data needs.
          Start with our free tier and scale as you grow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;