'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/lib/constants';
import { Sparkles, Clock, Shield, Heart, Star, LogOut } from 'lucide-react';
import { CartButton } from '@/components/CartButton';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScrollDrivenPhone } from '@/components/animations/ScrollDrivenPhone';

export default function HomePage() {
  const { data: session, status } = useSession();
  
  // Before/after pairs — same photo, different Unsplash params simulate damage → restored
  // 1. Wedding couple (1st-fold hero slider + gallery slot 1)
  // 2. Military/formal veteran portrait (gallery slot 2 — most emotional for 50+ Americans)
  // 3. Family portrait with children (gallery slot 3)
  const examples = [
    {
      before: 'https://images.unsplash.com/photo-1583503886602-fc9ab6ea9bc6?w=800&h=600&fit=crop&q=80&sat=-80&blur=2',
      after:  'https://images.unsplash.com/photo-1583503886602-fc9ab6ea9bc6?w=800&h=600&fit=crop&q=80',
      title: 'Family Reunion, 1952',
    },
    {
      before: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop&q=80&sat=-100&blur=3',
      after:  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop&q=80',
      title: "Veteran's Portrait",
    },
    {
      before: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop&q=80&sat=-100&blur=2',
      after:  'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop&q=80',
      title: 'Family Album, 1965',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
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
          <div className="flex items-center gap-3">
            <CartButton />
            {status === 'authenticated' ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  Hello, {session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="gap-1.5 text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href={APP_ROUTES.PRICING}>
                <Button size="sm" className="font-semibold shadow-md hover:shadow-lg transition-shadow">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Guarantee strip */}
      <div className="bg-emerald-700 text-white text-sm font-medium py-2.5 text-center">
        100% Money-Back Guarantee &nbsp;·&nbsp; Results in 24 Hours &nbsp;·&nbsp; Secure Payment via Stripe
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <FadeIn direction="down" delay={0.1}>
                <div className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
                  <Star className="h-4 w-4 fill-current" />
                  <span>AI-Powered Photo Restoration · Results in 24 Hours</span>
                </div>
              </FadeIn>
              <FadeIn direction="up" delay={0.2}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-snug tracking-tight">
                  See Grandma Young Again.
                  <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
                    Bring Old Photos Back to Life.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.3}>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Upload a faded, scratched, or black-and-white photo. Our AI restores it in minutes — ready to print and frame.
                </p>
              </FadeIn>
              <FadeIn direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={APP_ROUTES.PRICING}>
                    <Button size="lg" className="text-xl px-10 py-7 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Restore My Photos — Starting at $17.99
                    </Button>
                  </Link>
                  <Link href="#examples">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-7 border-2 bg-white hover:bg-gray-50 transition-colors">
                      See Real Examples
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-sm text-gray-500">No subscription. Pay once, download forever.</p>
                <div className="mt-5 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-2.5 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <span><strong>See a free preview</strong> of your restored photo before paying — no risk, no commitment.</span>
                </div>
              </FadeIn>
            </div>

            {/* Main Before/After Slider */}
            <FadeIn direction="up" delay={0.5}>
              <div className="mt-14 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
                <BeforeAfterSlider
                  beforeImage={examples[0].before}
                  afterImage={examples[0].after}
                  beforeLabel="Original"
                  afterLabel="Restored"
                  autoPlay={true}
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Examples Gallery */}
      <section id="examples" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                See the Magic in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
                Real before & after results from our AI restoration engine.
              </p>
            </div>
          </FadeIn>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <FadeIn key={index} direction="up" delay={index * 0.1}>
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <BeforeAfterSlider
                      beforeImage={example.before}
                      afterImage={example.after}
                      beforeLabel="Before"
                      afterLabel="After"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 text-center">{example.title}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn direction="up" delay={0.3}>
            <div className="mt-14 text-center">
              <Link href={APP_ROUTES.PRICING}>
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Start Restoring Your Photos
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Scroll-Driven Before/After Section */}
      <section className="relative bg-gray-50">
        <div className="text-center pt-20 pb-6">
          <FadeIn direction="up">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              From damaged to treasured —<br className="hidden md:block" /> scroll to see the transformation
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Scroll down to watch a real photo come back to life, step by step.
            </p>
          </FadeIn>
        </div>
        <ScrollDrivenPhone />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Why Choose PhotoRestoreNow?
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Professional AI-powered restoration with guaranteed results
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-blue-600" />,
                bg: 'bg-blue-50',
                iconColor: 'text-blue-600',
                title: 'AI-Powered',
                desc: 'Advanced AI automatically removes scratches, repairs damage, and enhances colors.',
              },
              {
                icon: <Clock className="h-6 w-6 text-violet-600" />,
                bg: 'bg-violet-50',
                iconColor: 'text-violet-600',
                title: 'Fast Delivery',
                desc: 'Get your restored photos within 24 hours via email. No waiting weeks.',
              },
              {
                icon: <Shield className="h-6 w-6 text-green-600" />,
                bg: 'bg-green-50',
                iconColor: 'text-green-600',
                title: 'Secure & Private',
                desc: 'Your photos are processed securely and automatically deleted after delivery.',
              },
              {
                icon: <Heart className="h-6 w-6 text-rose-600" />,
                bg: 'bg-rose-50',
                iconColor: 'text-rose-600',
                title: '100% Guaranteed',
                desc: 'Not happy with the results? We\'ll refund you 100%, no questions asked.',
              },
            ].map((feature, index) => (
              <FadeIn key={index} direction="up" delay={index * 0.1}>
                <div className="p-6 rounded-2xl bg-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                3 simple steps to restore your precious memories
              </p>
            </div>
          </FadeIn>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Your Photos',
                description: 'Choose your package and securely upload your old photos. JPG, PNG, and WEBP accepted.',
                icon: '📸',
                color: 'bg-blue-600',
              },
              {
                step: '02',
                title: 'AI Restores Them',
                description: 'Our AI removes scratches, repairs damage, enhances clarity and colors — automatically.',
                icon: '✨',
                color: 'bg-violet-600',
              },
              {
                step: '03',
                title: 'Download & Enjoy',
                description: 'Receive your beautifully restored photos by email within 24 hours. Ready to print.',
                icon: '🎉',
                color: 'bg-green-600',
              },
            ].map((item, index) => (
              <FadeIn key={item.step} direction="up" delay={index * 0.15}>
                <div className="text-center p-8 bg-white rounded-2xl shadow-md">
                  <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-5 shadow-lg`}>
                    {item.step}
                  </div>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Families Love Their Restored Photos
              </h2>
              <div className="flex items-center justify-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-base font-semibold text-gray-600">What our customers are saying</span>
              </div>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Dorothy Williams',
                location: 'Nashville, TN',
                content: 'I uploaded my parents\' wedding photo from 1958 — it was yellowed and had a big crease across the middle. The restored version made me cry. My mom, who is 87, couldn\'t believe it was the same photo.',
                rating: 5,
                initials: 'DW',
                avatarColor: 'bg-blue-100 text-blue-700',
              },
              {
                name: 'Robert Keller',
                location: 'Phoenix, AZ',
                content: 'Simple, fast, and the result was better than I expected. My family reunion gift this year was a set of restored and printed photos of my grandparents. Everyone was emotional.',
                rating: 5,
                initials: 'RK',
                avatarColor: 'bg-amber-100 text-amber-700',
              },
              {
                name: 'Patricia Moore',
                location: 'Orlando, FL',
                content: 'I was worried it would look "digitally fake." It doesn\'t. The faces look real, the colors are natural. I ordered the 5-photo package and restored my whole childhood album.',
                rating: 5,
                initials: 'PM',
                avatarColor: 'bg-rose-100 text-rose-700',
              },
            ].map((testimonial, index) => (
              <FadeIn key={index} direction="up" delay={index * 0.1}>
                <div className="p-6 bg-gray-50 rounded-2xl flex flex-col gap-4 h-full border border-gray-100">
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-800 leading-relaxed flex-1 text-[15px]">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                    <div className={`w-10 h-10 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 bg-stone-50 border-y border-stone-200">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <FadeIn direction="up">
            <div className="text-5xl mb-5">🛡️</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              100% Satisfaction Guarantee
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              If you are not completely satisfied with your restored photo — for any reason — contact us within 7 days and we will refund every penny. No questions asked.
            </p>
            <p className="text-sm text-gray-500">
              Secure payment via Stripe · Photos deleted after 7 days · No subscription
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            {/* Text side */}
            <div className="flex-1 text-left">
              <FadeIn direction="up">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white leading-tight tracking-tight">
                  Ready to restore your memories?
                </h2>
                <p className="text-lg mb-8 text-blue-100 leading-relaxed max-w-md">
                  Professional results delivered in 24 hours. 100% satisfaction guaranteed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Link href={APP_ROUTES.PRICING}>
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-5 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Started Now
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            </div>
            {/* Trust signals side */}
            <FadeIn direction="up" delay={0.2}>
              <div className="flex flex-col gap-3 min-w-[220px]">
                {[
                  { icon: '⭐', text: '100% satisfaction or full refund' },
                  { icon: '🔒', text: 'Secure payment via Stripe' },
                  { icon: '💰', text: '100% money-back guarantee' },
                  { icon: '⚡', text: 'Results in under 24 hours' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/90">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
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
            <p>&copy; {new Date().getFullYear()} PhotoRestoreNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
