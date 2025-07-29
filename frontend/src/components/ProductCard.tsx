import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product as ProductType } from '../types';
import { useCart } from '../context/CartContext';
import { uploadService } from '../services/uploadService';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ProductType;
  onProductClick?: (product: ProductType) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!product.inStock) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }
    
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    
    toast.success('تم إضافة المنتج إلى السلة');
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Navigate to product detail page
      navigate(`/products/${product._id}`);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover-lift cursor-pointer overflow-hidden group animate-fadeIn"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={uploadService.getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.jpg'; // fallback image
          }}
        />
        {product.featured && (
          <div className="absolute top-3 right-3 bg-gold-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            مميز
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">غير متوفر</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold gradient-text">
            {product.price} درهم
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
              product.inStock
                ? 'bg-gradient-to-r from-primary-500 to-gold-500 text-white hover:from-primary-600 hover:to-gold-600 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? (
              <>
                <i className="fas fa-cart-plus mr-2"></i>
                أضف للسلة
              </>
            ) : (
              'غير متوفر'
            )}
          </button>
        </div>

        {/* Category Badge */}
        <div className="mt-4 flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            product.category === 'men' 
              ? 'bg-blue-100 text-blue-800'
              : product.category === 'women'
              ? 'bg-pink-100 text-pink-800'
              : 'bg-purple-100 text-purple-800'
          }`}>
            {product.category === 'men' ? 'رجالي' : product.category === 'women' ? 'نسائي' : 'للجنسين'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
