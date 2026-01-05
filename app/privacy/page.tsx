import { SiteLayout } from '@/components/SiteLayout';

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: December 24, 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              PhotoRestoreNow ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our photo restoration service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address for order confirmation and delivery</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">Photo Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Photos you upload for restoration</li>
              <li>File metadata (size, type, upload time)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>To process and restore your photos using AI technology</li>
              <li>To deliver restored photos to your email</li>
              <li>To process payments securely</li>
              <li>To provide customer support</li>
              <li>To improve our service quality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encrypted transmission of all data (HTTPS/TLS)</li>
              <li>Secure cloud storage with AWS S3 or Cloudflare R2</li>
              <li>Payment processing handled by PCI-compliant Stripe</li>
              <li>Automatic deletion of photos 7 days after delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p>
              Your uploaded photos and restored images are automatically deleted from our 
              servers 7 days after delivery. We retain order information for accounting 
              purposes only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>VanceAI/Hotpot AI:</strong> Photo restoration AI</li>
              <li><strong>AWS S3/Cloudflare R2:</strong> Secure file storage</li>
              <li><strong>Resend:</strong> Email delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Request deletion of your data</li>
              <li>Access your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a refund within our guarantee period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@photorestorenow.com" className="text-primary hover:underline">
                privacy@photorestorenow.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
