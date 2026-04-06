'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, User, Heart, LogOut, ChevronRight, Trash2, ShoppingBag, ExternalLink, Save, X } from 'lucide-react';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import { ordersApi, wishlistApi, authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const statusStyle: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#FFF8F5', color: '#B68868' },
  confirmed:  { bg: '#FAF9EE', color: '#642308' },
  processing: { bg: '#FAF9EE', color: '#903E1D' },
  shipped:    { bg: '#FAF9EE', color: '#642308' },
  delivered:  { bg: '#FAF9EE', color: '#642308' },
  cancelled:  { bg: '#FFF0EE', color: '#b91c1c' },
  refunded:   { bg: '#EBEBCA', color: '#903E1D' },
};

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { toggle, clear: clearWishlist } = useWishlistStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [tab, setTab] = useState('orders');
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/account/login'); return; }
    ordersApi.getAll()
      .then(r => setOrders(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [user]);

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

  const startEditProfile = () => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
    setProfileEdit(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      useAuthStore.getState().setUser(res.data.data);
      setProfileEdit(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
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

  const navItems = [
    { id: 'orders', icon: Package, label: 'My Orders' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
  ];

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF9EE' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* User card */}
            <div className="p-5 text-center mb-3" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-16 h-16 object-cover mx-auto mb-3" style={{ outline: '2px solid #EBEBCA' }} />
                : (
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: '#EBEBCA' }}>
                    <span className="text-2xl font-bold" style={{ color: '#642308' }}>{user.name?.[0]?.toUpperCase()}</span>
                  </div>
                )
              }
              <h3 className="font-semibold text-sm" style={{ color: '#642308' }}>{user.name}</h3>
              <p className="text-[11px] mt-1" style={{ color: '#B68868' }}>{user.email}</p>
              {user.auth_provider === 'google' && (
                <span className="text-[10px] tracking-[0.15em] uppercase font-medium px-2 py-0.5 mt-2 inline-block"
                  style={{ backgroundColor: '#EBEBCA', color: '#903E1D' }}>
                  Google Account
                </span>
              )}
            </div>

            {/* Nav */}
            <nav style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: tab === item.id ? '#EBEBCA' : 'transparent',
                    color: tab === item.id ? '#642308' : '#903E1D',
                    borderBottom: idx < navItems.length - 1 ? '1px solid #EBEBCA' : '1px solid #EBEBCA',
                    letterSpacing: '0.05em',
                  }}
                >
                  <item.icon size={14} />
                  {item.label}
                  <ChevronRight size={12} className="ml-auto" style={{ opacity: 0.5 }} />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-medium transition-colors"
                style={{ color: '#b91c1c', borderTop: '1px solid #EBEBCA' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFF0EE')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={14} />
                <span className="tracking-[0.05em]">Logout</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">

            {/* ── Orders ─────────────────────────────── */}
            {tab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
                  My Orders
                </h2>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 animate-pulse" style={{ backgroundColor: '#EBEBCA' }} />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                    <Package size={40} className="mx-auto mb-4" style={{ color: '#EBEBCA' }} />
                    <h3 className="font-semibold mb-2 text-sm" style={{ color: '#642308' }}>No orders yet</h3>
                    <p className="text-xs mb-6" style={{ color: '#B68868' }}>Start shopping to see your orders here</p>
                    <button
                      onClick={() => router.push('/shop')}
                      className="px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
                      style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}
                    >
                      Shop Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order: any) => {
                      const st = statusStyle[order.status] || statusStyle.pending;
                      return (
                        <div key={order.id} className="p-5 transition-colors"
                          style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-sm font-mono" style={{ color: '#642308' }}>{order.order_number}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: '#B68868' }}>
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 font-bold uppercase tracking-[0.1em] capitalize"
                              style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.bg}` }}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs" style={{ color: '#903E1D' }}>{order.item_count} item{order.item_count > 1 ? 's' : ''}</p>
                              <p className="font-bold text-base mt-0.5" style={{ color: '#642308' }}>₹{parseFloat(order.total).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => router.push(`/account/orders/${order.id}`)}
                              className="text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-1 transition-colors"
                              style={{ color: '#903E1D' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#903E1D')}
                            >
                              View Details <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Profile ──────────────────────────────── */}
            {tab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
                    My Profile
                  </h2>
                  {!profileEdit && (
                    <button
                      onClick={startEditProfile}
                      className="text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 transition-colors"
                      style={{ border: '1px solid #EBEBCA', color: '#642308' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#B68868')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                <div className="p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                  {profileEdit ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#B68868' }}>Full Name *</label>
                        <input
                          value={profileForm.name}
                          onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-3 text-sm outline-none transition-colors"
                          style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: '#FAF9EE' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                          onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#B68868' }}>Phone</label>
                        <input
                          value={profileForm.phone}
                          onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-4 py-3 text-sm outline-none transition-colors"
                          style={{ border: '1px solid #EBEBCA', color: '#642308', backgroundColor: '#FAF9EE' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                          onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div style={{ borderTop: '1px solid #EBEBCA', paddingTop: '1rem' }}>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#B68868' }}>Email</p>
                        <p className="text-sm" style={{ color: '#B68868' }}>{user.email} <span className="text-[10px]">(cannot be changed)</span></p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                          onMouseEnter={e => { if (!savingProfile) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}
                        >
                          {savingProfile ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save size={11} />}
                          Save Changes
                        </button>
                        <button
                          onClick={() => setProfileEdit(false)}
                          className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors"
                          style={{ border: '1px solid #EBEBCA', color: '#903E1D' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#B68868')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
                        >
                          <X size={11} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {[
                        { label: 'Full Name', value: user.name },
                        { label: 'Email', value: user.email },
                        { label: 'Phone', value: user.phone || 'Not set' },
                        { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ borderBottom: '1px solid #EBEBCA', paddingBottom: '1rem' }}>
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: '#B68868' }}>{label}</p>
                          <p className="text-sm font-medium" style={{ color: '#642308' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Wishlist ─────────────────────────────── */}
            {tab === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#642308' }}>
                    My Wishlist
                    {wishlistProducts.length > 0 && (
                      <span className="ml-2 text-sm font-normal" style={{ color: '#B68868' }}>({wishlistProducts.length})</span>
                    )}
                  </h2>
                  {wishlistProducts.length > 0 && (
                    <button
                      onClick={handleClearWishlist}
                      className="text-[10px] font-bold tracking-[0.15em] uppercase flex items-center gap-1.5 px-3 py-1.5 transition-colors"
                      style={{ color: '#b91c1c', border: '1px solid #f5c6c6' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFF0EE')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 size={11} /> Clear All
                    </button>
                  )}
                </div>

                {loadingWishlist ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 animate-pulse" style={{ backgroundColor: '#EBEBCA' }} />
                    ))}
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="p-12 text-center" style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                    <Heart size={40} className="mx-auto mb-4" style={{ color: '#EBEBCA' }} />
                    <h3 className="font-semibold text-sm mb-2" style={{ color: '#642308' }}>Your wishlist is empty</h3>
                    <p className="text-xs mb-6" style={{ color: '#B68868' }}>Save your favourite pieces here</p>
                    <button
                      onClick={() => router.push('/shop')}
                      className="px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
                      style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}
                    >
                      Browse Torans
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {wishlistProducts.map((product: any) => {
                      const price = parseFloat(product.sale_price || product.base_price);
                      const discount = product.sale_price
                        ? Math.round((1 - product.sale_price / product.base_price) * 100) : 0;
                      return (
                        <div key={product.id} style={{ border: '1px solid #EBEBCA', backgroundColor: '#ffffff' }}>
                          <div className="flex gap-4 p-4">
                            <div className="w-24 h-24 flex-shrink-0 overflow-hidden" style={{ backgroundColor: '#EBEBCA' }}>
                              {product.primary_image
                                ? <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center" style={{ color: '#B68868' }}><ShoppingBag size={24} /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: '#642308' }}>{product.name}</p>
                              {product.material && (
                                <p className="text-[11px] mt-0.5" style={{ color: '#B68868' }}>{product.material}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-bold text-sm" style={{ color: '#642308' }}>₹{price.toLocaleString()}</span>
                                {discount > 0 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5"
                                    style={{ backgroundColor: '#EBEBCA', color: '#642308' }}>
                                    {discount}% OFF
                                  </span>
                                )}
                              </div>
                              {product.stock === 0 && (
                                <span className="text-[10px] font-bold mt-1 block" style={{ color: '#b91c1c' }}>Out of stock</span>
                              )}
                            </div>
                          </div>
                          <div className="flex" style={{ borderTop: '1px solid #EBEBCA' }}>
                            <a
                              href={`/product/${product.slug}`}
                              className="flex-1 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-1.5 transition-colors"
                              style={{ color: '#642308' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAF9EE')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <ExternalLink size={11} /> View
                            </a>
                            <div style={{ width: 1, backgroundColor: '#EBEBCA' }} />
                            <button
                              onClick={() => handleRemoveFromWishlist(product.id)}
                              className="flex-1 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-1.5 transition-colors"
                              style={{ color: '#b91c1c' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FFF0EE')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <Trash2 size={11} /> Remove
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
