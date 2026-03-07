#!/bin/bash
# Switch between AI Provider modes
# Usage: ./switch-ai-mode.sh [fake|vanceai]

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: .env.local not found"
  exit 1
fi

MODE=$1

if [ -z "$MODE" ]; then
  # Show current mode
  CURRENT=$(grep "^AI_PROVIDER=" "$ENV_FILE" | head -1 | cut -d'=' -f2)
  echo "📊 Current AI Provider: $CURRENT"
  echo ""
  echo "Usage: ./switch-ai-mode.sh [fake|vanceai]"
  echo ""
  echo "Modes:"
  echo "  fake     - 🧪 Development mode (NO credits used)"
  echo "  vanceai  - 🎨 Production mode (uses VanceAI credits)"
  exit 0
fi

case "$MODE" in
  fake)
    # Check if already in fake mode
    if grep -q "^AI_PROVIDER=fake" "$ENV_FILE"; then
      echo "✅ Already in FAKE mode (no changes needed)"
      exit 0
    fi
    
    # Switch to fake mode
    sed -i 's/^AI_PROVIDER=vanceai/AI_PROVIDER=fake/' "$ENV_FILE"
    echo "✅ Switched to FAKE provider"
    echo "   💰 Credits preserved: Not using VanceAI"
    echo "   🧪 Perfect for development and testing"
    ;;
    
  vanceai)
    # Check if already in vanceai mode
    if grep -q "^AI_PROVIDER=vanceai" "$ENV_FILE"; then
      echo "✅ Already in VANCEAI mode (no changes needed)"
      exit 0
    fi
    
    # Switch to vanceai mode
    sed -i 's/^AI_PROVIDER=fake/AI_PROVIDER=vanceai/' "$ENV_FILE"
    echo "✅ Switched to VANCEAI provider"
    echo "   💰 Credits will be consumed: ~1 credit per photo"
    echo "   🎨 Real photo restoration active"
    echo ""
    echo "⚠️  WARNING: Each photo restoration costs 1 VanceAI credit"
    ;;
    
  *)
    echo "❌ Invalid mode: $MODE"
    echo "Usage: ./switch-ai-mode.sh [fake|vanceai]"
    exit 1
    ;;
esac

# Show new configuration
echo ""
echo "📋 Current configuration:"
grep "^AI_PROVIDER=" "$ENV_FILE" | head -1
echo ""
echo "💡 Restart your Next.js server if it's running"
