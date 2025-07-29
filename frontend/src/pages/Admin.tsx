import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import AdminLoginModal from '../components/AdminLoginModal';
import ImageUpload from '../components/ImageUpload';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  EnvelopeIcon,
  EyeIcon,
  CheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import { uploadService } from '../services/uploadService';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  featured: boolean;
}

interface Order {
  _id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  notes: string;
  paymentMethod: string;
  orderType: string;
  createdAt: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  adminReply?: string;
  createdAt: string;
  repliedAt?: string;
}

const Admin: React.FC = () => {
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'contacts'>('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalContacts: 0,
    unreadContacts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    todayOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    completedOrders: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'unisex',
    stock: '',
    featured: false
  });

  useEffect(() => {
    if (!isAdmin) {
      setShowLoginModal(true);
    } else {
      fetchProducts();
      fetchOrders();
      fetchContacts();
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, contactsRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/orders'),
        apiClient.get('/contact')
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];
      const contacts = contactsRes.data.contacts || [];

      // Calculate product statistics
      const inStockProducts = products.filter((p: Product) => p.inStock).length;
      const outOfStockProducts = products.filter((p: Product) => !p.inStock).length;

      // Calculate order statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = orders.filter((o: Order) => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      }).length;

      const pendingOrders = orders.filter((o: Order) => o.status === 'pending' || o.status === 'processing').length;
      const completedOrders = orders.filter((o: Order) => o.status === 'completed' || o.status === 'delivered').length;
      const totalRevenue = orders
        .filter((o: Order) => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalContacts: contacts.length,
        unreadContacts: contacts.filter((c: Contact) => c.status === 'unread').length,
        inStockProducts,
        outOfStockProducts,
        todayOrders,
        pendingOrders,
        totalRevenue,
        completedOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Admin: Fetching products from API...');
      const response = await apiClient.get('/products');
      console.log('Admin API Response:', response.data);
      console.log('Admin Products array:', response.data.products);
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('فشل في جلب المنتجات');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('فشل في تحميل الطلبات');
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await apiClient.get('/contact');
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('فشل في تحميل الرسائل');
    }
  };

  // Order management functions
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
      toast.success('تم تحديث حالة الطلب بنجاح');
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error('فشل في تحديث حالة الطلب');
      console.error('Error updating order status:', error);
    }
  };

  // Contact management functions
  const markContactAsRead = async (contactId: string) => {
    try {
      await apiClient.patch(`/contact/${contactId}/status`, { status: 'read' });
      toast.success('تم وضع علامة على الرسالة كمقروءة');
      fetchContacts();
      fetchStats();
    } catch (error) {
      toast.error('فشل في تحديث حالة الرسالة');
      console.error('Error marking contact as read:', error);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      try {
        await apiClient.delete(`/contact/${contactId}`);
        toast.success('تم حذف الرسالة بنجاح');
        fetchContacts();
        fetchStats();
      } catch (error) {
        toast.error('فشل في حذف الرسالة');
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    fetchProducts();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('تم تسجيل الخروج');
  };

  const testConnection = async () => {
    try {
      const healthResponse = await apiClient.get('/health');
      console.log('Health check:', healthResponse.data);
      
      const productsResponse = await apiClient.get('/products');
      console.log('Products check:', productsResponse.data);
      
      toast.success(`اتصال نجح! المنتجات: ${productsResponse.data.products?.length || 0}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('فشل في الاتصال بالخادم');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'unisex',
      stock: '',
      featured: false
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category || 'unisex',
        inStock: parseInt(formData.stock) > 0,
        featured: formData.featured
      };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, productData);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await apiClient.post('/products', productData);
        toast.success('تم إضافة المنتج بنجاح');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('فشل في حفظ المنتج');
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.inStock ? '1' : '0',
      featured: product.featured
    });
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    try {
      await apiClient.delete(`/products/${productId}`);
      toast.success('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      toast.error('فشل في حذف المنتج');
      console.error('Error deleting product:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AdminLoginModal 
          isOpen={showLoginModal} 
          onClose={() => navigate('/')}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold gradient-text">لوحة التحكم</h1>
          <div className="flex gap-2">
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                اختبار الاتصال
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-blue-800">{stats.totalProducts}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-green-600">✅ متوفر: {stats.inStockProducts}</span>
                  <span className="text-xs text-red-600">❌ نفذ: {stats.outOfStockProducts}</span>
                </div>
              </div>
              <ShoppingBagIcon className="w-12 h-12 text-blue-500" />
            </div>
          </motion.div>

          {/* Orders Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-green-800">{stats.totalOrders}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-orange-600">⏳ معلقة: {stats.pendingOrders}</span>
                  <span className="text-xs text-green-600">✅ مكتملة: {stats.completedOrders}</span>
                </div>
              </div>
              <ChartBarIcon className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>

          {/* Daily Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">طلبات اليوم</p>
                <p className="text-3xl font-bold text-purple-800">{stats.todayOrders}</p>
                <div className="mt-2">
                  <span className="text-xs text-purple-600">📅 {new Date().toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <CalendarDaysIcon className="w-12 h-12 text-purple-500" />
            </div>
          </motion.div>

          {/* Revenue Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.totalRevenue.toFixed(2)} درهم</p>
                <div className="mt-2">
                  <span className="text-xs text-yellow-600">💰 من الطلبات المكتملة</span>
                </div>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-yellow-500" />
            </div>
          </motion.div>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contact Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-lg p-6 border-l-4 border-pink-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 mb-1">الرسائل</p>
                <p className="text-2xl font-bold text-pink-800">{stats.totalContacts}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-red-600">🔴 غير مقروءة: {stats.unreadContacts}</span>
                  <span className="text-xs text-green-600">✅ مقروءة: {stats.totalContacts - stats.unreadContacts}</span>
                </div>
              </div>
              <EnvelopeIcon className="w-12 h-12 text-pink-500" />
            </div>
          </motion.div>

          {/* Admin Help - Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <TruckIcon className="w-8 h-8 text-indigo-600 mr-2" />
                <h3 className="text-lg font-bold text-indigo-800">إجراءات سريعة</h3>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="w-full text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors"
                >
                  إدارة المنتجات
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  مراجعة الطلبات
                </button>
                <button 
                  onClick={() => setActiveTab('contacts')}
                  className="w-full text-xs bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700 transition-colors"
                >
                  الرد على الرسائل
                </button>
              </div>
            </div>
          </motion.div>

          {/* Admin Status Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border-l-4 border-emerald-500"
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <CheckCircleIcon className="w-8 h-8 text-emerald-600 mr-2" />
                <h3 className="text-lg font-bold text-emerald-800">حالة النظام</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700">المنتجات:</span>
                  <span className={`font-bold ${stats.outOfStockProducts > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {stats.outOfStockProducts > 0 ? 'يحتاج انتباه' : 'جيد'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700">الطلبات:</span>
                  <span className={`font-bold ${stats.pendingOrders > 5 ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {stats.pendingOrders > 5 ? 'كثيرة' : 'عادية'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700">الرسائل:</span>
                  <span className={`font-bold ${stats.unreadContacts > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {stats.unreadContacts > 0 ? 'تحتاج رد' : 'محدثة'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <ShoppingBagIcon className="w-5 h-5 inline-block ml-2" />
              المنتجات
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline-block ml-2" />
              الطلبات
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'contacts'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <EnvelopeIcon className="w-5 h-5 inline-block ml-2" />
              الرسائل
              {stats.unreadContacts > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {stats.unreadContacts}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                إضافة منتج جديد
              </button>
            </div>

          {/* Add/Edit Product Form */}
          {showAddProduct && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفئة
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="men">رجالي</option>
                    <option value="women">نسائي</option>
                    <option value="unisex">مشترك</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة المخزون
                  </label>
                  <select
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1">متوفر</option>
                    <option value="0">غير متوفر</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة المنتج
                  </label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">منتج مميز</span>
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingProduct ? 'تحديث' : 'إضافة'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Products List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد منتجات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">الصورة</th>
                    <th className="px-6 py-3">الاسم</th>
                    <th className="px-6 py-3">الفئة</th>
                    <th className="px-6 py-3">السعر</th>
                    <th className="px-6 py-3">حالة المخزون</th>
                    <th className="px-6 py-3">مميز</th>
                    <th className="px-6 py-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {product.image ? (
                          <img
                            src={uploadService.getImageUrl(product.image)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <PhotoIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.category || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.price} ريال
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.inStock ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            متوفر
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            غير متوفر
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.featured ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            مميز
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            عادي
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        )}

        {/* Orders Management Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border-2 border-purple-200">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center flex items-center gap-3">
                  <ChartBarIcon className="w-8 h-8" />
                  إدارة الطلبات
                  <ShoppingBagIcon className="w-8 h-8" />
                </h2>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد طلبات حتى الآن</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">العميل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">المبلغ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">طريقة الدفع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الحالة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">التاريخ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-800">{order.customerInfo.name}</p>
                            <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
                            <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{order.totalAmount} درهم</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.paymentMethod === 'cash' ? 'عند الاستلام' : 'تحويل بنكي'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'pending' ? 'معلق' :
                             order.status === 'confirmed' ? 'مؤكد' :
                             order.status === 'shipped' ? 'تم الشحن' :
                             order.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="تأكيد الطلب"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="تم التسليم"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contacts Management Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة الرسائل</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">جاري تحميل الرسائل...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <EnvelopeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد رسائل حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact._id} className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                    contact.status === 'unread' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{contact.name}</h3>
                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                              {contact.email && (
                                <span className="flex items-center gap-2">
                                  <EnvelopeIcon className="w-4 h-4" />
                                  {contact.email}
                                </span>
                              )}
                              {contact.phone && (
                                <span className="flex items-center gap-2">
                                  <PhoneIcon className="w-4 h-4" />
                                  {contact.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          contact.status === 'unread' ? 'bg-red-100 text-red-800 animate-pulse' :
                          contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.status === 'unread' ? '🔴 غير مقروءة' :
                           contact.status === 'replied' ? '✅ تم الرد' : '👁️ مقروءة'}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(contact.createdAt).toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-2">
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-700">
                            الموضوع: {contact.subject || 'غير محدد'}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{contact.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {contact.status === 'unread' && (
                        <button
                          onClick={() => markContactAsRead(contact._id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                        >
                          <EyeIcon className="w-4 h-4" />
                          وضع علامة كمقروءة
                        </button>
                      )}
                      <button
                        onClick={() => deleteContact(contact._id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                      >
                        <TrashIcon className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
