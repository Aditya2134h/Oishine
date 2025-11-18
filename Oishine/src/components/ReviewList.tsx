'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, Calendar, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images: string | null;
  createdAt: string;
  helpful: number;
  user: {
    name: string | null;
    email: string;
  } | null;
  product: {
    name: string;
    image: string;
  };
}

interface ReviewListProps {
  productId?: string;
  orderId?: string;
  limit?: number;
}

export default function ReviewList({ productId, orderId, limit }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId, orderId]);

  const loadReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (orderId) params.append('orderId', orderId);

      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();

      if (data.success) {
        const reviewsData = limit ? data.data.slice(0, limit) : data.data;
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGallery = (images: string[], startIndex: number = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(startIndex);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < selectedImages.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : selectedImages.length - 1
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Belum ada review</p>
        <p className="text-sm text-gray-400 mt-1">
          Jadilah yang pertama memberikan review!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => {
          const reviewImages = review.images ? JSON.parse(review.images) : [];
          
          return (
            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user?.name?.[0]?.toUpperCase() || 'G'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.user?.name || 'Guest User'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Images Gallery */}
                  {reviewImages.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {reviewImages.map((imageUrl: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => openGallery(reviewImages, index)}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border hover:border-red-500 transition-colors group"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Review image ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Info (if showing mixed reviews) */}
                  {!productId && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-3 pt-3 border-t">
                      <div className="relative w-8 h-8 rounded overflow-hidden">
                        <Image
                          src={review.product.image}
                          alt={review.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{review.product.name}</span>
                    </div>
                  )}

                  {/* Helpful Button */}
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors mt-3">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Membantu ({review.helpful})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeGallery}
        >
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl"
          >
            ×
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 text-white hover:text-gray-300 text-4xl"
          >
            ‹
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 text-white hover:text-gray-300 text-4xl"
          >
            ›
          </button>

          <div className="relative w-full h-full max-w-4xl max-h-[80vh] p-4">
            <Image
              src={selectedImages[currentImageIndex]}
              alt={`Review image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {currentImageIndex + 1} / {selectedImages.length}
          </div>
        </div>
      )}
    </>
  );
}
