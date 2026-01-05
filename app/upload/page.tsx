'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { PRICING_PACKAGES, APP_ROUTES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { formatPrice, formatFileSize, isValidFileType, isValidFileSize } from '@/lib/utils';
import { PackageType } from '@/types';
import { Upload, X, AlertCircle } from 'lucide-react';
import { CartButton } from '@/components/CartButton';

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const packageId = (searchParams.get('package') as PackageType) || '1-photo';
  const packageInfo = PRICING_PACKAGES.find(p => p.id === packageId);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  if (!packageInfo) {
    return <div>Package not found</div>;
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    filesArray.forEach(file => {
      if (!isValidFileType(file, ALLOWED_FILE_TYPES)) {
        errors.push(`${file.name}: Invalid file type. Please use JPG, PNG, or WEBP.`);
        return;
      }

      if (!isValidFileSize(file, MAX_FILE_SIZE)) {
        errors.push(`${file.name}: File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
        return;
      }

      validFiles.push(file);
    });

    // Check if total exceeds package limit
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > packageInfo.photoCount) {
      errors.push(`You can only upload ${packageInfo.photoCount} photo(s) for this package.`);
      const remainingSlots = packageInfo.photoCount - selectedFiles.length;
      validFiles.splice(remainingSlots);
    }

    if (errors.length > 0) {
      toast({
        title: 'Upload Error',
        description: errors[0],
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No Photos Selected',
        description: 'Please upload at least one photo.',
        variant: 'destructive',
      });
      return;
    }

    await addToCart(packageId, selectedFiles);
    router.push(APP_ROUTES.CHECKOUT);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
            PhotoRestoreNow
          </Link>
          <div className="flex items-center gap-4">
            <CartButton />
            <Link href={APP_ROUTES.PRICING}>
              <Button variant="ghost">Back to Pricing</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Photos</h1>
          <p className="text-gray-600">
            Selected Package: <span className="font-semibold">{packageInfo.name}</span> - {formatPrice(packageInfo.price)}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Photos to Restore</CardTitle>
            <CardDescription>
              Upload up to {packageInfo.photoCount} {packageInfo.photoCount === 1 ? 'photo' : 'photos'}.
              Supported formats: JPG, PNG, WEBP (Max 10MB each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-300 hover:border-primary'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                Drag & drop your photos here
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  Selected Photos ({selectedFiles.length}/{packageInfo.photoCount})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="ml-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Upload clear, high-resolution scans for best results</li>
                  <li>Photos will be securely deleted 7 days after delivery</li>
                  <li>We never share your photos with third parties</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={APP_ROUTES.PRICING}>
              <Button variant="outline">Change Package</Button>
            </Link>
            <Button
              onClick={handleContinue}
              disabled={selectedFiles.length === 0}
              size="lg"
            >
              Continue to Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}
