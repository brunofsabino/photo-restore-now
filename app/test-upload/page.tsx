'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  success: boolean;
  testId?: string;
  provider?: string;
  originalImage?: {
    path: string;
    url: string;
    size: number;
    filename: string;
  };
  restoredImage?: {
    path: string;
    url: string;
    size: number;
  };
  processingTime?: string;
  error?: string;
  message?: string;
}

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<'vanceai' | 'hotpot'>('vanceai');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('provider', provider);

      const response = await fetch('/api/test-restore', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        console.error('Test failed:', data);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: 'Failed to communicate with server',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Photo Restoration Test</h1>
          <p className="text-gray-600">
            Phase 1 & 2 Testing - Upload images and test AI restoration without payment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Test Image</CardTitle>
              <CardDescription>
                Test VanceAI or Hotpot restoration with any photo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Input */}
                <div>
                  <Label htmlFor="image">Select Image</Label>
                  <div className="mt-2">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div>
                    <Label>Preview</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-64 object-contain bg-gray-100"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}

                {/* Provider Selection */}
                <div>
                  <Label>AI Provider</Label>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="vanceai"
                        checked={provider === 'vanceai'}
                        onChange={(e) => setProvider(e.target.value as 'vanceai')}
                        className="mr-2"
                      />
                      VanceAI
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="hotpot"
                        checked={provider === 'hotpot'}
                        onChange={(e) => setProvider(e.target.value as 'hotpot')}
                        className="mr-2"
                      />
                      Hotpot AI
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Test Restoration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                View restoration results and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon className="mx-auto h-16 w-16 mb-4" />
                  <p>Upload an image to see results</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Processing with {provider}...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
                </div>
              )}

              {result && !result.success && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-6 w-6" />
                    <h3 className="font-semibold text-lg">Restoration Failed</h3>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-medium">{result.message}</p>
                    {result.error && (
                      <p className="text-sm mt-2 text-red-700">{result.error}</p>
                    )}
                  </div>
                </div>
              )}

              {result && result.success && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <h3 className="font-semibold text-lg">Success!</h3>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Provider</p>
                      <p className="font-semibold capitalize">{result.provider}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">Processing Time</p>
                      <p className="font-semibold">{result.processingTime}</p>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="font-medium mb-2">Original Image</h4>
                    <img 
                      src={result.originalImage?.url} 
                      alt="Original"
                      className="w-full border rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Size: {((result.originalImage?.size || 0) / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Restored Image</h4>
                    <img 
                      src={result.restoredImage?.url} 
                      alt="Restored"
                      className="w-full border rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Size: {((result.restoredImage?.size || 0) / 1024).toFixed(2)} KB
                    </p>
                    <a
                      href={result.restoredImage?.url}
                      download
                      className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                    >
                      Download Restored Image
                    </a>
                  </div>

                  {/* Technical Details */}
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <pre className="mt-2 bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>Test with cURL</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
{`curl -X POST http://localhost:3000/api/test-restore \\
  -F "image=@/path/to/photo.jpg" \\
  -F "provider=vanceai"`}
            </pre>

            <h3 className="mt-4">Test with Postman/Thunder Client</h3>
            <ul>
              <li>Method: POST</li>
              <li>URL: http://localhost:3000/api/test-restore</li>
              <li>Body: form-data
                <ul>
                  <li>image: File</li>
                  <li>provider: vanceai or hotpot</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
