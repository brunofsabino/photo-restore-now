export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: December 24, 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using PhotoRestoreNow, you accept and agree to be bound by 
              these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <p>
              PhotoRestoreNow provides AI-powered photo restoration services. We use artificial 
              intelligence technology to restore, enhance, and repair old or damaged photographs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <h3 className="text-xl font-semibold mb-2">You agree to:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Only upload photos that you own or have permission to use</li>
              <li>Not upload any illegal, offensive, or copyrighted content</li>
              <li>Provide accurate email address for delivery</li>
              <li>Not abuse or attempt to manipulate our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Payment and Refunds</h2>
            <p>
              Payment is required before photo processing begins. We accept credit cards and 
              PayPal through Stripe. All prices are in USD.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">Refund Policy</h3>
            <p>
              We offer a 100% satisfaction guarantee. If you're not satisfied with the restoration 
              results, contact us within 7 days of delivery for a full refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Service Limitations</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Maximum file size: 10MB per photo</li>
              <li>Supported formats: JPG, JPEG, PNG, WEBP</li>
              <li>Processing time: Usually within 24 hours</li>
              <li>Results may vary based on photo quality and damage extent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p>
              You retain all rights to your original photos. The restored photos are provided 
              for your personal use. PhotoRestoreNow does not claim any ownership of your photos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p>
              PhotoRestoreNow is provided "as is" without warranties of any kind. We are not 
              liable for any damages arising from the use of our service, including but not 
              limited to data loss or unsatisfactory restoration results.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Deletion</h2>
            <p>
              All uploaded photos and restored images are automatically deleted from our servers 
              7 days after delivery. Please ensure you download your restored photos within this period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting. Continued use of the service constitutes acceptance of 
              modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p>
              For questions about these Terms of Service, contact:{' '}
              <a href="mailto:legal@photorestorenow.com" className="text-primary hover:underline">
                legal@photorestorenow.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
