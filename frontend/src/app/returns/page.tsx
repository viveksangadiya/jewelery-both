'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, Package, CheckCircle, XCircle, Clock,
  Truck, ArrowRight, AlertCircle, ChevronDown, X, ArrowLeft
} from 'lucide-react';
import { returnsApi, ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const RETURN_REASONS = [
  'Item received damaged or defective',
  'Wrong item delivered',
  'Item does not match description',
  'Size / dimension issue',
  'Changed my mind',
  'Quality not as expected',
  'Other',
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: any; desc: string }> = {
  pending:   { label: 'Request Submitted', bg: '#EDE8E2', color: '#999',     icon: Clock,       desc: 'We are reviewing your request within 24 hours.' },
  approved:  { label: 'Approved',          bg: '#d4e3cb', color: '#347a07', icon: CheckCircle, desc: 'Our courier will schedule pickup within 24–48 hours.' },
  rejected:  { label: 'Rejected',          bg: '#fff0f0', color: '#e32c2b', icon: XCircle,     desc: 'Your return request was not approved.' },
  picked_up: { label: 'Item Picked Up',    bg: '#EDE8E2', color: '#6B6B6B', icon: Truck,       desc: 'Item is on its way back to us.' },
  received:  { label: 'Item Received',     bg: '#d4e3cb', color: '#347a07', icon: Package,     desc: 'We received your item and are processing the refund.' },
  refunded:  { label: 'Refunded',          bg: '#d4e3cb', color: '#347a07', icon: CheckCircle, desc: 'Your refund has been processed successfully.' },
  exchanged: { label: 'Exchanged',         bg: '#d4e3cb', color: '#347a07', icon: RefreshCw,   desc: 'Exchange completed successfully.' },
};

const STEPS = ['pending', 'approved', 'picked_up', 'received', 'refunded'];

const inputCls = 'w-full px-4 py-3 text-sm border border-brand-border bg-white text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-text transition-colors';

function MyReturns({ onInitiate }: { onInitiate: () => void }) {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    returnsApi.getAll()
      .then((r: any) => setReturns(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this return request?')) return;
    try {
      await returnsApi.cancel(id);
      toast.success('Return cancelled');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map(i => <div key={i} className="h-28 animate-pulse bg-brand-hover" />)}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-brand-text">
          My Returns
        </h2>
        <button onClick={onInitiate} className="btn-brand h-10 px-5">
          + New Request
        </button>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-14 border border-brand-border">
          <RefreshCw size={32} className="mx-auto mb-4 text-brand-border" strokeWidth={1.5} />
          <p className="text-sm font-semibold mb-1 text-brand-text">No return requests yet</p>
          <p className="text-xs mb-6 text-brand-muted">Initiate a return from a recent order</p>
          <button onClick={onInitiate} className="btn-brand h-10 px-7 inline-flex gap-2">
            Initiate Return <ArrowRight size={12} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret: any) => {
            const cfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const currentStep = STEPS.indexOf(ret.status);
            return (
              <div key={ret.id} className="bg-white border border-brand-border">
                <div className="flex items-start justify-between px-5 py-4 border-b border-brand-border">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-mono text-sm font-bold text-brand-text">{ret.return_number}</p>
                      <span className="text-[10px] font-medium px-2.5 py-1 flex items-center gap-1.5 uppercase tracking-[0.1em]"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 uppercase tracking-[0.1em] capitalize bg-brand-hover text-brand-secondary">
                        {ret.type}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 text-brand-muted">
                      Order: <span className="font-semibold text-brand-secondary">{ret.order_number}</span>
                      {' · '}{new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {ret.refund_amount && (
                      <p className="font-bold text-sm text-brand-text">₹{parseFloat(ret.refund_amount).toLocaleString()}</p>
                    )}
                    {ret.status === 'pending' && (
                      <button onClick={() => handleCancel(ret.id)}
                        className="text-xs flex items-center gap-1 ml-auto mt-1 text-red-600">
                        <X size={10} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {ret.status !== 'rejected' && (
                  <div className="px-5 py-3 border-b border-brand-border">
                    <div className="flex items-center mb-2">
                      {STEPS.map((step, i) => {
                        const done = currentStep >= i;
                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{
                                backgroundColor: done ? '#000' : '#EDE8E2',
                                color: done ? '#fff' : '#999',
                              }}>
                              {done ? '✓' : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                              <div className="flex-1 h-px mx-1"
                                style={{ backgroundColor: currentStep > i ? '#000' : '#E0D9D0' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-brand-secondary">{cfg.desc}</p>
                  </div>
                )}

                {ret.status === 'rejected' && ret.rejection_reason && (
                  <div className="px-5 py-3 border-b border-brand-border bg-red-50">
                    <p className="text-xs text-red-600"><strong>Reason:</strong> {ret.rejection_reason}</p>
                  </div>
                )}

                <div className="px-5 py-3">
                  <p className="text-xs text-brand-secondary"><strong>Reason:</strong> {ret.reason}</p>
                  {ret.admin_notes && (
                    <p className="text-xs mt-1 text-brand-text"><strong>Note:</strong> {ret.admin_notes}</p>
                  )}
                  {ret.return_awb && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 border border-brand-border bg-brand-hover">
                        <Truck size={11} className="text-brand-muted" />
                        <span className="text-xs font-mono font-semibold text-brand-text">AWB: {ret.return_awb}</span>
                      </div>
                      <a href={`https://shiprocket.co/tracking/${ret.return_awb}`} target="_blank" rel="noreferrer"
                        className="text-xs font-medium hover:underline text-brand-secondary">
                        Track Pickup →
                      </a>
                    </div>
                  )}
                  {ret.shiprocket_return_id && !ret.return_awb && ret.status === 'approved' && (
                    <p className="text-xs mt-1.5 text-brand-muted">Reverse pickup scheduled · AWB will be assigned shortly</p>
                  )}
                  {ret.items?.filter((i: any) => i.product_name).length > 0 && (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {ret.items.filter((i: any) => i.product_name).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.product_image && <img src={item.product_image} alt="" className="w-8 h-8 object-cover" />}
                          <p className="text-xs text-brand-secondary">{item.product_name} × {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InitiateReturn({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, { selected: boolean; quantity: number }>>({});
  const [type, setType] = useState<'return' | 'exchange'>('return');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ordersApi.getAll()
      .then((r: any) => {
        const returnable = r.data.data.filter((o: any) =>
          ['delivered', 'confirmed', 'processing', 'shipped'].includes(o.status)
        );
        setOrders(returnable);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleSelectOrder = async (order: any) => {
    setLoadingOrder(true);
    try {
      const res = await ordersApi.getById(order.id);
      const full = res.data.data;
      setSelectedOrder(full);
      const init: Record<number, { selected: boolean; quantity: number }> = {};
      full.items?.forEach((item: any) => { init[item.id] = { selected: false, quantity: 1 }; });
      setSelectedItems(init);
      setStep(2);
    } catch { toast.error('Failed to load order'); }
    finally { setLoadingOrder(false); }
  };

  const toggleItem = (id: number) => {
    setSelectedItems(prev => ({ ...prev, [id]: { ...prev[id], selected: !prev[id].selected } }));
  };

  const handleSubmit = async () => {
    if (!reason) { toast.error('Please select a reason'); return; }
    const items = Object.entries(selectedItems)
      .filter(([, v]) => v.selected)
      .map(([id, v]) => ({ order_item_id: parseInt(id), quantity: v.quantity }));
    if (!items.length) { toast.error('Please select at least one item'); return; }
    setSubmitting(true);
    try {
      await returnsApi.create({ order_id: selectedOrder.id, type, reason, description, refund_method: refundMethod, items });
      toast.success('Return request submitted!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const selectedCount = Object.values(selectedItems).filter(v => v.selected).length;

  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-2 text-xs mb-6 text-brand-muted hover:text-brand-text transition-colors"
      >
        <ArrowLeft size={14} /> Back to My Returns
      </button>
      <h2 className="text-xl font-semibold mb-2 text-brand-text">
        Initiate Return / Exchange
      </h2>
      <p className="text-sm mb-8 text-brand-secondary">
        Select your order and items you'd like to return or exchange.
      </p>

      {step === 1 && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-4 text-brand-muted">
            Step 1 — Select Order
          </p>
          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse bg-brand-hover" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 border border-brand-border">
              <Package size={28} className="mx-auto mb-3 text-brand-border" strokeWidth={1.5} />
              <p className="text-sm mb-1 text-brand-text">No eligible orders found</p>
              <p className="text-xs text-brand-muted">Only delivered or confirmed orders within 7 days are eligible.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <button key={order.id} onClick={() => handleSelectOrder(order)}
                  disabled={loadingOrder}
                  className="w-full text-left p-5 bg-white border border-brand-border hover:border-brand-text transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-bold text-brand-text">{order.order_number}</p>
                      <p className="text-xs mt-0.5 text-brand-muted">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{order.item_count} item{order.item_count > 1 ? 's' : ''}
                        {' · '}₹{parseFloat(order.total).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2.5 py-1 font-medium uppercase tracking-[0.1em] capitalize"
                        style={{
                          backgroundColor: order.status === 'delivered' ? '#d4e3cb' : '#EDE8E2',
                          color: order.status === 'delivered' ? '#347a07' : '#000',
                        }}>
                        {order.status}
                      </span>
                      <ArrowRight size={14} className="text-brand-muted" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && selectedOrder && (
        <div className="space-y-7">
          <div className="px-5 py-3 flex items-center justify-between bg-brand-hover border border-brand-border">
            <p className="text-xs font-bold text-brand-text">
              Order: <span className="font-mono">{selectedOrder.order_number}</span> · ₹{parseFloat(selectedOrder.total).toLocaleString()}
            </p>
            <button onClick={() => setStep(1)}
              className="text-[10px] uppercase tracking-[0.1em] font-medium text-brand-muted hover:text-brand-text transition-colors">
              Change
            </button>
          </div>

          {/* Type */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3 text-brand-muted">Request Type</p>
            <div className="flex gap-3">
              {(['return', 'exchange'] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="flex-1 py-3 text-sm font-semibold transition-colors border"
                  style={{
                    borderColor: type === t ? '#000' : '#E0D9D0',
                    backgroundColor: type === t ? '#000' : 'transparent',
                    color: type === t ? '#fff' : '#6B6B6B',
                  }}>
                  {t === 'return' ? '↩ Return & Refund' : '↔ Exchange'}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3 text-brand-muted">Select Items</p>
            <div className="space-y-3">
              {selectedOrder.items?.map((item: any) => {
                const sel = selectedItems[item.id];
                return (
                  <div key={item.id}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      border: `1px solid ${sel?.selected ? '#000' : '#E0D9D0'}`,
                      backgroundColor: sel?.selected ? '#EDE8E2' : '#fff',
                    }}
                    onClick={() => toggleItem(item.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          border: `2px solid ${sel?.selected ? '#000' : '#E0D9D0'}`,
                          backgroundColor: sel?.selected ? '#000' : 'transparent',
                        }}>
                        {sel?.selected && <span className="text-[10px] font-bold text-white">✓</span>}
                      </div>
                      {item.product_image && <img src={item.product_image} alt="" className="w-12 h-12 object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-brand-text">{item.product_name}</p>
                        <p className="text-xs mt-0.5 text-brand-muted">Qty: {item.quantity} · ₹{parseFloat(item.price).toLocaleString()} each</p>
                      </div>
                    </div>
                    {sel?.selected && (
                      <div className="mt-3 ml-9 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <p className="text-[10px] uppercase tracking-[0.1em] font-medium text-brand-muted">Qty to return:</p>
                        <div className="flex items-center border border-brand-border">
                          <button onClick={() => setSelectedItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], quantity: Math.max(1, prev[item.id].quantity - 1) } }))}
                            className="px-2.5 py-1 text-brand-secondary hover:bg-brand-hover transition-colors"
                          >−</button>
                          <span className="px-3 py-1 text-sm font-semibold text-brand-text">{sel.quantity}</span>
                          <button onClick={() => setSelectedItems(prev => ({ ...prev, [item.id]: { ...prev[item.id], quantity: Math.min(item.quantity, prev[item.id].quantity + 1) } }))}
                            className="px-2.5 py-1 text-brand-secondary hover:bg-brand-hover transition-colors"
                          >+</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3 text-brand-muted">Reason *</p>
            <div className="relative">
              <select value={reason} onChange={e => setReason(e.target.value)}
                className={`${inputCls} appearance-none`}
              >
                <option value="">Select a reason</option>
                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted" />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-2 text-brand-muted">
              Additional Details <span className="normal-case font-normal">(optional)</span>
            </p>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in more detail..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Refund method */}
          {type === 'return' && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] mb-3 text-brand-muted">Refund Method</p>
              <div className="space-y-2">
                {[
                  { value: 'original_payment', label: 'Original Payment Method', desc: 'Back to card/UPI used at purchase' },
                  { value: 'bank_transfer',    label: 'Bank Transfer',            desc: 'NEFT/IMPS to your bank account' },
                  { value: 'store_credit',     label: 'Store Credit',             desc: 'Added to wallet — processed faster' },
                ].map(opt => (
                  <label key={opt.value}
                    className="flex items-start gap-3 p-4 cursor-pointer transition-colors"
                    style={{
                      border: `1px solid ${refundMethod === opt.value ? '#000' : '#E0D9D0'}`,
                      backgroundColor: refundMethod === opt.value ? '#EDE8E2' : '#fff',
                    }}>
                    <input type="radio" name="refund_method" value={opt.value} checked={refundMethod === opt.value}
                      onChange={() => setRefundMethod(opt.value)} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{opt.label}</p>
                      <p className="text-xs mt-0.5 text-brand-secondary">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 flex gap-3 bg-brand-hover border border-brand-border">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-brand-muted" />
            <p className="text-xs leading-relaxed text-brand-secondary">
              Pack the item securely in its original packaging. Our courier will schedule free pickup within 24–48 hours of approval.
            </p>
          </div>

          <button onClick={handleSubmit} disabled={submitting || selectedCount === 0 || !reason}
            className="btn-brand w-full h-12 disabled:opacity-40">
            {submitting && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            Submit {type === 'return' ? 'Return' : 'Exchange'} Request
            {selectedCount > 0 && ` (${selectedCount} item${selectedCount > 1 ? 's' : ''})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReturnsPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [view, setView] = useState<'info' | 'my-returns' | 'initiate'>('info');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (mounted && !user) {
    router.push('/account/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* Header */}
      <div className="py-12 px-6 bg-brand-hover border-b border-brand-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-11 h-11 flex items-center justify-center bg-white border border-brand-border">
              <RefreshCw size={18} className="text-brand-text" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-brand-text">
                Returns & Exchange
              </h1>
              <p className="text-xs mt-0.5 text-brand-muted">7-day hassle-free return policy</p>
            </div>
          </div>
          <div className="flex border-b border-brand-border">
            {[{ key: 'info', label: 'Policy' }, { key: 'my-returns', label: 'My Returns' }].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key as any)}
                className="px-6 py-3 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
                style={{
                  color: (view === tab.key || (view === 'initiate' && tab.key === 'my-returns')) ? '#000' : '#999',
                  borderBottom: (view === tab.key || (view === 'initiate' && tab.key === 'my-returns'))
                    ? '2px solid #000' : '2px solid transparent',
                  marginBottom: '-1px',
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {view === 'info' && (
          <div className="space-y-12">
            {/* Steps */}
            <div className="grid sm:grid-cols-4 gap-5 text-center">
              {[
                { num: '01', title: 'Submit Request', desc: 'Fill out the return form in My Returns tab' },
                { num: '02', title: 'Get Approved',   desc: 'We review within 24 hours' },
                { num: '03', title: 'Free Pickup',    desc: 'Courier collects from your door' },
                { num: '04', title: 'Get Refund',     desc: 'Processed in 5–7 business days' },
              ].map(s => (
                <div key={s.title}>
                  <span className="text-3xl font-black block mb-3 text-brand-border">{s.num}</span>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] mb-1 text-brand-text">{s.title}</p>
                  <p className="text-xs leading-relaxed text-brand-secondary">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Eligible / Not eligible */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-green-700">
                  <CheckCircle size={13} className="text-green-700" /> Eligible for Return
                </h3>
                <ul className="space-y-2.5">
                  {['Damaged or defective items', 'Wrong item delivered', 'Does not match description', 'Unused items within 7 days'].map(i => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-brand-secondary">
                      <span className="w-1.5 h-1.5 flex-shrink-0 mt-1.5 bg-green-600" />{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-red-600">
                  <XCircle size={13} className="text-red-600" /> Not Eligible
                </h3>
                <ul className="space-y-2.5">
                  {['Used or altered items', 'Missing original packaging', 'Custom / personalized orders', 'Clearance / final sale items', 'After 7 days from delivery'].map(i => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-brand-secondary">
                      <span className="w-1.5 h-1.5 flex-shrink-0 mt-1.5 bg-red-500" />{i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center pt-2">
              <button onClick={() => setView('my-returns')} className="btn-brand h-12 px-10 inline-flex gap-2">
                Initiate a Return <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
        {view === 'my-returns' && <MyReturns onInitiate={() => setView('initiate')} />}
        {view === 'initiate' && <InitiateReturn onBack={() => setView('my-returns')} onSuccess={() => setView('my-returns')} />}
      </div>
    </div>
  );
}
