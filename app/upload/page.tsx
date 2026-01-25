'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { PRICING_PACKAGES, APP_ROUTES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, SERVICE_OPTIONS } from '@/lib/constants';
import { formatPrice, formatFileSize, isValidFileType, isValidFileSize, calculateServicePrice, getServiceOption } from '@/lib/utils';
import { readFile } from '@/lib/image-crop';
import { PackageType, ServiceType } from '@/types';
import { Upload, X, AlertCircle, User, LogOut } from 'lucide-react';
import { CartButton } from '@/components/CartButton';
import { ImageCropModal } from '@/components/ImageCropModal';

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { data: session, status } = useSession();

  const packageId = (searchParams.get('package') as PackageType) || '1-photo';
  const serviceType = (searchParams.get('service') as ServiceType) || 'restoration';
  const packageInfo = PRICING_PACKAGES.find(p => p.id === packageId);
  const serviceInfo = getServiceOption(serviceType);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  
  // Crop modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // Check for guest checkout on mount
  useEffect(() => {
    const guestCheckout = sessionStorage.getItem('guestCheckout');
    if (guestCheckout) {
      console.log('[Upload Page] Found guest checkout', guestCheckout);
      setIsGuestCheckout(true);
    }
  }, []);

  // Redirect to service selection if no service specified
  if (!searchParams.get('service')) {
    router.push(`/select-service?package=${packageId}`);
    return null;
  }

  // Redirect to signin if not authenticated AND not guest checkout
  if (status === 'unauthenticated' && !isGuestCheckout) {
    // Check sessionStorage one more time before redirecting
    if (typeof window !== 'undefined') {
      const guestCheckout = sessionStorage.getItem('guestCheckout');
      if (!guestCheckout) {
        router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(`/upload?package=${packageId}&service=${serviceType}`));
        return null;
      } else {
        setIsGuestCheckout(true);
      }
    }
  }

  // Show loading while checking authentication
  if (status === 'loading' && !isGuestCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!packageInfo) {
    return <div>Package not found</div>;
  }

  const handleFileSelect = async (files: FileList | null) => {
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
      // Start crop flow with first image
      setPendingFiles(validFiles);
      setCurrentFileIndex(0);
      await openCropModal(validFiles[0]);
    }
  };

  const openCropModal = async (file: File) => {
    try {
      const imageSrc = await readFile(file);
      setCurrentImageSrc(imageSrc);
      setCurrentFileName(file.name);
      setCropModalOpen(true);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to load image for cropping',
        variant: 'destructive',
      });
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    // Add cropped file to selected files
    setSelectedFiles(prev => [...prev, croppedFile]);
    
    // Move to next file
    const nextIndex = currentFileIndex + 1;
    if (nextIndex < pendingFiles.length) {
      setCurrentFileIndex(nextIndex);
      await openCropModal(pendingFiles[nextIndex]);
    } else {
      // All files processed - close modal
      setCropModalOpen(false);
      setPendingFiles([]);
      setCurrentFileIndex(0);
      setCurrentImageSrc('');
      setCurrentFileName('');
      
      toast({
        title: 'Success',
        description: `${pendingFiles.length} photo${pendingFiles.length > 1 ? 's' : ''} cropped and ready!`,
      });
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    
    // Se cancelar, remove apenas as fotos pendentes
    // Mantém as fotos já cropadas
    const cancelledCount = pendingFiles.length - currentFileIndex;
    
    setPendingFiles([]);
    setCurrentFileIndex(0);
    setCurrentImageSrc('');
    setCurrentFileName('');
    
    if (cancelledCount > 0) {
      toast({
        title: 'Upload Cancelled',
        description: `${cancelledCount} photo${cancelledCount > 1 ? 's' : ''} not uploaded. ${selectedFiles.length} photo${selectedFiles.length !== 1 ? 's' : ''} already added.`,
        variant: 'destructive',
      });
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

    // Validate exact number of photos
    if (selectedFiles.length !== packageInfo.photoCount) {
      toast({
        title: 'Incorrect Number of Photos',
        description: `You selected the ${packageInfo.name} which requires exactly ${packageInfo.photoCount} photo${packageInfo.photoCount > 1 ? 's' : ''}. You have ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}.`,
        variant: 'destructive',
      });
      return;
    }

    await addToCart(packageId, serviceType, selectedFiles);
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
          <div className="flex items-center gap-3">
            <CartButton />
            {session?.user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-800">
                    {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {session?.user && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <p className="text-lg font-medium text-gray-800">
              👋 Hello, {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}! Ready to restore your memories?
            </p>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Photos</h1>
          <div className="space-y-1">
            <p className="text-gray-600">
              <span className="font-semibold">{packageInfo.name}</span> - {packageInfo.photoCount} {packageInfo.photoCount === 1 ? 'Photo' : 'Photos'}
            </p>
            <p className="text-gray-600">
              Service: <span className="font-semibold">{serviceInfo?.icon} {serviceInfo?.name}</span> - {formatPrice(calculateServicePrice(packageInfo.basePrice, serviceType))}
            </p>
          </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    Selected Photos ({selectedFiles.length}/{packageInfo.photoCount})
                  </h3>
                  {selectedFiles.length !== packageInfo.photoCount && (
                    <span className={`text-sm font-medium ${
                      selectedFiles.length < packageInfo.photoCount 
                        ? 'text-orange-600' 
                        : 'text-red-600'
                    }`}>
                      {selectedFiles.length < packageInfo.photoCount 
                        ? `${packageInfo.photoCount - selectedFiles.length} more needed` 
                        : `${selectedFiles.length - packageInfo.photoCount} too many`}
                    </span>
                  )}
                </div>
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
              disabled={selectedFiles.length !== packageInfo.photoCount}
              size="lg"
              className={selectedFiles.length === packageInfo.photoCount ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}
            >
              Continue to Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={handleCropCancel}
        imageSrc={currentImageSrc}
        fileName={currentFileName}
        onCropComplete={handleCropComplete}
        currentIndex={currentFileIndex}
        totalImages={pendingFiles.length}
      />
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
