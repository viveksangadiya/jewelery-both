'use client';
import { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ReviewsSectionProps {
  productId: number;
  productName: string;
}

// ── Interactive star picker ───────────────────────────────
function StarPicker({ value, onChange, size = 26 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star
            size={size}
            style={{ color: s <= display ? '#903E1D' : '#EBEBCA' }}
            fill={s <= display ? '#903E1D' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

// ── Display stars (read-only) ─────────────────────────────
function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size}
          style={{ color: s <= Math.round(value) ? '#903E1D' : '#EBEBCA' }}
          fill={s <= Math.round(value) ? '#903E1D' : 'none'}
        />
      ))}
    </div>
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
  const [searchQuery, setSearchQuery]   = useState('');
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
      const res = await reviewsApi.getByProduct(productId, p);
      const data = res.data;
      let rows = data.data;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        rows = rows.filter((r: any) =>
          r.comment?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.user_name?.toLowerCase().includes(q)
        );
      }

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

  useEffect(() => { load(page); }, [productId, page, sortBy]);
  useEffect(() => { loadMyReview(); }, [productId, user]);
  useEffect(() => {
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

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

  return (
    <div className="mt-20 pt-14" style={{ borderTop: '1px solid #EBEBCA' }}>

      {/* ── Section header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div className="flex items-center gap-5 flex-wrap">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: '#642308' }}>
            Customer Reviews
            {totalReviews > 0 && (
              <span className="ml-2 font-normal tracking-normal normal-case" style={{ color: '#B68868' }}>
                ({totalReviews})
              </span>
            )}
          </h2>
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: '#642308' }}>{avgRating.toFixed(1)}</span>
              <Stars value={avgRating} size={14} />
            </div>
          )}
        </div>

        {/* Write review CTA */}
        <div className="flex items-center">
          {user && hasPurchased !== false && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-bold tracking-[0.2em] uppercase pb-0.5 transition-colors"
              style={{ color: '#903E1D', borderBottom: '1px solid #B68868' }}>
              {myReview ? 'Edit Review' : 'Write a Review'}
            </button>
          )}
          {user && hasPurchased === false && !myReview && (
            <span className="text-xs tracking-widest uppercase" style={{ color: '#B68868' }}>
              Purchase to review
            </span>
          )}
          {!user && (
            <a
              href="/account/login"
              className="text-xs font-bold tracking-[0.2em] uppercase pb-0.5 transition-colors"
              style={{ color: '#903E1D', borderBottom: '1px solid #B68868' }}>
              Write a Review
            </a>
          )}
        </div>
      </div>

      {/* ── Write / Edit form ── */}
      {showForm && (
        <div className="mb-10 p-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#FAF9EE' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: '#642308' }}>
              {myReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-[10px] tracking-widest uppercase transition-colors"
              style={{ color: '#B68868' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
              onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star picker */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: '#B68868' }}>
                Your Rating *
              </p>
              <div className="flex items-center gap-3">
                <StarPicker value={rating} onChange={setRating} size={26} />
                {rating > 0 && (
                  <span className="text-xs" style={{ color: '#903E1D' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: '#B68868' }}>
                Review Title
              </p>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                className="w-full px-4 py-3 text-sm outline-none transition-colors bg-white"
                style={{ border: '1px solid #EBEBCA', color: '#642308' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
              />
            </div>

            {/* Comment */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: '#B68868' }}>
                Your Review
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share details about your experience with this toran…"
                rows={4}
                className="w-full px-4 py-3 text-sm outline-none transition-colors resize-none bg-white"
                style={{ border: '1px solid #EBEBCA', color: '#642308' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#B68868')}
                onBlur={e => (e.currentTarget.style.borderColor = '#EBEBCA')}
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-colors disabled:opacity-40"
                style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
                onMouseEnter={e => { if (!submitting && rating > 0) (e.currentTarget.style.backgroundColor = '#903E1D'); }}
                onMouseLeave={e => { if (!submitting && rating > 0) (e.currentTarget.style.backgroundColor = '#642308'); }}>
                {submitting && (
                  <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: '#FAF9EE', borderTopColor: 'transparent' }} />
                )}
                {myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs tracking-wide uppercase transition-colors"
                  style={{ color: '#B68868' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── My review highlight ── */}
      {myReview && !showForm && (
        <div className="mb-8 p-5 flex gap-6" style={{ border: '1px solid #EBEBCA', backgroundColor: '#EBEBCA' }}>
          <div className="w-36 flex-shrink-0">
            <p className="text-xs font-semibold" style={{ color: '#642308' }}>
              {user?.name?.split(' ')[0]} {user?.name?.split(' ').pop()?.[0]}.
            </p>
            <p className="text-[10px] font-bold tracking-wide mt-0.5 uppercase" style={{ color: '#903E1D' }}>Your Review</p>
            <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#B68868' }}>
              {new Date(myReview.created_at).toLocaleDateString('en-GB')}
            </p>
          </div>
          <div className="flex-1">
            <Stars value={myReview.rating} size={13} />
            {myReview.title && (
              <p className="text-xs font-bold uppercase tracking-wide mt-2" style={{ color: '#642308' }}>
                {myReview.title}
              </p>
            )}
            {myReview.comment && (
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                {myReview.comment}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 flex items-center gap-1 self-start text-xs transition-colors"
            style={{ color: '#B68868' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
            onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
            <Edit2 size={11} /> Edit
          </button>
        </div>
      )}

      {/* ── Search + Sort bar ── */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2 pb-1 w-56"
            style={{ borderBottom: '1px solid #EBEBCA' }}>
            <Search size={13} style={{ color: '#B68868', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reviews"
              className="flex-1 text-xs outline-none bg-transparent"
              style={{ color: '#642308' }}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: '#B68868' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-semibold tracking-wide border-none outline-none bg-transparent cursor-pointer"
              style={{ color: '#642308' }}>
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Reviews list ── */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-6 pb-8" style={{ borderBottom: '1px solid #EBEBCA' }}>
              <div className="w-36 space-y-2 flex-shrink-0">
                <div className="skeleton h-3 rounded w-20" />
                <div className="skeleton h-2.5 rounded w-16" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 rounded w-24" />
                <div className="skeleton h-3 rounded w-3/4" />
                <div className="skeleton h-3 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !myReview ? (
        /* Empty state */
        <div className="py-16 text-center" style={{ border: '1px solid #EBEBCA' }}>
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: '#B68868' }}>
            No Reviews Yet
          </p>
          <p className="text-xs mb-6" style={{ color: '#B68868' }}>
            Be the first to share your experience
          </p>
          {user && hasPurchased !== false && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
              style={{ backgroundColor: '#642308', color: '#FAF9EE' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#903E1D')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#642308')}>
              Write a Review
            </button>
          )}
        </div>
      ) : (
        /* Reviews — 2-col layout */
        <div>
          {reviews
            .filter(r => !myReview || r.id !== myReview.id)
            .map((r, idx, arr) => (
              <div
                key={r.id}
                className="flex gap-8 lg:gap-16 py-7"
                style={{ borderBottom: idx < arr.length - 1 ? '1px solid #EBEBCA' : 'none' }}>

                {/* Left: author */}
                <div className="w-36 xl:w-44 flex-shrink-0">
                  <p className="text-sm font-semibold" style={{ color: '#642308' }}>
                    {r.user_name?.split(' ')[0]} {r.user_name?.split(' ').slice(1).map((n: string) => n[0]).join('')}.
                  </p>
                  <p className="text-[10px] font-medium tracking-wide mt-0.5 uppercase" style={{ color: '#B68868' }}>
                    Verified Buyer
                  </p>
                  <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#B68868' }}>
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>

                {/* Right: review content */}
                <div className="flex-1 min-w-0">
                  <Stars value={r.rating} size={13} />
                  {r.title && (
                    <p className="text-xs font-bold uppercase tracking-wide mt-2" style={{ color: '#642308' }}>
                      {r.title}
                    </p>
                  )}
                  {r.comment && (
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#903E1D', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: '#B68868' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
            onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let num: number;
            if (totalPages <= 5)        num = i + 1;
            else if (page <= 3)         num = i + 1;
            else if (page >= totalPages - 2) num = totalPages - 4 + i;
            else                        num = page - 2 + i;
            return num;
          }).map((num, i, arr) => (
            <span key={num} className="flex items-center gap-2">
              {i === arr.length - 1 && num < totalPages && arr[i - 1] !== num - 1 && (
                <span className="text-sm" style={{ color: '#B68868' }}>…</span>
              )}
              <button
                onClick={() => setPage(num)}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors"
                style={{
                  color: page === num ? '#642308' : '#B68868',
                  textDecoration: page === num ? 'underline' : 'none',
                  textUnderlineOffset: '3px',
                }}>
                {num}
              </button>
            </span>
          ))}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-sm" style={{ color: '#B68868' }}>…</span>
              <button
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors"
                style={{ color: '#B68868' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
                onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: '#B68868' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#642308')}
            onMouseLeave={e => (e.currentTarget.style.color = '#B68868')}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
