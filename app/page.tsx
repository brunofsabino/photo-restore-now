'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_ROUTES } from '@/lib/constants';
import { Sparkles, Clock, Shield, Heart, Star, User, LogOut } from 'lucide-react';
import { CartButton } from '@/components/CartButton';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';

export default function HomePage() {
  const { data: session, status } = useSession();
  
  // Example restoration images (you'll replace these with real ones)
  const examples = [
    {
      before: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=800&h=600&fit=crop&q=80&sat=-100&blur=3',
      after: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=800&h=600&fit=crop&q=80',
      title: 'Vintage Family Portrait',
    },
    {
      before: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&h=600&fit=crop&q=80&sat=-100&blur=2',
      after: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&h=600&fit=crop&q=80',
      title: 'Wedding Memories',
    },
    {
      before: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop&q=80&sat=-100&blur=2',
      after: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop&q=80',
      title: 'Childhood Photos',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            PhotoRestoreNow
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href={APP_ROUTES.PRICING} className="text-gray-600 hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
            {status === 'authenticated' && (
              <Link href={APP_ROUTES.DASHBOARD} className="text-gray-600 hover:text-primary transition-colors font-medium">
                My Photos
              </Link>
            )}
            <Link href="#examples" className="text-gray-600 hover:text-primary transition-colors font-medium">
              Examples
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors font-medium">
              How It Works
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <CartButton />
            {status === 'authenticated' ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-800">
                    Hello, {session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href={APP_ROUTES.PRICING}>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="h-4 w-4 fill-current" />
              <span>Trusted by 10,000+ Families</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Bring Your Old Photos
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Back to Life
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform damaged, faded, and scratched vintage photos into vibrant memories using advanced AI technology. Professional results in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={APP_ROUTES.PRICING}>
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-shadow">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Restore Your Photos
                </Button>
              </Link>
              <Link href="#examples">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  See Examples
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Before/After Slider */}
          <div className="mt-12">
            <BeforeAfterSlider
              beforeImage={examples[0].before}
              afterImage={examples[0].after}
              beforeLabel="Original"
              afterLabel="Restored"
              autoPlay={true}
            />
            <p className="text-center mt-4 text-gray-500 text-sm">
              ← Drag the slider to see the transformation →
            </p>
          </div>
        </div>
      </section>

      {/* Examples Gallery */}
      <section id="examples" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              See the Magic in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI technology removes scratches, repairs damage, enhances colors, and brings clarity to your precious memories.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            {examples.map((example, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  {example.title}
                </h3>
                <BeforeAfterSlider
                  beforeImage={example.before}
                  afterImage={example.after}
                  beforeLabel="Before"
                  afterLabel="After"
                />
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href={APP_ROUTES.PRICING}>
              <Button size="lg" className="text-lg px-8 py-6">
                Start Restoring Your Photos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            Why Choose PhotoRestoreNow?
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Professional AI-powered restoration with guaranteed results
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced artificial intelligence automatically removes scratches, repairs damage, and enhances colors.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get your restored photos delivered within 24 hours via email. No waiting weeks!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your photos are processed securely and automatically deleted after delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors hover:shadow-xl">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">100% Guaranteed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Not happy with the results? We'll refund you 100%, no questions asked.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Simple 5-step process to restore your precious memories
          </p>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: 'Choose Your Package',
                  description: 'Select the package that fits your needs - from 1 to 5 photos.',
                  icon: '📦',
                },
                {
                  step: 2,
                  title: 'Upload Your Photos',
                  description: 'Securely upload your old photos. We accept JPG, PNG, and WEBP formats.',
                  icon: '📸',
                },
                {
                  step: 3,
                  title: 'Secure Payment',
                  description: 'Pay safely with credit card. Your payment is protected by Stripe.',
                  icon: '💳',
                },
                {
                  step: 4,
                  title: 'AI Magic Happens',
                  description: 'Our AI technology works its magic to restore your precious memories.',
                  icon: '✨',
                },
                {
                  step: 5,
                  title: 'Download & Enjoy',
                  description: 'Receive your restored photos via email within 24 hours!',
                  icon: '🎉',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start p-6 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{item.icon}</span>
                      <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Family Historian',
                content: 'Absolutely amazing! They restored my grandmother\'s wedding photo from 1952. I cried when I saw the results. Worth every penny!',
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Photography Enthusiast',
                content: 'The AI technology is incredible. It fixed scratches I thought were impossible to remove. My dad was so happy to see his childhood photos restored.',
                rating: 5,
              },
              {
                name: 'Linda Martinez',
                role: 'Genealogy Researcher',
                content: 'I\'ve used several photo restoration services, but this is by far the best. Fast, affordable, and the quality is outstanding.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">&quot;{testimonial.content}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Restore Your Memories?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied customers who've brought their old photos back to life. Get started in minutes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={APP_ROUTES.PRICING}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-5 w-5 fill-white" />
              <span className="font-semibold">4.9/5 from 2,500+ reviews</span>
            </div>
          </div>
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
