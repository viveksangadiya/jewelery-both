'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, User, Heart, LogOut, ChevronRight, Trash2,
  ShoppingBag, Save, X, Settings, Bell, MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import { ordersApi, wishlistApi, authApi } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'orders' | 'wishlist' | 'details' | 'preferences';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#F5F0EB', color: '#999',     label: 'Pending'    },
  confirmed:  { bg: '#F5F0EB', color: '#000',     label: 'Confirmed'  },
  processing: { bg: '#F5F0EB', color: '#6B6B6B',  label: 'Processing' },
  shipped:    { bg: '#000',    color: '#fff',     label: 'Shipped'    },
  delivered:  { bg: '#000',    color: '#fff',     label: 'Delivered'  },
  cancelled:  { bg: '#fff0f0', color: '#b91c1c',  label: 'Cancelled'  },
  refunded:   { bg: '#F5F0EB', color: '#6B6B6B',  label: 'Refunded'   },
};

// ── Tab bar ───────────────────────────────────────────────
function AccountTabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',     label: 'Overview'         },
    { id: 'orders',       label: 'My Orders'        },
    { id: 'wishlist',     label: 'Wishlist'         },
    { id: 'details',      label: 'Account Details'  },
    { id: 'preferences',  label: 'Preferences'      },
  ];
  return (
    <div className="flex overflow-x-auto scrollbar-hide border-b border-brand-border mb-8 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className="flex-shrink-0 px-4 py-3 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors border-b-2 -mb-px"
          style={{
            borderBottomColor: tab === t.id ? '#000' : 'transparent',
            color: tab === t.id ? '#000' : '#999',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Overview section cards ────────────────────────────────
function OverviewCard({
  icon: Icon, title, sub, onClick,
}: { icon: any; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start p-6 bg-white border border-brand-border hover:border-brand-text transition-all text-left"
    >
      <Icon size={20} className="text-brand-muted mb-4 group-hover:text-brand-text transition-colors" strokeWidth={1.5} />
      <p className="text-sm font-medium text-brand-text mb-1">{title}</p>
      <p className="text-[11px] text-brand-muted leading-snug">{sub}</p>
      <ChevronRight size={13} className="text-brand-muted group-hover:text-brand-text transition-colors mt-3" />
    </button>
  );
}

// ── Field label wrapper ───────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-2">{label}</p>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 text-sm border border-brand-border bg-white text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text transition-colors";

export default function AccountPage() {
  const router  = useRouter();
  const user    = useAuthStore(s => s.user);
  const logout  = useAuthStore(s => s.logout);
  const { toggle, clear: clearWishlist } = useWishlistStore();

  const [tab, setTab]                         = useState<Tab>('overview');
  const [orders, setOrders]                   = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders]     = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Profile edit
  const [editMode, setEditMode]               = useState(false);
  const [profileForm, setProfileForm]         = useState({ name: '', phone: '' });
  const [saving, setSaving]                   = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({
    emailMarketing: true,
    smsMarketing: false,
    whatsapp: true,
    newArrivals: true,
    offers: true,
    orderUpdates: true,
  });

  useEffect(() => {
    if (!user) { router.push('/account/login'); return; }
  }, [user]);

  // Load orders when tab is opened
  useEffect(() => {
    if (tab !== 'orders' || !user || orders.length) return;
    setLoadingOrders(true);
    ordersApi.getAll()
      .then(r => setOrders(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [tab, user]);

  // Load wishlist when tab opened
  useEffect(() => {
    if (tab !== 'wishlist' || !user) return;
    setLoadingWishlist(true);
    wishlistApi.get()
      .then(r => setWishlistProducts(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingWishlist(false));
  }, [tab, user]);

  // Also load orders for overview count
  useEffect(() => {
    if (!user) return;
    ordersApi.getAll()
      .then(r => setOrders(r.data.data))
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout(); clearWishlist(); router.push('/');
  };

  const startEdit = () => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      useAuthStore.getState().setUser(res.data.data);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleRemoveWishlist = async (productId: number) => {
    await toggle(productId);
    setWishlistProducts(p => p.filter(x => x.id !== productId));
    toast.success('Removed from wishlist');
  };

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';
  const initials = user.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── Profile banner ── */}
        <div className="bg-white border border-brand-border mb-8">
          <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-16 h-16 object-cover border border-brand-border flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-brand-hover border border-brand-border flex-shrink-0">
                  <span className="text-xl font-medium text-brand-text">{initials}</span>
                </div>
              )}

              {/* Info */}
              <div>
                <h1 className="text-lg font-medium text-brand-text">{user.name}</h1>
                <p className="text-sm text-brand-muted">{user.email}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 border border-brand-border text-brand-muted">
                    Member since {memberSince}
                  </span>
                  {user.auth_provider === 'google' && (
                    <span className="text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 border border-brand-border text-brand-muted">
                      Google Account
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <AccountTabs tab={tab} setTab={setTab} />

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Orders',     value: orders.length,                            suffix: '' },
                { label: 'Delivered',        value: orders.filter(o => o.status === 'delivered').length, suffix: '' },
                { label: 'Wishlist Items',   value: useWishlistStore.getState().getCount(),   suffix: '' },
                { label: 'Member Since',     value: memberSince,                              suffix: '' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-brand-border px-5 py-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-1">{label}</p>
                  <p className="text-xl font-medium text-brand-text">{value}</p>
                </div>
              ))}
            </div>

            {/* Section cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <OverviewCard icon={Package}  title="My Orders"       sub="Track and manage your purchases"    onClick={() => setTab('orders')} />
              <OverviewCard icon={Heart}    title="Wishlist"        sub="Products you've saved for later"    onClick={() => setTab('wishlist')} />
              <OverviewCard icon={User}     title="Account Details" sub="Personal info, phone, address"      onClick={() => setTab('details')} />
              <OverviewCard icon={Settings} title="Preferences"     sub="Notifications and communication"    onClick={() => setTab('preferences')} />
            </div>

            {/* Recent orders preview */}
            {orders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => setTab('orders')}
                    className="text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors underline underline-offset-2"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order: any) => {
                    const st = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
                    return (
                      <div key={order.id} className="bg-white border border-brand-border px-5 py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-mono font-medium text-brand-text">{order.order_number}</p>
                          <p className="text-[10px] text-brand-muted mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}{order.item_count} item{order.item_count > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className="text-[9px] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
                            style={{ backgroundColor: st.bg, color: st.color }}
                          >
                            {st.label}
                          </span>
                          <span className="text-sm font-medium text-brand-text">
                            ₹{parseFloat(order.total).toLocaleString('en-IN')}
                          </span>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors"
                          >
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {tab === 'orders' && (
          <div>
            <h2 className="font-display text-2xl font-normal text-brand-text mb-6">My Orders</h2>
            {loadingOrders ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 skeleton" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center border border-brand-border bg-white">
                <Package size={36} className="text-brand-border mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl text-brand-text mb-2">No orders yet</h3>
                <p className="text-sm text-brand-muted mb-8">Your order history will appear here</p>
                <Link href="/shop" className="btn-brand px-10 h-11">Continue Shopping</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => {
                  const st = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
                  return (
                    <div key={order.id} className="bg-white border border-brand-border px-6 py-5">
                      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <p className="text-sm font-mono font-medium text-brand-text">{order.order_number}</p>
                            <span
                              className="text-[9px] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
                              style={{ backgroundColor: st.bg, color: st.color }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-brand-muted">
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {' · '}{order.item_count} item{order.item_count > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <p className="text-base font-medium text-brand-text">
                            ₹{parseFloat(order.total).toLocaleString('en-IN')}
                          </p>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1"
                          >
                            View Details <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ WISHLIST ══ */}
        {tab === 'wishlist' && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-normal text-brand-text">Wishlist</h2>
                {wishlistProducts.length > 0 && (
                  <p className="text-sm text-brand-muted mt-0.5">{wishlistProducts.length} saved {wishlistProducts.length === 1 ? 'item' : 'items'}</p>
                )}
              </div>
              {wishlistProducts.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await wishlistApi.clear();
                      clearWishlist();
                      setWishlistProducts([]);
                      toast.success('Wishlist cleared');
                    } catch { toast.error('Failed to clear'); }
                  }}
                  className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors"
                >
                  <Trash2 size={11} /> Clear All
                </button>
              )}
            </div>

            {loadingWishlist ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i}>
                    <div className="skeleton aspect-[3/4] mb-3" />
                    <div className="skeleton h-3 w-4/5 mb-2 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : wishlistProducts.length === 0 ? (
              <div className="py-20 text-center border border-brand-border bg-white">
                <Heart size={36} className="text-brand-border mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-display text-xl text-brand-text mb-2">Your wishlist is empty</h3>
                <p className="text-sm text-brand-muted mb-8">Save your favourite pieces to find them easily later</p>
                <Link href="/shop" className="btn-brand px-10 h-11">Browse Collections</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {wishlistProducts.map((product: any) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <button
                      onClick={() => handleRemoveWishlist(product.id)}
                      className="absolute top-2 left-2 z-20 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
                      title="Remove from wishlist"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ACCOUNT DETAILS ══ */}
        {tab === 'details' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="font-display text-2xl font-normal text-brand-text">Account Details</h2>

            {/* Personal info card */}
            <div className="bg-white border border-brand-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                  Personal Information
                </p>
                {!editMode && (
                  <button
                    onClick={startEdit}
                    className="text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors underline underline-offset-2"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="px-6 py-6">
                {editMode ? (
                  <div className="space-y-4">
                    <Field label="Full Name *">
                      <input
                        value={profileForm.name}
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                        className={inputCls}
                        placeholder="Your full name"
                      />
                    </Field>
                    <Field label="Phone Number">
                      <input
                        value={profileForm.phone}
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className={inputCls}
                        placeholder="+91 98765 43210"
                        maxLength={13}
                      />
                    </Field>
                    <Field label="Email Address">
                      <p className="text-sm text-brand-secondary py-3 px-4 border border-brand-border bg-brand-hover">
                        {user.email}
                        <span className="ml-2 text-[10px] text-brand-muted">(cannot be changed)</span>
                      </p>
                    </Field>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-brand h-11 px-6 text-[11px]"
                      >
                        {saving
                          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <><Save size={13} /> Save Changes</>
                        }
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn-brand-outline h-11 px-6 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      { label: 'Full Name',     value: user.name },
                      { label: 'Email',         value: user.email },
                      { label: 'Phone',         value: user.phone || '—' },
                      { label: 'Member Since',  value: memberSince },
                    ].map(({ label, value }) => (
                      <div key={label} className="border-b border-brand-border pb-4">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-brand-muted mb-1.5">{label}</p>
                        <p className="text-sm font-medium text-brand-text">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Address card placeholder */}
            <div className="bg-white border border-brand-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                  Saved Addresses
                </p>
                <button className="text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-text transition-colors underline underline-offset-2">
                  Add New
                </button>
              </div>
              <div className="px-6 py-10 text-center">
                <MapPin size={28} className="text-brand-border mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-brand-muted">No saved addresses yet</p>
                <p className="text-[11px] text-brand-muted mt-1">
                  Addresses are saved automatically at checkout
                </p>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white border border-brand-border px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-text">Sign out of your account</p>
                <p className="text-[11px] text-brand-muted mt-0.5">You can sign back in at any time</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-brand-outline h-10 px-5 text-[11px]"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ══ PREFERENCES ══ */}
        {tab === 'preferences' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="font-display text-2xl font-normal text-brand-text">Preferences</h2>

            {/* Communication channels */}
            <div className="bg-white border border-brand-border">
              <div className="px-6 py-4 border-b border-brand-border flex items-center gap-3">
                <Bell size={14} className="text-brand-muted" strokeWidth={1.5} />
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                  Communication Preferences
                </p>
              </div>
              <div className="px-6 py-5 divide-y divide-brand-border">
                {[
                  { key: 'emailMarketing', label: 'Email newsletters',    sub: 'Collections, offers, and brand stories' },
                  { key: 'smsMarketing',   label: 'SMS notifications',    sub: 'Order updates and exclusive SMS offers' },
                  { key: 'whatsapp',       label: 'WhatsApp messages',    sub: 'Order alerts and personalised picks' },
                ].map(({ key, label, sub }) => (
                  <label key={key} className="flex items-center justify-between py-4 cursor-pointer group">
                    <div>
                      <p className="text-sm text-brand-text group-hover:text-brand-secondary transition-colors">{label}</p>
                      <p className="text-[11px] text-brand-muted mt-0.5">{sub}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[key as keyof typeof prefs]}
                      onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-black flex-shrink-0 ml-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Marketing interests */}
            <div className="bg-white border border-brand-border">
              <div className="px-6 py-4 border-b border-brand-border">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-brand-text">
                  Interests
                </p>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Tell us what you love to receive relevant recommendations
                </p>
              </div>
              <div className="px-6 py-5 divide-y divide-brand-border">
                {[
                  { key: 'newArrivals',  label: 'New Arrivals',      sub: 'Be the first to know about new collections' },
                  { key: 'offers',       label: 'Offers & Discounts', sub: 'Sale events and exclusive member pricing'   },
                  { key: 'orderUpdates', label: 'Order Updates',      sub: 'Shipping and delivery notifications'        },
                ].map(({ key, label, sub }) => (
                  <label key={key} className="flex items-center justify-between py-4 cursor-pointer group">
                    <div>
                      <p className="text-sm text-brand-text group-hover:text-brand-secondary transition-colors">{label}</p>
                      <p className="text-[11px] text-brand-muted mt-0.5">{sub}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={prefs[key as keyof typeof prefs]}
                      onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
                      className="w-4 h-4 accent-black flex-shrink-0 ml-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => toast.success('Preferences saved!')}
              className="btn-brand h-12 px-10 text-[11px]"
            >
              Save Preferences
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
