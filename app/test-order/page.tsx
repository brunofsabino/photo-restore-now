'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRICING_PACKAGES } from '@/lib/constants';
import { Upload, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface OrderResult {
  success: boolean;
  testMode?: boolean;
  orderId?: string;
  email?: string;
  packageId?: string;
  processedImages?: number;
  successfulRestores?: number;
  failedRestores?: number;
  message?: string;
  error?: any;
}

export default function TestOrderPage() {
  const router = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [selectedPackage, setSelectedPackage] = useState('1-photo');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);

  const packageInfo = PRICING_PACKAGES.find(p => p.id === selectedPackage);
  const maxPhotos = packageInfo?.photoCount || 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > maxPhotos) {
      alert(`This package allows maximum ${maxPhotos} photo(s). Please select fewer files.`);
      return;
    }
    
    setSelectedFiles(files);
    setResult(null);
  };

  const convertFilesToBase64 = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    if (selectedFiles.length > maxPhotos) {
      alert(`This package allows maximum ${maxPhotos} photo(s)`);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Convert files to base64
      const imageFiles = await convertFilesToBase64(selectedFiles);

      // Create test order
      const response = await fetch('/api/payment/create-test-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          packageId: selectedPackage,
          imageFiles,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        console.error('Test order failed:', data);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: 'Failed to create test order',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Test Order Flow</h1>
          <p className="text-gray-600">
            Phase 2 Testing - Complete flow without payment (upload → restore → email)
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Test Mode - No payment required
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Test Order</CardTitle>
              <CardDescription>
                Upload photos and test the complete restoration flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Restored photos will be sent to this email
                  </p>
                </div>

                {/* Package Selection */}
                <div>
                  <Label>Select Package</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {PRICING_PACKAGES.map(pkg => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackage(pkg.id);
                          setSelectedFiles([]);
                        }}
                        className={`p-3 border-2 rounded-lg text-left transition-colors ${
                          selectedPackage === pkg.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-sm">{pkg.name}</div>
                        <div className="text-xs text-gray-600">
                          {pkg.photoCount} photo{pkg.photoCount > 1 ? 's' : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="images">
                    Upload Photos (max {maxPhotos})
                  </Label>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">
                        {selectedFiles.length} file(s) selected:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 mt-1">
                        {selectedFiles.map((file, i) => (
                          <li key={i}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={selectedFiles.length === 0 || loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Create Test Order
                    </>
                  )}
                </Button>

                {loading && (
                  <p className="text-sm text-center text-gray-600">
                    This may take 30-60 seconds per photo...
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Order Results</CardTitle>
              <CardDescription>
                View processing results and email delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="text-center py-12 text-gray-400">
                  <Upload className="mx-auto h-16 w-16 mb-4" />
                  <p>Create a test order to see results</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600 font-medium">Processing Your Order</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p>1. Uploading original photos...</p>
                    <p>2. Restoring with AI...</p>
                    <p>3. Sending email...</p>
                  </div>
                </div>
              )}

              {result && !result.success && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-6 w-6" />
                    <h3 className="font-semibold text-lg">Order Failed</h3>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-medium">{result.message}</p>
                    {result.error?.message && (
                      <p className="text-sm mt-2 text-red-700">{result.error.message}</p>
                    )}
                    {result.error?.code && (
                      <p className="text-xs mt-1 text-red-600">Error Code: {result.error.code}</p>
                    )}
                  </div>
                </div>
              )}

              {result && result.success && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <h3 className="font-semibold text-lg">Order Complete!</h3>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-medium text-green-800">{result.message}</p>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Order ID</span>
                      <span className="font-mono text-sm">{result.orderId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{result.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Package</span>
                      <span className="font-medium capitalize">
                        {result.packageId?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Processed</span>
                      <span className="font-medium">{result.processedImages} photos</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Successful</span>
                      <span className="font-medium text-green-600">
                        {result.successfulRestores} restored
                      </span>
                    </div>
                    {result.failedRestores! > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Failed</span>
                        <span className="font-medium text-red-600">
                          {result.failedRestores}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      📧 Restored photos have been sent to <strong>{result.email}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Check your inbox for download links
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Phase 2 Testing Information
            </h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✅ No payment required - orders auto-approved</li>
              <li>✅ Real AI restoration using VanceAI or Hotpot</li>
              <li>✅ Real email delivery with download links</li>
              <li>✅ Complete end-to-end workflow test</li>
              <li>⚠️ Set TEST_MODE=true in .env to enable</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
