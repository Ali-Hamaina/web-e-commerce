import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gold-50 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-6 animate-fadeIn">
            يونا للعطور
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-8 animate-slideUp">
            اكتشف عالماً من العطور الفاخرة
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-reverse md:space-x-4 md:flex justify-center animate-slideUp">
            <a
              href="/products"
              className="inline-block bg-gradient-to-r from-primary-500 to-gold-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-primary-600 hover:to-gold-600 transition-all duration-300 hover-lift"
            >
              تسوق الآن
            </a>
            <a
              href="https://wa.me/212713071000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 transition-all duration-300 hover-lift"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              تواصل معنا
            </a>
          </div>
        </div>
        
        {/* Floating perfume bottles animation */}
        <div className="absolute top-20 left-20 floating-animation">
          <i className="fas fa-spray-can text-4xl text-primary-300 opacity-70"></i>
        </div>
        <div className="absolute bottom-20 right-20 floating-animation" style={{ animationDelay: '1s' }}>
          <i className="fas fa-wine-bottle text-4xl text-gold-300 opacity-70"></i>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              العطور المميزة
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اختيارنا الخاص من أفضل العطور العالمية والمحلية
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="/products"
              className="inline-block bg-gradient-to-r from-primary-500 to-gold-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-primary-600 hover:to-gold-600 transition-all duration-300 hover-lift"
            >
              عرض جميع العطور
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              لماذا تختارنا؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-certificate text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">جودة مضمونة</h3>
              <p className="text-gray-600">
                نقدم فقط العطور الأصلية من أفضل البراندات العالمية
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-shipping-fast text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">توصيل سريع</h3>
              <p className="text-gray-600">
                توصيل مجاني لجميع أنحاء المغرب في أقل من 48 ساعة
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-headset text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">دعم متميز</h3>
              <p className="text-gray-600">
                فريق دعم متخصص متاح 24/7 لمساعدتك في اختيار العطر المناسب
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
