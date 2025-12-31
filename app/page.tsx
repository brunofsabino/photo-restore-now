import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_ROUTES } from '@/lib/constants';
import { Sparkles, Clock, Shield, Heart } from 'lucide-react';
import { CartButton } from '@/components/CartButton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
            PhotoRestoreNow
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href={APP_ROUTES.PRICING} className="text-gray-600 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">
              Testimonials
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <CartButton />
            <Link href={APP_ROUTES.PRICING}>
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bring Your Old Photos
            <span className="block text-primary">Back to Life</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform damaged, faded, and scratched vintage photos into vibrant memories using advanced AI technology. Professional results in 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={APP_ROUTES.PRICING}>
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                Restore Your Photos
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Before/After Preview */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
              Before
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg shadow-xl"></div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
              After
            </div>
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose PhotoRestoreNow?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced artificial intelligence automatically removes scratches, repairs damage, and enhances colors.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your restored photos delivered within 24 hours via email. No waiting weeks!
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your photos are processed securely and automatically deleted after delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Satisfaction Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Not happy with the results? We'll refund you 100%, no questions asked.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: 'Choose Your Package',
                  description: 'Select the package that fits your needs - from 1 to 5 photos.',
                },
                {
                  step: 2,
                  title: 'Upload Your Photos',
                  description: 'Securely upload your old photos. We accept JPG, PNG, and WEBP formats.',
                },
                {
                  step: 3,
                  title: 'Secure Payment',
                  description: 'Pay safely with credit card or PayPal. Your payment is protected.',
                },
                {
                  step: 4,
                  title: 'AI Magic Happens',
                  description: 'Our AI technology works its magic to restore your precious memories.',
                },
                {
                  step: 5,
                  title: 'Download & Enjoy',
                  description: 'Receive your restored photos via email within 24 hours!',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Restore Your Memories?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied customers who've brought their old photos back to life.
          </p>
          <Link href={APP_ROUTES.PRICING}>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PhotoRestoreNow</h3>
              <p className="text-gray-400">
                Professional AI-powered photo restoration service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={APP_ROUTES.PRICING} className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href={APP_ROUTES.DASHBOARD} className="text-gray-400 hover:text-white transition-colors">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={APP_ROUTES.PRIVACY} className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href={APP_ROUTES.TERMS} className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 PhotoRestoreNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
