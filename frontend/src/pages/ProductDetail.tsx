import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { uploadService } from '../services/uploadService';
import apiClient from '../services/api';
import toast from 'react-hot-toast';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProductData = async (productId: string) => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/products/${productId}`);
        setProduct(response.data.product || response.data);
      } catch (error) {
        toast.error('فشل في جلب تفاصيل المنتج');
        console.error('Error fetching product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData(id);
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!product.inStock) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }
    
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image
    });
    
    toast.success(`تم إضافة ${quantity} من ${product.name} إلى السلة`);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط إلى الحافظة');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط إلى الحافظة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">المنتج غير موجود</h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            العودة إلى المنتجات
          </button>
        </div>
      </div>
    );
  }

  const productImages = [product.image]; // Can be extended for multiple images

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-purple-600"
          >
            الرئيسية
          </button>
          <span className="mx-2 text-gray-500">/</span>
          <button
            onClick={() => navigate('/products')}
            className="text-gray-500 hover:text-purple-600"
          >
            المنتجات
          </button>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          العودة
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-xl shadow-lg"
            >
              <img
                src={uploadService.getImageUrl(productImages[selectedImage])}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">غير متوفر</span>
                </div>
              )}
            </motion.div>

            {/* Additional Images Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={uploadService.getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 capitalize px-3 py-1 bg-gray-100 rounded-full">
                      {product.category === 'men' ? 'رجالي' : 
                       product.category === 'women' ? 'نسائي' : 'مشترك'}
                    </span>
                    {product.featured && (
                      <span className="text-sm text-purple-600 px-3 py-1 bg-purple-100 rounded-full">
                        منتج مميز
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ShareIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold gradient-text">{product.price} ريال</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.inStock ? (
                  <>
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">متوفر في المخزون</span>
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">غير متوفر حالياً</span>
                  </>
                )}
              </div>

              {/* Rating (Static for now) */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolidIcon key={star} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">(4.8 من 5 نجوم)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">الوصف</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">الكمية</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  product.inStock
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {product.inStock ? `أضف ${quantity} إلى السلة` : 'غير متوفر'}
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full py-4 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                تصفح منتجات أخرى
              </button>
            </div>

            {/* Product Features */}
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
