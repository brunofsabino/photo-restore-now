"use client"

import { useState, FormEvent } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface StripePaymentFormProps {
  amount: number
  onSuccess: () => void
}

export function StripePaymentForm({ amount, onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred')
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed.",
        })
        // Clear cart before redirect
        onSuccess();
        // Redirect to success page
        window.location.href = `/payment/success?payment_intent=${paymentIntent.id}`;
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred')
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>💳 Payment Methods Available:</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-2 space-y-1">
          <li>✅ Credit/Debit Cards (Visa, Mastercard, Amex)</li>
          <li>✅ Link (One-click checkout)</li>
          <li>🔒 Apple Pay & Google Pay (HTTPS only - available in production)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'accordion',
            paymentMethodOrder: ['card', 'link', 'paypal', 'apple_pay', 'google_pay'],
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Processing...
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        🔒 Secure payment powered by Stripe
      </p>
    </form>
  )
}
