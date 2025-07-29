import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-4">
              يونا للعطور
            </h3>
            <p className="text-gray-300 mb-4">
              نقدم لك أفضل العطور العالمية والمحلية بأسعار منافسة وجودة عالية
            </p>
            <div className="flex space-x-reverse space-x-4">
              <a
                href="https://www.instagram.com/yona.purfum/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-pink-500 hover:text-pink-400 transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://web.facebook.com/YunaPurfum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-blue-500 hover:text-blue-400 transition-colors"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="https://wa.me/212713071000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-green-500 hover:text-green-400 transition-colors"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors">
                  العطور
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  من نحن
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">معلومات التواصل</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-reverse space-x-3">
                <i className="fas fa-phone text-primary-500"></i>
                <span className="text-gray-300">+212 713071000</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <i className="fas fa-envelope text-primary-500"></i>
                <span className="text-gray-300">info@yunaparfum.com</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <i className="fas fa-map-marker-alt text-primary-500"></i>
                <span className="text-gray-300">المغرب</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 يونا للعطور. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
