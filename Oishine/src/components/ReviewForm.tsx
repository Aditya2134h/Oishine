'use client';

import { useState } from 'react';
import { Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ReviewFormProps {
  productId: string;
  productName: string;
  orderId?: string;
  userId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({
  productId,
  productName,
  orderId,
  userId,
  onSuccess
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total images
    if (images.length + files.length > 5) {
      toast({
        title: '❌ Terlalu Banyak Gambar',
        description: 'Maksimal 5 foto per review',
        variant: 'destructive',
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: '❌ File Tidak Valid',
          description: `${file.name} bukan file gambar`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '❌ File Terlalu Besar',
          description: `${file.name} melebihi batas 5MB`,
          variant: 'destructive',
        });
        return;
      }
    }

    // Add files
    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: '❌ Rating Diperlukan',
        description: 'Silakan berikan rating bintang',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      let uploadedImageUrls: string[] = [];

      // Upload images if any
      if (images.length > 0) {
        setUploading(true);
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Upload gambar gagal');
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrls = uploadData.urls;
        setUploading(false);
      }

      // Submit review
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          orderId,
          userId,
          rating,
          comment,
          images: uploadedImageUrls,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Gagal mengirim review');
      }

      toast({
        title: '✅ Review Berhasil Dikirim!',
        description: 'Terima kasih atas review Anda',
      });

      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
      setImagePreviews([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: '❌ Gagal Mengirim Review',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 shadow-sm border">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Tulis Review untuk {productName}
        </h3>

        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating === 1 && 'Sangat Buruk'}
              {rating === 2 && 'Buruk'}
              {rating === 3 && 'Cukup'}
              {rating === 4 && 'Baik'}
              {rating === 5 && 'Sangat Baik'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Komentar (Opsional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalaman Anda dengan produk ini..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload Foto (Opsional, Max 5)
          </label>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {images.length < 5 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-red-500 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Pilih Foto ({images.length}/5)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Format: JPG, PNG, GIF. Maksimal 5MB per file.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={submitting || uploading || rating === 0}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
      >
        {uploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Mengupload Foto...
          </>
        ) : submitting ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Mengirim Review...
          </>
        ) : (
          'Kirim Review'
        )}
      </Button>
    </form>
  );
}
