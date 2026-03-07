#!/bin/bash

# Get Latest Payment Intent from Stripe
# Retrieves the most recent payment intent to help simulate webhook

echo "🔍 Fetching latest payment intent from Stripe..."
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "⚠️  Stripe CLI not installed"
    echo ""
    echo "Option 1: Install Stripe CLI"
    echo "  https://stripe.com/docs/stripe-cli"
    echo ""
    echo "Option 2: Check Stripe Dashboard"
    echo "  1. Go to: https://dashboard.stripe.com/test/payments"
    echo "  2. Click on the latest payment"
    echo "  3. Copy the 'Payment Intent ID' (starts with pi_)"
    echo "  4. Copy the metadata -> fileKeys"
    echo ""
    echo "Then run:"
    echo "  node simulate-webhook.js <fileKey1> <fileKey2> ..."
    exit 1
fi

# Get latest payment intent
stripe payment_intents list --limit 1 | grep -A 20 "id:"

echo ""
echo "📋 Next Steps:"
echo "  1. Copy the 'id' (starts with pi_)"
echo "  2. Copy the 'metadata.fileKeys'"
echo "  3. Run: node simulate-webhook.js <fileKeys>"
