# TESTING.md - PhotoRestoreNow Testing Guide

## Overview

This guide covers the Phase 1 and Phase 2 testing implementation for PhotoRestoreNow, allowing you to test AI restoration and complete order flows without requiring payment integration.

---

## Phase 1: Isolated AI Testing

Test AI restoration APIs (VanceAI and Hotpot) in isolation without payment flow.

### Option 1: Web Interface

**URL:** http://localhost:3000/test-upload

**Features:**
- Upload single photos
- Select AI provider (VanceAI or Hotpot)
- View original vs restored images
- Check processing time
- Download restored images

**Steps:**
1. Navigate to `/test-upload`
2. Select an image file
3. Choose provider (VanceAI or Hotpot)
4. Click "Test Restoration"
5. View results and compare images

### Option 2: API Endpoint

**Endpoint:** `POST /api/test-restore`

**Request:**
```bash
curl -X POST http://localhost:3000/api/test-restore \
  -F "image=@/path/to/photo.jpg" \
  -F "provider=vanceai"
```

**Response:**
```json
{
  "success": true,
  "testId": "uuid",
  "provider": "vanceai",
  "originalImage": {
    "path": "test/uuid-original-photo.jpg",
    "url": "http://localhost:3000/uploads/...",
    "size": 123456,
    "filename": "photo.jpg"
  },
  "restoredImage": {
    "path": "test/uuid-restored-photo.jpg",
    "url": "http://localhost:3000/uploads/...",
    "size": 234567
  },
  "processingTime": "12.34s"
}
```

**Postman/Thunder Client:**
1. Method: `POST`
2. URL: `http://localhost:3000/api/test-restore`
3. Body: `form-data`
   - `image`: File
   - `provider`: `vanceai` or `hotpot`

---

## Phase 2: Complete Flow Testing

Test the complete order flow (upload → restore → email) without payment.

### Setup

1. **Enable Test Mode**

Edit `.env`:
```bash
TEST_MODE=true
```

2. **Configure Email (Optional)**

If you want to test email delivery:
```bash
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

3. **Restart Server**
```bash
npm run dev
# or with Docker
docker-compose down && docker-compose up --build
```

### Option 1: Web Interface

**URL:** http://localhost:3000/test-order

**Features:**
- Select package (1/3/5/10 photos)
- Upload multiple photos
- Process complete order flow
- Receive email with restored photos
- View order status and results

**Steps:**
1. Navigate to `/test-order`
2. Enter email address
3. Select package
4. Upload photos (up to package limit)
5. Click "Create Test Order"
6. Wait for processing (30-60s per photo)
7. Check results and email

### Option 2: API Endpoint

**Endpoint:** `POST /api/payment/create-test-order`

**Request:**
```bash
curl -X POST http://localhost:3000/api/payment/create-test-order \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "packageId": "3-photos",
    "imageFiles": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "testMode": true,
  "orderId": "test_uuid",
  "email": "customer@example.com",
  "packageId": "3-photos",
  "processedImages": 3,
  "successfulRestores": 3,
  "failedRestores": 0,
  "message": "Test order completed. 3/3 photos restored successfully.",
  "results": [
    {
      "imageId": "test_uuid_img_1",
      "originalPath": "orders/test_uuid/original/...",
      "restoredPath": "orders/test_uuid/restored/...",
      "restoredUrl": "http://localhost:3000/uploads/...",
      "status": "success"
    }
  ]
}
```

---

## Testing Checklist

### Phase 1: Isolated AI Testing

- [ ] Test VanceAI provider with sample photo
- [ ] Test Hotpot provider with sample photo
- [ ] Verify restoration quality
- [ ] Check processing time (should be < 30s)
- [ ] Verify file storage (check `uploads/test/` folder)
- [ ] Test error handling (invalid file, wrong format)
- [ ] Compare both providers' results

### Phase 2: Complete Flow Testing

- [ ] Enable TEST_MODE in `.env`
- [ ] Test 1-photo package
- [ ] Test 3-photos package
- [ ] Test 5-photos package
- [ ] Test 10-photos package
- [ ] Verify email delivery
- [ ] Check download links in email
- [ ] Verify restored image quality
- [ ] Test with different image formats (JPG, PNG)
- [ ] Test with large files
- [ ] Verify order file structure (`orders/{orderId}/original` and `restored`)
- [ ] Test error handling (missing email, too many files)

---

## Test Files Structure

```
uploads/
├── test/                          # Phase 1 isolated tests
│   ├── {testId}-original-*.jpg
│   └── {testId}-restored-*.jpg
└── orders/                        # Phase 2 complete flow tests
    └── {orderId}/
        ├── original/
        │   ├── {orderId}_img_1.jpg
        │   └── {orderId}_img_2.jpg
        └── restored/
            ├── {orderId}_img_1.jpg
            └── {orderId}_img_2.jpg
```

---

## Troubleshooting

### Test Mode Not Working

**Problem:** Getting "Test mode is disabled" error

**Solution:**
```bash
# Check .env file
cat .env | grep TEST_MODE

# Should show: TEST_MODE=true

# If not set, add it:
echo "TEST_MODE=true" >> .env

# Restart server
npm run dev
```

### AI Provider Errors

**Problem:** "API key not configured" or restoration fails

**Solution:**
```bash
# Check API keys in .env
cat .env | grep API_KEY

# Should have:
VANCEAI_API_KEY=your_key_here
HOTPOT_API_KEY=your_key_here

# If testing without real keys, comment out AI calls
# in services/ai-provider.service.ts temporarily
```

### Email Not Sending

**Problem:** Email delivery fails

**Solution:**
```bash
# Check Resend configuration
cat .env | grep RESEND

# For testing without real email:
# 1. Check console logs - email content is logged
# 2. Use a test email service like Mailtrap
# 3. Or comment out emailService.sendRestoredPhotosEmail()
```

### File Upload Too Large

**Problem:** "File too large" error

**Solution:**
```bash
# Check max file size in .env
cat .env | grep MAX_FILE_SIZE

# Default is 10MB (10485760 bytes)
# Increase if needed:
MAX_FILE_SIZE=20971520  # 20MB
```

---

## Next Steps

After Phase 1 & 2 testing is complete:

### Phase 3: Stripe Integration
1. Get Stripe test API keys
2. Test with Stripe test cards
3. Install Stripe CLI for webhook testing
4. Test payment → job → restore → deliver flow
5. Verify webhook handling
6. Test refund scenarios

### Production Readiness
1. Switch TEST_MODE to false
2. Configure production API keys
3. Set up production email service
4. Configure production storage (S3/R2)
5. Set up monitoring and logging
6. Test with real payments in test mode
7. Deploy and monitor

---

## Example Test Workflow

```bash
# 1. Enable test mode
echo "TEST_MODE=true" >> .env

# 2. Start server
npm run dev

# 3. Phase 1: Test isolated restoration
curl -X POST http://localhost:3000/api/test-restore \
  -F "image=@sample-photo.jpg" \
  -F "provider=vanceai"

# 4. Phase 2: Test complete flow
# Visit http://localhost:3000/test-order in browser
# Upload 3 photos and submit

# 5. Verify results
# Check console logs
# Check email
# Check uploads/orders/ folder

# 6. Disable test mode for production
# TEST_MODE=false in .env
```

---

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Review this testing guide
3. Check ARCHITECTURE.md for system design
4. See DEVELOPMENT.md for setup instructions
