'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, User, Heart, LogOut, ChevronRight, Trash2, ShoppingBag, ExternalLink } from 'lucide-react';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import { ordersApi, wishlistApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { toggle, isWishlisted, clear: clearWishlist, syncFromDB } = useWishlistStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (!user) { router.push('/account/login'); return; }
    ordersApi.getAll()
      .then(r => setOrders(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [user]);

  // Load full wishlist products when switching to wishlist tab
  useEffect(() => {
    if (tab !== 'wishlist' || !user) return;
    setLoadingWishlist(true);
    wishlistApi.get()
      .then(r => setWishlistProducts(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingWishlist(false));
  }, [tab, user]);

  const handleLogout = () => {
    logout();
    clearWishlist();
    router.push('/');
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    await toggle(productId);
    setWishlistProducts(prev => prev.filter(p => p.id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleClearWishlist = async () => {
    try {
      await wishlistApi.clear();
      clearWishlist();
      setWishlistProducts([]);
      toast.success('Wishlist cleared');
    } catch {
      toast.error('Failed to clear wishlist');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center mb-4">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                : <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-yellow-700">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
              }
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              {user.auth_provider === 'google' && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-2 inline-block">Google Account</span>
              )}
            </div>

            <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {[
                { id: 'orders', icon: Package, label: 'My Orders' },
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'wishlist', icon: Heart, label: 'Wishlist' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b last:border-0 transition-colors ${tab === item.id ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <item.icon size={16} />
                  {item.label}
                  <ChevronRight size={14} className="ml-auto" />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">

            {/* ── Orders ─────────────────────────────────── */}
            {tab === 'orders' && (
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal mb-6">My Orders</h2>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">No orders yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
                    <button onClick={() => router.push('/shop')} className="btn-gold px-6 py-3 rounded-xl font-medium">
                      Shop Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-yellow-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{order.order_number}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${statusColors[order.status] || ''}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">{order.item_count} item{order.item_count > 1 ? 's' : ''}</p>
                            <p className="font-bold text-yellow-700 text-lg">₹{parseFloat(order.total).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => router.push(`/account/orders/${order.id}`)}
                            className="text-sm text-yellow-700 font-medium hover:underline flex items-center gap-1"
                          >
                            View Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Profile ────────────────────────────────── */}
            {tab === 'profile' && (
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal mb-6">My Profile</h2>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', value: user.name },
                      { label: 'Email', value: user.email },
                      { label: 'Phone', value: user.phone || 'Not set' },
                      { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-gray-900 font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Wishlist ────────────────────────────────── */}
            {tab === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-charcoal">
                    My Wishlist
                    {wishlistProducts.length > 0 && (
                      <span className="ml-2 text-base font-normal text-gray-400">({wishlistProducts.length} items)</span>
                    )}
                  </h2>
                  {wishlistProducts.length > 0 && (
                    <button
                      onClick={handleClearWishlist}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Clear All
                    </button>
                  )}
                </div>

                {loadingWishlist ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-400 text-sm mb-6">Save your favourite pieces here</p>
                    <button onClick={() => router.push('/shop')} className="btn-gold px-6 py-3 rounded-xl font-medium">
                      Browse Jewelry
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((product: any) => {
                      const price = parseFloat(product.sale_price || product.base_price);
                      const discount = product.sale_price
                        ? Math.round((1 - product.sale_price / product.base_price) * 100) : 0;
                      return (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-yellow-200 transition-colors group">
                          <div className="flex gap-4 p-4">
                            {/* Image */}
                            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                              {product.primary_image
                                ? <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={24} /></div>
                              }
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                              {product.material && <p className="text-xs text-gray-400 mt-0.5">{product.material}</p>}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-bold text-yellow-700">₹{price.toLocaleString()}</span>
                                {discount > 0 && (
                                  <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                    {discount}% OFF
                                  </span>
                                )}
                              </div>
                              {product.stock === 0 && (
                                <span className="text-xs text-red-500 font-medium mt-1 block">Out of stock</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex border-t border-gray-50">
                            <a
                              href={`/product/${product.slug}`}
                              className="flex-1 py-3 text-xs font-semibold text-yellow-700 hover:bg-yellow-50 flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <ExternalLink size={13} /> View Product
                            </a>
                            <div className="w-px bg-gray-100" />
                            <button
                              onClick={() => handleRemoveFromWishlist(product.id)}
                              className="flex-1 py-3 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
