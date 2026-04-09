'use client';
import { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ReviewsSectionProps {
  productId: number;
  productName: string;
}

// ── Star components ──────────────────────────────────────
function StarPicker({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size}
            style={{ color: s <= display ? '#B68868' : '#EBEBCA' }}
            fill={s <= display ? '#B68868' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size}
          style={{ color: s <= Math.round(value) ? '#B68868' : '#EBEBCA' }}
          fill={s <= Math.round(value) ? '#B68868' : 'none'} />
      ))}
    </div>
  );
}

// ── Rating breakdown bar ─────────────────────────────────
function RatingBar({ label, count, total, onClick, active }: {
  label: string; count: number; total: number; onClick: () => void; active: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 w-full group"
      style={{ opacity: active ? 1 : 0.75 }}>
      <span className="text-xs w-3 flex-shrink-0 text-right font-medium" style={{ color: '#642308' }}>{label}</span>
      <Star size={10} style={{ color: '#B68868', flexShrink: 0 }} fill="#B68868" />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EBEBCA' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: active ? '#642308' : '#B68868' }} />
      </div>
      <span className="text-[10px] w-6 text-right flex-shrink-0" style={{ color: '#B68868' }}>{count}</span>
    </button>
  );
}

export default function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const user = useAuthStore(s => s.user);
  const [reviews, setReviews]           = useState<any[]>([]);
  const [summary, setSummary]           = useState<any>(null);
  const [myReview, setMyReview]         = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy]             = useState('newest');

  const [showForm, setShowForm]     = useState(false);
  const [rating, setRating]         = useState(0);
  const [title, setTitle]           = useState('');
  const [comment, setComment]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const LIMIT = 5;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res  = await reviewsApi.getByProduct(productId, p);
      const data = res.data;
      let rows   = data.data;

      if (filterRating !== null)
        rows = rows.filter((r: any) => r.rating === filterRating);
      if (sortBy === 'highest') rows = [...rows].sort((a: any, b: any) => b.rating - a.rating);
      if (sortBy === 'lowest')  rows = [...rows].sort((a: any, b: any) => a.rating - b.rating);
      if (sortBy === 'newest')  rows = [...rows].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setReviews(rows);
      setSummary(data.summary);
      setTotalPages(Math.ceil(parseInt(data.summary?.total || 0) / LIMIT));
    } catch { }
    finally { setLoading(false); }
  };

  const loadMyReview = async () => {
    if (!user) return;
    try {
      const res = await reviewsApi.getMyReview(productId);
      const r = res.data.data;
      if (r) { setMyReview(r); setRating(r.rating); setTitle(r.title || ''); setComment(r.comment || ''); }
    } catch { }
    try {
      const res = await reviewsApi.checkPurchased(productId);
      setHasPurchased(res.data.data.purchased);
    } catch { setHasPurchased(true); }
  };

  useEffect(() => { load(page); }, [productId, page, sortBy, filterRating]);
  useEffect(() => { loadMyReview(); }, [productId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in'); return; }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, { rating, title, comment });
      toast.success(myReview ? 'Review updated!' : 'Review submitted!');
      setShowForm(false);
      load(1); loadMyReview();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete your review?')) return;
    try {
      await reviewsApi.delete(productId);
      toast.success('Review deleted');
      setMyReview(null); setRating(0); setTitle(''); setComment(''); setShowForm(false);
      load(1);
    } catch { toast.error('Failed to delete'); }
  };

  const totalReviews = parseInt(summary?.total || 0);
  const avgRating    = parseFloat(summary?.avg_rating || 0);
  const breakdown    = [
    { label: '5', count: parseInt(summary?.five  || 0) },
    { label: '4', count: parseInt(summary?.four  || 0) },
    { label: '3', count: parseInt(summary?.three || 0) },
    { label: '2', count: parseInt(summary?.two   || 0) },
    { label: '1', count: parseInt(summary?.one   || 0) },
  ];

  return (
    <div>
      {/* ── Section title ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h2 className="text-[11px] font-bold tracking-[0.35em] uppercase" style={{ color: '#642308' }}>
          Customer Reviews
        </h2>
        {/* Write review CTA */}
        {user && hasPurchased !== false && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-[10px] font-bold tracking-[0.2em] uppercase pb-0.5 transition-colors"
            style={{ color: '#642308', borderBottom: '1px solid #642308' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#903E1D')}
            onMouseLeave={e => (e.currentTarget.style.color = '#642308')}>
            {myReview ? 'Edit Review' : 'Write a Review'}
          </button>
        )}
        {!user && (
          <a href="/account/login"
            className="text-[10px] font-bold tracking-[0.2em] uppercase pb-0.5"
            style={{ color: '#642308', borderBottom: '1px solid #642308' }}>
            Write a Review
          </a>
        )}
        {user && hasPurchased === false && !myReview && (
          <span className="text-[10px] tracking-widest uppercase" style={{ color: '#B68868' }}>
            Purchase to review
          </span>
        )}
      </div>

      {/* ── Write / Edit form ── */}
      {showForm && (
        <div className="mb-10 p-6 sm:p-8" style={{ border: '1px solid #EBEBCA', backgroundColor: 'rgba(235,235,202,0.25)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#642308' }}>
              {myReview ? 'Edit Your Review' : 'Share Your Experience'}
            </h3>
            <button onClick={() => setShowForm(false)}
              className="text-[10px] tracking-widest uppercase transition-colors"
              style={{ color: '#B68868' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#B68868' }}>
                Your Rating <span style={{ color: '#903E1D' }}>*</span>
              </p>
              <div className="flex items-center gap-3">
                <StarPicker value={rating} onChange={setRating} size={26} />
                {rating > 0 && (
                  <span className="text-xs font-medium" style={{ color: '#642308' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: '#B68868' }}>
                Review Title
              </p>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full px-4 py-3 text-sm outline-none bg-white"
                style={{ border: '1px solid #EBEBCA', color: '#642308' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: '#B68868' }}>
                Your Review
              </p>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder={`Share your experience with ${productName}…`}
                rows={4}
                className="w-full px-4 py-3 text-sm outline-none resize-none bg-white"
                style={{ border: '1px solid #EBEBCA', color: '#642308' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')} />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button type="submit" disabled={submitting || rating === 0}
                className="px-8 h-12 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-all disabled:opacity-40"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                onMouseEnter={e => { if (!submitting && rating > 0) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: 'rgba(250,249,238,0.4)', borderTopColor: '#FAF9EE' }} />
                )}
                {myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button type="button" onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs tracking-wide uppercase transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#b91c1c')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Two-column: summary LEFT + reviews RIGHT ── */}
      {totalReviews === 0 && !myReview ? (
        <div className="py-16 text-center" style={{ border: '1px solid #EBEBCA' }}>
          <div className="flex justify-center mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={20} style={{ color: '#EBEBCA' }} fill="#EBEBCA" />
            ))}
          </div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: '#642308' }}>
            No Reviews Yet
          </p>
          <p className="text-xs mb-6" style={{ color: '#B68868' }}>Be the first to share your experience</p>
          {user && hasPurchased !== false && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="px-8 h-11 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10 xl:gap-16">

          {/* ── LEFT: Rating summary ── */}
          <div className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-6">
              {/* Big avg number */}
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display text-6xl font-normal leading-none" style={{ color: '#642308' }}>
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </span>
                <div className="pb-1">
                  <Stars value={avgRating} size={14} />
                  <p className="text-xs mt-1" style={{ color: '#B68868' }}>
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-2 mb-6">
                {breakdown.map(({ label, count }) => (
                  <RatingBar key={label} label={label} count={count} total={totalReviews}
                    active={filterRating === parseInt(label)}
                    onClick={() => {
                      setFilterRating(f => f === parseInt(label) ? null : parseInt(label));
                      setPage(1);
                    }} />
                ))}
              </div>

              {filterRating !== null && (
                <button onClick={() => { setFilterRating(null); setPage(1); }}
                  className="text-[10px] tracking-widest uppercase pb-0.5 transition-colors"
                  style={{ color: '#B68868', borderBottom: '1px solid #EBEBCA' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  Clear Filter
                </button>
              )}

              {/* Sort */}
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid #EBEBCA' }}>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: '#B68868' }}>Sort By</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { v: 'newest',  l: 'Most Recent'    },
                    { v: 'highest', l: 'Highest Rating'  },
                    { v: 'lowest',  l: 'Lowest Rating'   },
                  ].map(({ v, l }) => (
                    <button key={v} onClick={() => setSortBy(v)}
                      className="text-left text-xs transition-colors"
                      style={{
                        color: sortBy === v ? '#642308' : '#B68868',
                        fontWeight: sortBy === v ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (sortBy !== v) (e.currentTarget.style.color = '#642308'); }}
                      onMouseLeave={e => { if (sortBy !== v) (e.currentTarget.style.color = '#B68868'); }}>
                      {sortBy === v ? '→ ' : ''}{l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Reviews list ── */}
          <div>
            {/* My review pinned */}
            {myReview && !showForm && (
              <div className="mb-6 p-5" style={{ backgroundColor: 'rgba(235,235,202,0.35)', border: '1px solid #EBEBCA' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Stars value={myReview.rating} size={13} />
                      <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5"
                        style={{ backgroundColor: '#642308', color: '#FAF9EE' }}>
                        Your Review
                      </span>
                    </div>
                    {myReview.title && (
                      <p className="text-sm font-semibold mb-1" style={{ color: '#642308' }}>{myReview.title}</p>
                    )}
                    {myReview.comment && (
                      <p className="text-sm leading-relaxed" style={{ color: '#903E1D', fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>
                        {myReview.comment}
                      </p>
                    )}
                    <p className="text-[10px] mt-2 font-mono" style={{ color: '#B68868' }}>
                      {new Date(myReview.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-1 flex-shrink-0 text-xs transition-colors"
                    style={{ color: '#B68868' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
              </div>
            )}

            {/* Reviews */}
            {loading ? (
              <div className="space-y-0">
                {[1, 2, 3].map(i => (
                  <div key={i} className="py-7" style={{ borderBottom: '1px solid #EBEBCA' }}>
                    <div className="flex gap-2 mb-3">
                      {[1,2,3,4,5].map(s => <div key={s} className="skeleton w-3 h-3 rounded-sm" />)}
                    </div>
                    <div className="skeleton h-3 w-2/5 mb-2 rounded" />
                    <div className="skeleton h-3 w-4/5 mb-1.5 rounded" />
                    <div className="skeleton h-3 w-3/5 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {reviews
                  .filter(r => !myReview || r.id !== myReview.id)
                  .map((r, idx, arr) => (
                    <div key={r.id} className="py-7"
                      style={{ borderBottom: idx < arr.length - 1 ? '1px solid #EBEBCA' : 'none' }}>

                      {/* Top row: stars + date */}
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <Stars value={r.rating} size={13} />
                        <span className="text-[10px] font-mono" style={{ color: '#B68868' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Title */}
                      {r.title && (
                        <p className="text-sm font-semibold mb-1.5" style={{ color: '#642308' }}>
                          {r.title}
                        </p>
                      )}

                      {/* Comment */}
                      {r.comment && (
                        <p className="text-sm leading-relaxed mb-3"
                          style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                          {r.comment}
                        </p>
                      )}

                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ backgroundColor: '#EBEBCA', color: '#642308' }}>
                          {r.user_name?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-xs font-medium" style={{ color: '#642308' }}>
                          {r.user_name?.split(' ')[0]} {r.user_name?.split(' ').slice(1).map((n: string) => n[0]).join('')}.
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 font-medium tracking-wide"
                          style={{ backgroundColor: 'rgba(144,62,29,0.1)', color: '#903E1D' }}>
                          Verified Buyer
                        </span>
                      </div>
                    </div>
                  ))}

                {reviews.filter(r => !myReview || r.id !== myReview.id).length === 0 && filterRating !== null && (
                  <div className="py-12 text-center">
                    <p className="text-xs" style={{ color: '#B68868' }}>No {filterRating}-star reviews yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 mt-8 pt-6" style={{ borderTop: '1px solid #EBEBCA' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  <ChevronLeft size={15} />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let num: number;
                  if (totalPages <= 5)             num = i + 1;
                  else if (page <= 3)              num = i + 1;
                  else if (page >= totalPages - 2) num = totalPages - 4 + i;
                  else                             num = page - 2 + i;
                  return num;
                }).map(num => (
                  <button key={num} onClick={() => setPage(num)}
                    className="w-8 h-8 flex items-center justify-center text-sm transition-all"
                    style={{
                      backgroundColor: page === num ? '#642308' : 'transparent',
                      color: page === num ? '#FAF9EE' : '#B68868',
                    }}
                    onMouseEnter={e => { if (page !== num) (e.currentTarget.style.color = '#642308'); }}
                    onMouseLeave={e => { if (page !== num) (e.currentTarget.style.color = '#B68868'); }}>
                    {num}
                  </button>
                ))}

                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span style={{ color: '#B68868' }} className="text-sm">…</span>
                    <button onClick={() => setPage(totalPages)}
                      className="w-8 h-8 flex items-center justify-center text-sm transition-colors"
                      style={{ color: '#B68868' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                      {totalPages}
                    </button>
                  </>
                )}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
