#!/bin/bash

# Quick check for orders in database
echo "🔍 Checking database for orders..."
echo ""

npx prisma studio --browser none &
STUDIO_PID=$!

sleep 2

echo "✅ Prisma Studio started (PID: $STUDIO_PID)"
echo ""
echo "📊 Open manually: npx prisma studio"
echo ""
echo "Or check via SQL:"
echo ""
echo "psql postgresql://photorestore:photorestore_dev@localhost:5432/photorestore"
echo ""
echo "SELECT id, email, status, \"photoCount\", amount, \"createdAt\" FROM \"Order\" ORDER BY \"createdAt\" DESC LIMIT 5;"
echo ""
echo "SELECT id, status, provider, \"totalImages\", \"processedImages\", \"failedImages\" FROM \"Job\" ORDER BY \"createdAt\" DESC LIMIT 5;"
