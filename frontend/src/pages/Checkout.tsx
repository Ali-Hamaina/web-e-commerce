import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { uploadService } from '../services/uploadService';
import { whatsappService } from '../services/whatsappService';
import { CustomerInfo } from '../types';
import apiClient from '../services/api';
import toast from 'react-hot-toast';
import { 
  ShoppingBagIcon, 
  ArrowRightIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { FaWhatsapp } from 'react-icons/fa';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart, getCartTotal } = useCart();
  const cart = state.items;
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutMethod, setCheckoutMethod] = useState<'form' | 'whatsapp'>('form');

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">سلة التسوق فارغة</h2>
          <p className="text-gray-600 mb-8">لا يمكن إتمام الطلب بدون منتجات في السلة</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <ArrowRightIcon className="w-5 h-5" />
            تصفح المنتجات
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.15;
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      toast.error('يرجى إدخال الاسم الكامل');
      return false;
    }
    if (customerInfo.name.trim().length < 2 || customerInfo.name.trim().length > 50) {
      toast.error('الاسم يجب أن يكون بين 2 و 50 حرف');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return false;
    }
    if (!customerInfo.address.trim()) {
      toast.error('يرجى إدخال العنوان');
      return false;
    }
    if (customerInfo.address.trim().length < 10 || customerInfo.address.trim().length > 200) {
      toast.error('العنوان يجب أن يكون بين 10 و 200 حرف');
      return false;
    }
    
    // Phone validation (Morocco format) - make it more flexible
    const cleanPhone = customerInfo.phone.replace(/\s/g, '');
    const phoneRegex = /^(\+212|212|0)?[5-7]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast.error('يرجى إدخال رقم هاتف صحيح (06xxxxxxxx أو 07xxxxxxxx)');
      return false;
    }
    
    // Email validation if provided
    if (customerInfo.email && customerInfo.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerInfo.email.trim())) {
        toast.error('يرجى إدخال عنوان بريد إلكتروني صحيح');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Format phone number for backend (ensure international format)
      const formatPhoneForBackend = (phone: string) => {
        const cleanPhone = phone.replace(/\s/g, '');
        if (cleanPhone.startsWith('+212')) {
          return cleanPhone;
        } else if (cleanPhone.startsWith('212')) {
          return '+' + cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
          return '+212' + cleanPhone.substring(1);
        }
        return '+212' + cleanPhone;
      };

      const orderData = {
        customerInfo: {
          name: customerInfo.name.trim(),
          phone: formatPhoneForBackend(customerInfo.phone),
          email: customerInfo.email?.trim() || undefined, // Send undefined if empty
          address: customerInfo.address.trim()
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
          // Note: Don't send name and price - backend will get them from DB
        })),
        totalAmount: total,
        notes: orderNotes || '',
        paymentMethod,
        orderType: 'form'
      };
      
      console.log('Sending order data:', orderData); // Debug log
      
      const response = await apiClient.post('/orders', orderData);
      
      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً');
      clearCart();
      
      // Navigate to success page or home
      navigate('/', { 
        state: { 
          orderSuccess: true, 
          orderId: response.data.order?._id || response.data.orderId 
        }
      });
      
    } catch (error: any) {
      console.error('Error submitting order:', error);
      
      // Show specific validation errors if available
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join('\n');
        toast.error('خطأ في البيانات:\n' + errorMessages);
      } else {
        toast.error(error.response?.data?.message || 'حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    // For WhatsApp, we only need the cart items - no customer validation required
    if (cart.length === 0) {
      toast.error('سلة التسوق فارغة');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare order data with only product information
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        customerInfo: {
          name: customerInfo.name || '', // Optional for WhatsApp
          phone: customerInfo.phone || '', // Optional for WhatsApp
          address: customerInfo.address || '',
          notes: orderNotes || ''
        }
      };

      const response = await whatsappService.generateOrderMessage(orderData);
      const { whatsappData } = response;

      // Try to open WhatsApp with the order details message
      const opened = whatsappService.openWhatsApp(whatsappData.phoneNumber, whatsappData.message);
      
      if (opened) {
        toast.success('تم فتح واتساب مع تفاصيل طلبك! يرجى إرسال الرسالة', {
          duration: 4000,
        });
        
        // Clear cart and navigate after successful WhatsApp opening
        setTimeout(() => {
          clearCart();
          navigate('/', { 
            state: { 
              orderSuccess: true, 
              method: 'whatsapp',
              totalAmount: whatsappData.totalAmount,
              itemCount: whatsappData.itemCount
            }
          });
        }, 2000);
        
      } else {
        // Fallback: copy to clipboard
        const copied = await whatsappService.copyToClipboard(whatsappData.message);
        if (copied) {
          toast.success('تم نسخ رسالة الطلب! أرسلها عبر واتساب إلى: +212713071000', {
            duration: 5000,
          });
        } else {
          toast.error('حدث خطأ في فتح واتساب. يرجى المحاولة مرة أخرى');
        }
      }
      
    } catch (error: any) {
      console.error('Error processing WhatsApp order:', error);
      toast.error(error.message || 'حدث خطأ في إعداد رسالة واتساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">إتمام الطلب</h1>
          <p className="text-lg text-gray-600">
            أدخل بياناتك لإتمام عملية الشراء
          </p>
        </div>

        {/* Checkout Method Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">اختر طريقة إتمام الطلب</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Form Method */}
            <button
              onClick={() => setCheckoutMethod('form')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                checkoutMethod === 'form'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <ChatBubbleLeftRightIcon className={`w-12 h-12 mx-auto mb-4 ${
                  checkoutMethod === 'form' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">نموذج الطلب</h3>
                <p className="text-sm text-gray-600">
                  أكمل بياناتك وأرسل الطلب عبر النموذج
                </p>
              </div>
            </button>

            {/* WhatsApp Method */}
            <button
              onClick={() => setCheckoutMethod('whatsapp')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                checkoutMethod === 'whatsapp'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <FaWhatsapp className={`w-12 h-12 mx-auto mb-4 ${
                  checkoutMethod === 'whatsapp' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">واتساب</h3>
                <p className="text-sm text-gray-600">
                  أرسل طلبك مباشرة عبر واتساب للرد السريع
                </p>
              </div>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="lg:col-span-2 space-y-6">
            {checkoutMethod === 'form' ? (
              <>
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">معلومات التواصل</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="06xxxxxxxx أو 07xxxxxxxx"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني (اختياري)
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">عنوان التسليم</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان الكامل *
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="المدينة، الحي، اسم الشارع، رقم المبنى، تفاصيل إضافية..."
                      required
                    />
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">طريقة الدفع</h2>
                  
                  <div className="space-y-4">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'cash' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={() => setPaymentMethod('cash')}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-3">
                          <TruckIcon className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-semibold">الدفع عند الاستلام</p>
                            <p className="text-sm text-gray-600">ادفع نقداً عند وصول المنتج</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'card' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-3">
                          <CreditCardIcon className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-semibold">التحويل البنكي</p>
                            <p className="text-sm text-gray-600">سنرسل تفاصيل التحويل عبر واتساب</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Order Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">ملاحظات على الطلب</h2>
                  
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أضف أي ملاحظات خاصة بطلبك (اختياري)..."
                  />
                </motion.div>
              </>
            ) : (
              /* WhatsApp Checkout */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="text-center">
                  <FaWhatsapp className="w-20 h-20 text-green-600 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">طلب سريع عبر واتساب</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    اضغط على الزر لإرسال تفاصيل طلبك مباشرة عبر واتساب
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    ما سيحدث:
                  </h3>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-start gap-2">
                      <span className="block w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      سيتم فتح واتساب تلقائياً مع رسالة تحتوي على تفاصيل طلبك
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="block w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      الرسالة ستتضمن أسماء المنتجات والكميات والإجمالي
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="block w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      يمكنك إضافة معلوماتك الشخصية قبل الإرسال
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="block w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      سنرد عليك فوراً لتأكيد الطلب والتوصيل
                    </li>
                  </ul>
                </div>

                {/* Optional customer info for WhatsApp */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات إضافية (اختيارية)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="الاسم (اختياري)"
                    />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="رقم الهاتف (اختياري)"
                    />
                  </div>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full mt-4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ملاحظات إضافية على الطلب (اختياري)..."
                  />
                </div>

                {/* WhatsApp Submit Button */}
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      جاري التحضير...
                    </>
                  ) : (
                    <>
                      <FaWhatsapp className="w-6 h-6" />
                      إرسال الطلب عبر واتساب
                    </>
                  )}
                </button>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>رقم واتساب المتجر: <span className="font-semibold text-green-600">+212 713 071 000</span></p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">ملخص الطلب</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={uploadService.getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                      <p className="text-purple-600 font-bold">
                        {(item.price * item.quantity).toFixed(2)} درهم
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} درهم</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">الضريبة (15%):</span>
                  <span className="font-semibold">{tax.toFixed(2)} درهم</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">الشحن:</span>
                  <span className="font-semibold text-green-600">مجاني</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between text-lg">
                  <span className="font-bold">المجموع الكلي:</span>
                  <span className="font-bold gradient-text">{total.toFixed(2)} درهم</span>
                </div>
              </div>

              {/* Submit Order Button - Only show for form method */}
              {checkoutMethod === 'form' && (
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري إرسال الطلب...
                    </div>
                  ) : (
                    'تأكيد الطلب'
                  )}
                </button>
              )}

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                  <span>معلوماتك محمية وآمنة</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>ضمان الجودة أو استرداد المبلغ</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TruckIcon className="w-4 h-4 text-green-600" />
                  <span>توصيل مجاني لجميع أنحاء المملكة</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
