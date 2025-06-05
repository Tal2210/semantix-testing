export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">Last Updated: [Date]</p>

      <p className="mb-4">
        Semantix-ai.com ("we," "us," or "our") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you use our Shopify app, Semantix AI Search (the "App"), and our
        website, semantix-ai.com (the "Site"). Please read this privacy policy carefully.
        If you do not agree with the terms of this privacy policy, please do not access the App or Site.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
      <p className="mb-4">
        We may collect information about you in a variety of ways. The information we may collect via the App and Site depends on the content and materials you use, and includes:
      </p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li className="mb-2">
          <strong>Shopify Store Information:</strong> When you install the App, we access certain information from your Shopify store through the Shopify API, as authorized by you during the installation process. This may include:
          <ul className="list-disc list-inside mb-2 ml-6">
            <li>Store details (name, domain, email, etc.)</li>
            <li>Product information (titles, descriptions, tags, images, etc.) to enable our search functionality.</li>
            <li>Theme information to integrate our search bar extension.</li>
            <li>We do NOT access customer personal data from your store unless explicitly stated and necessary for a specific feature you enable (e.g., search query analytics if offered and enabled by you).</li>
          </ul>
        </li>
        <li className="mb-2">
          <strong>Search Queries:</strong> If you enable search analytics or logging features within the App, we may collect the search queries made through the Semantix AI Search bar on your storefront. This data is used to improve search relevance and provide you with insights. This data is typically anonymized or aggregated.
        </li>
        <li className="mb-2">
          <strong>Usage Data:</strong> We may collect information about your interactions with our App and Site, such as features used, pages visited, and technical data like IP address, browser type, and operating system for analytics and service improvement.
        </li>
        <li className="mb-2">
          <strong>Account Information:</strong> If you create an account on our Site (semantix-ai.com), we collect information you provide, such as your name, email address, and password.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
      <p className="mb-4">
        Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the App or Site to:
      </p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li>Provide and manage the Semantix AI Search App and its features.</li>
        <li>Integrate the search functionality into your Shopify store.</li>
        <li>Process transactions and send you related information, including purchase confirmations and invoices (if applicable for paid services).</li>
        <li>Improve our App, Site, and services.</li>
        <li>Monitor and analyze usage and trends to improve your experience.</li>
        <li>Respond to your comments, questions, and customer service requests.</li>
        <li>Communicate with you about products, services, offers, promotions, and events offered by Semantix-ai.com and others, and provide news and information we think will be of interest to you (with your consent, where required by law).</li>
        <li>Comply with legal obligations, such as responding to GDPR data requests (customers/data_request, customers/redact, shop/redact webhooks from Shopify).</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Disclosure of Your Information</h2>
      <p className="mb-4">
        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
      </p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li className="mb-2">
          <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
        </li>
        <li className="mb-2">
          <strong>Third-Party Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., hosting services, payment processing, AI model providers for search functionality, analytics services).
        </li>
        <li className="mb-2">
          <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
        </li>
        <li className="mb-2">
          <strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent.
        </li>
      </ul>
      <p className="mb-4">
        We do not sell your personal information to third parties.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
      <p className="mb-4">
        We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>
      <p className="mb-4">
        We will only retain your information for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the information, the potential risk of harm from unauthorized use or disclosure, the purposes for which we process it, and whether we can achieve those purposes through other means, and the applicable legal requirements.
      </p>
      <p className="mb-4">
        For Shopify mandatory webhooks (customers/data_request, customers/redact, shop/redact), we will process data according to Shopify's requirements, typically within 30 days.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Your Data Protection Rights</h2>
      <p className="mb-4">
        Depending on your location, you may have the following rights regarding your personal information:
      </p>
      <ul className="list-disc list-inside mb-4 ml-4">
        <li>The right to access – You have the right to request copies of your personal data.</li>
        <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
        <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
        <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
        <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
        <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
      </ul>
      <p className="mb-4">
        If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our contact information below.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Policy for Children</h2>
      <p className="mb-4">
        We do not knowingly solicit information from or market to children under the age of 13 (or higher age as required by applicable law). If you become aware of any data we have collected from children, please contact us using the contact information provided below.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Changes to This Privacy Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
      <p className="mb-4">
        If you have questions or comments about this Privacy Policy, please contact us at:
      </p>
      <p className="mb-1">Semantix-ai.com</p>
      <p className="mb-1">[Your Email Address for Privacy Inquiries]</p>
      <p className="mb-1">[Your Physical Address, if applicable]</p>

    </div>
  );
} 