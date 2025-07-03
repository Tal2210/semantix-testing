import React from 'react';

const TermsAndConditions = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-light mb-4">Terms of Service</h1>
          <p className="text-purple-100 text-xl">Professional AI Software Licensing Agreement</p>
          <p className="text-purple-200 text-sm mt-4">Last updated: {currentDate}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-16">
          
          {/* Introduction */}
          <section className="border-l-4 border-purple-600 pl-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Agreement Overview</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This Terms of Service Agreement ("Agreement") governs the use of Semantix AI's proprietary 
                artificial intelligence search software platform. By accessing our services, you enter into 
                a binding legal agreement with Semantix AI.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Continued use of our services 
                constitutes acceptance of any modifications.
              </p>
            </div>
          </section>

          {/* Software Services */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Software Services</h2>
            <div className="bg-gray-50 rounded-lg p-8 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Core Technology</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Search</h4>
                  <p className="text-gray-700 text-sm">Advanced semantic search algorithms</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Machine Learning</h4>
                  <p className="text-gray-700 text-sm">Continuously improving search optimization</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cloud Infrastructure</h4>
                  <p className="text-gray-700 text-sm">Scalable SaaS architecture</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">API Integration</h4>
                  <p className="text-gray-700 text-sm">Enterprise-grade connectivity</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our software operates as an independent SaaS solution, maintaining full compliance with 
              industry standards and platform terms of service.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Intellectual Property</h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-3">Proprietary Technology</h3>
                <p className="text-gray-700 leading-relaxed">
                  All software, algorithms, and intellectual property are exclusively owned and developed 
                  by Semantix AI. Our technology is protected by copyright, trade secret, and applicable laws.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-3">Platform Compliance</h3>
                <p className="text-gray-700 leading-relaxed">
                  We maintain strict adherence to all third-party platform terms and do not violate 
                  any intellectual property rights in our integrations.
                </p>
              </div>
            </div>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Account Requirements</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Professional account registration requires accurate business information and compliance 
                with security protocols:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Complete and accurate business information
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Secure credential management
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Compliance with applicable regulations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Immediate notification of unauthorized access
                </li>
              </ul>
            </div>
          </section>

          {/* Subscription Plans */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Professional Subscription Plans</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-200 rounded-lg p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Basic</h3>
                  <div className="text-4xl font-light text-purple-600 my-4">$99<span className="text-lg text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    50,000 AI search queries monthly
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    99.5% uptime SLA
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Standard API access
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Business hours support
                  </li>
                </ul>
              </div>
              
              <div className="border-2 border-purple-600 rounded-lg p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  PROFESSIONAL
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                  <div className="text-4xl font-light text-purple-600 my-4">$120<span className="text-lg text-gray-500">/mo</span></div>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    100,000 AI search queries monthly
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    99.9% uptime SLA
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Advanced algorithms & ML
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Priority support & analytics
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment & Billing */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Payment & Billing</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  All transactions are processed securely through Paddle, our authorized payment processor. 
                  Monthly billing occurs automatically at the beginning of each cycle.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-3">30-Day Money-Back Guarantee</h3>
                <p className="text-gray-700 leading-relaxed">
                  Professional satisfaction guarantee with full refund available within 30 days of subscription 
                  for eligible accounts meeting our refund criteria.
                </p>
              </div>
            </div>
          </section>

          {/* Legal Framework */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Legal Framework</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Jurisdiction</h3>
                <p className="text-gray-700 text-sm">Laws of Israel</p>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
                <p className="text-gray-700 text-sm">GDPR & CCPA Compliant</p>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Enterprise Grade</h3>
                <p className="text-gray-700 text-sm">SOC 2 Security Standards</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-900 text-white rounded-lg p-8">
            <h2 className="text-3xl font-semibold mb-6">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium mb-4">Support</h3>
                <p className="text-gray-300 mb-2">support@semantix-ai.com</p>
                <p className="text-gray-400 text-sm">Business hours: Sunday-Thursday, 9 AM - 5 PM Israel Time</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-4">Legal</h3>
                <p className="text-gray-300 mb-2">Semantix AI</p>
                <p className="text-gray-400 text-sm">AI Software Development & SaaS Provider</p>
                <p className="text-gray-400 text-sm">Israel</p>
              </div>
            </div>
          </section>

          {/* Updates Notice */}
          <section className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-600">
              Terms may be updated to reflect software improvements and legal requirements. 
              Significant changes will be communicated via email.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;