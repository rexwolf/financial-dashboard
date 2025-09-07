import React from 'react';
import { 
  Building2, 
  Users, 
  Target, 
  Award, 
  Linkedin,
  Mail,
  Calendar,
  MapPin,
  TrendingUp,
  Shield,
  Globe,
  Heart
} from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Sarah Mitchell',
      role: 'Chief Executive Officer',
      bio: 'Former Goldman Sachs VP with 15 years in financial technology. Led multiple successful fintech ventures.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/sarahmitchell',
      email: 'sarah@financialhub.com'
    },
    {
      name: 'David Chen',
      role: 'Chief Technology Officer',
      bio: 'Ex-Google senior engineer specializing in high-frequency trading systems and real-time data processing.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/davidchen',
      email: 'david@financialhub.com'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Data Science',
      bio: 'PhD in Quantitative Finance from MIT. Former quantitative researcher at Renaissance Technologies.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/michaelrodriguez',
      email: 'michael@financialhub.com'
    },
    {
      name: 'Emily Thompson',
      role: 'VP of Customer Success',
      bio: 'Former Bloomberg Terminal product manager with deep expertise in financial data workflows.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/emilythompson',
      email: 'emily@financialhub.com'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'FinancialHub was founded by a team of financial industry veterans and technology experts.'
    },
    {
      year: '2021',
      title: 'First 1,000 Users',
      description: 'Reached our first major milestone with 1,000+ active professional users.'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised $10M Series A led by Andreessen Horowitz to accelerate growth and data coverage.'
    },
    {
      year: '2023',
      title: 'Enterprise Launch',
      description: 'Launched enterprise platform serving major investment banks and hedge funds.'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to serve 150+ countries with localized market data and 24/7 support.'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We prioritize the security and privacy of your financial data above all else, maintaining the highest industry standards.'
    },
    {
      icon: TrendingUp,
      title: 'Data Excellence',
      description: 'We are committed to providing the most accurate, timely, and comprehensive financial data available.'
    },
    {
      icon: Users,
      title: 'Customer Success',
      description: 'Our customers\' success is our success. We build lasting partnerships and provide exceptional support.'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'We democratize access to professional-grade financial data for users worldwide.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
          <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          About FinancialHub
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          We're building the world's most comprehensive and reliable financial data platform, 
          empowering traders, analysts, and investment professionals with the real-time insights 
          they need to make informed decisions.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To democratize access to professional-grade financial data and analytics, enabling 
            everyone from individual traders to large institutions to make better investment 
            decisions with confidence and precision.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To become the global standard for financial data infrastructure, powering the next 
            generation of financial applications and helping shape a more transparent, efficient, 
            and accessible financial ecosystem.
          </p>
        </div>
      </div>

      {/* Company Values */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          These core values guide everything we do, from product development to customer service.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mb-4">
                  <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From a small startup to serving thousands of financial professionals worldwide.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-blue-200 dark:bg-blue-800 hidden lg:block"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8'}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {milestone.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {milestone.description}
                    </p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10 hidden lg:block"></div>
                
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Leadership Team</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Meet the experienced professionals leading FinancialHub's mission to transform financial data access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className="flex space-x-3">
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Location */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions about our platform? Want to learn more about enterprise solutions? 
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Headquarters</p>
                  <p className="text-gray-600 dark:text-gray-400">123 Financial District, New York, NY 10038</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                  <p className="text-gray-600 dark:text-gray-400">hello@financialhub.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Join Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're always looking for talented individuals who share our passion for 
              revolutionizing financial data access.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              View Open Positions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;