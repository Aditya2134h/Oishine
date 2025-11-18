'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Heart, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients?: string;
  category: {
    name: string;
  };
  isAvailable: boolean;
  averageRating?: number;
  reviewCount?: number;
}

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export default function QuickView({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist
}: QuickViewProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isAvailable && (
              <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700">
                Tersedia
              </Badge>
            )}
            
            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isInWishlist(product.id)
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-400'
                }`}
              />
            </motion.button>
          </div>

          {/* Product Details */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex-1">
              {/* Category */}
              <Badge variant="secondary" className="mb-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {product.category.name}
              </Badge>

              {/* Product Name */}
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {product.name}
              </h2>

              {/* Rating */}
              {product.averageRating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(product.averageRating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Ingredients */}
              {product.ingredients && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Bahan-bahan:</h3>
                  <p className="text-sm text-muted-foreground">{product.ingredients}</p>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Jumlah:</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white h-12"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Tambah ke Keranjang - Rp {(product.price * quantity).toLocaleString('id-ID')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
