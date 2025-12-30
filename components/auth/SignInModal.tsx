"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  callbackUrl?: string
  packageId?: string
}

export function SignInModal({ isOpen, onClose, callbackUrl, packageId }: SignInModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [guestEmail, setGuestEmail] = useState("")
  const [guestName, setGuestName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)

  const handleGuestCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!guestEmail || !guestEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Store guest info in sessionStorage for checkout
      sessionStorage.setItem('guestCheckout', JSON.stringify({
        email: guestEmail,
        name: guestName || 'Guest',
        timestamp: Date.now()
      }))

      toast({
        title: "Success!",
        description: "Continuing as guest...",
      })

      // Close modal and redirect
      onClose()
      const redirectUrl = callbackUrl || '/upload'
      router.push(redirectUrl)
    } catch (error) {
      console.error('Guest checkout error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    try {
      const redirectUrl = callbackUrl || '/upload'
      await signIn(provider, { callbackUrl: redirectUrl })
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: `Could not sign in with ${provider}. Please try another method.`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          // Bloqueia o fechamento ao clicar fora
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // Bloqueia o fechamento com ESC
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Sign in to PhotoRestoreNow</DialogTitle>
          <DialogDescription className="text-center">
            {showGuestForm ? "Enter your email to continue" : "Choose your preferred sign-in method"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {!showGuestForm ? (
            <>
              <Button
                onClick={() => handleOAuthSignIn('google')}
                className="w-full"
                variant="outline"
                size="lg"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                onClick={() => handleOAuthSignIn('facebook')}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5]"
                size="lg"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue as guest
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowGuestForm(true)}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                Continue without account
              </Button>
            </>
          ) : (
            <form onSubmit={handleGuestCheckout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email Address *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-gray-500">
                  We'll send your restored photos to this email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestName">Name (Optional)</Label>
                <Input
                  id="guestName"
                  type="text"
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Continue to Upload"}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  variant="ghost"
                  className="w-full"
                  disabled={isLoading}
                >
                  Back to sign-in options
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
