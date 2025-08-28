import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - BeamFlow Documentation</title>
        <meta
          name='description'
          content='Privacy policy and cookie information for BeamFlow documentation site'
        />
      </Helmet>

      <div className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-white mb-8'>Privacy Policy</h1>

        <div className='prose prose-invert max-w-none'>
          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Introduction
            </h2>
            <p className='text-gray-300 mb-4'>
              This Privacy Policy explains how we collect, use, and protect your
              information when you visit our documentation site. We are
              committed to protecting your privacy and ensuring compliance with
              applicable data protection laws, including GDPR.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Information We Collect
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              Information You Provide
            </h3>
            <p className='text-gray-300 mb-4'>
              We may collect information you voluntarily provide, such as when
              you:
            </p>
            <ul className='list-disc list-inside text-gray-300 mb-4 space-y-2'>
              <li>Contact us through our website</li>
              <li>Submit feedback or bug reports</li>
              <li>Participate in surveys or discussions</li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3'>
              Automatically Collected Information
            </h3>
            <p className='text-gray-300 mb-4'>
              When you visit our site, we may automatically collect certain
              information, including:
            </p>
            <ul className='list-disc list-inside text-gray-300 mb-4 space-y-2'>
              <li>IP address and general location information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring website</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              How We Use Your Information
            </h2>
            <p className='text-gray-300 mb-4'>
              We use the information we collect to:
            </p>
            <ul className='list-disc list-inside text-gray-300 mb-4 space-y-2'>
              <li>Provide and improve our documentation services</li>
              <li>Analyze site usage and performance</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Ensure the security and integrity of our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Cookies and Tracking Technologies
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              What Are Cookies?
            </h3>
            <p className='text-gray-300 mb-4'>
              Cookies are small text files stored on your device when you visit
              our website. They help us provide you with a better experience and
              understand how you use our site.
            </p>

            <h3 className='text-xl font-medium text-white mb-3'>
              Types of Cookies We Use
            </h3>

            <div className='bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4'>
              <h4 className='text-lg font-medium text-white mb-2'>
                Essential Cookies
              </h4>
              <p className='text-gray-300 text-sm mb-2'>
                These cookies are necessary for the website to function
                properly. They cannot be disabled.
              </p>
              <ul className='text-gray-400 text-sm space-y-1'>
                <li>• Session management</li>
                <li>• Security features</li>
                <li>• Basic functionality</li>
              </ul>
            </div>

            <div className='bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4'>
              <h4 className='text-lg font-medium text-white mb-2'>
                Analytics Cookies
              </h4>
              <p className='text-gray-300 text-sm mb-2'>
                These cookies help us understand how visitors interact with our
                website by collecting and reporting information anonymously.
              </p>
              <ul className='text-gray-400 text-sm space-y-1'>
                <li>• Page views and navigation patterns</li>
                <li>• Popular content and features</li>
                <li>• Performance metrics</li>
              </ul>
            </div>

            <div className='bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4'>
              <h4 className='text-lg font-medium text-white mb-2'>
                Preference Cookies
              </h4>
              <p className='text-gray-300 text-sm mb-2'>
                These cookies allow the website to remember choices you make and
                provide enhanced, more personal features.
              </p>
              <ul className='text-gray-400 text-sm space-y-1'>
                <li>• Language preferences</li>
                <li>• Theme settings</li>
                <li>• Cookie consent choices</li>
              </ul>
            </div>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Your Rights and Choices
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              Cookie Consent
            </h3>
            <p className='text-gray-300 mb-4'>
              You can control which cookies are set on your device through our
              cookie consent banner. You can change your preferences at any time
              by clicking the cookie settings link in the footer.
            </p>

            <h3 className='text-xl font-medium text-white mb-3'>
              Your Data Protection Rights
            </h3>
            <p className='text-gray-300 mb-4'>
              Under GDPR and other applicable laws, you have the following
              rights:
            </p>
            <ul className='list-disc list-inside text-gray-300 mb-4 space-y-2'>
              <li>
                <strong>Right to Access:</strong> Request information about what
                personal data we hold about you
              </li>
              <li>
                <strong>Right to Rectification:</strong> Request correction of
                inaccurate personal data
              </li>
              <li>
                <strong>Right to Erasure:</strong> Request deletion of your
                personal data
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> Request
                limitation of how we process your data
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Request a copy of
                your data in a structured format
              </li>
              <li>
                <strong>Right to Object:</strong> Object to processing of your
                personal data
              </li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Data Security
            </h2>
            <p className='text-gray-300 mb-4'>
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Third-Party Services
            </h2>
            <p className='text-gray-300 mb-4'>
              We may use third-party services for analytics and functionality.
              These services have their own privacy policies, and we encourage
              you to review them. We do not sell, trade, or otherwise transfer
              your personal information to third parties.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Changes to This Policy
            </h2>
            <p className='text-gray-300 mb-4'>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              Contact Us
            </h2>
            <p className='text-gray-300 mb-4'>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <div className='bg-gray-900 border border-gray-700 rounded-lg p-4'>
              <p className='text-gray-300 text-sm'>
                <strong>Email:</strong> privacy@beamflow.com
                <br />
                <strong>GitHub Issues:</strong>{' '}
                <a
                  href='https://github.com/[your-username]/[your-repo-name]/issues'
                  className='text-red-400 hover:text-red-300 underline'
                >
                  Create an issue
                </a>
              </p>
            </div>
          </section>

          <div className='text-sm text-gray-400 border-t border-gray-700 pt-4'>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
