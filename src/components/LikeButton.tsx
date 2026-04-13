import React, {useState} from 'react';
import {useBffState, useGuestId} from '@bffless/use-bff-state';

// The GET pipeline folds rows from the blog_post_likes schema into a
// map keyed by slug. Each button picks its own entry out of the same
// shared state — one network call, N buttons.
interface LikeEntry {
  liked: true;
  slug: string;
  variant: string | null;
  liked_at: string | null;
}

type LikeState = Record<string, LikeEntry>;

function getVariant(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(/(?:^|; )__bffless_variant=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
    return new URLSearchParams(window.location.search).get('version');
  } catch {
    return null;
  }
}

interface LikeButtonProps {
  slug: string;
}

export default function LikeButton({slug}: LikeButtonProps) {
  const {data, refetch, loading, isUninitialized} = useBffState<LikeState>(
    '/state/blog_post_likes',
    {},
  );
  const guestId = useGuestId();
  const [posting, setPosting] = useState(false);

  const entry = data?.[slug];
  const liked = entry?.liked === true;
  const busy = loading || isUninitialized || posting;

  const handleClick = async () => {
    if (liked || busy || !guestId) return;
    setPosting(true);
    try {
      // Delta POST — send just { slug, variant }. The pipeline dedups
      // on (guest_id, slug), inserts if new, and returns the full
      // folded map. We refetch() afterward so useBffState's data
      // reflects the new row.
      await fetch(
        `/api/state/blog_post_likes?_bffGuestId=${encodeURIComponent(guestId)}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({slug, variant: getVariant()}),
        },
      );
      await refetch();

      // Second attribution path: GA event. The variant is already
      // carried as a user_property via gtag-stub.ts so the event
      // will be segmentable by variant in GA Explorations.
      if (
        typeof window !== 'undefined' &&
        typeof (window as any).gtag === 'function'
      ) {
        (window as any).gtag('event', 'blog_post_like', {post_slug: slug});
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '1.5rem 0 0.5rem',
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={liked || busy}
        aria-pressed={liked}
        style={{
          appearance: 'none',
          border: '1px solid var(--ifm-color-primary)',
          background: liked ? 'transparent' : 'var(--ifm-color-primary)',
          color: liked
            ? 'var(--ifm-color-primary)'
            : 'var(--ifm-color-white, #fff)',
          padding: '1rem 2.5rem',
          borderRadius: '4px',
          fontSize: '1.125rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
          cursor: liked || busy ? 'default' : 'pointer',
          opacity: busy && !liked ? 0.7 : 1,
          boxShadow: liked ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.12)',
          transition:
            'background 0.15s, color 0.15s, box-shadow 0.15s, border-color 0.15s',
        }}
      >
        {liked
          ? '✓ Liked — thanks!'
          : posting
            ? '…'
            : '♥ Like this post'}
      </button>
    </div>
  );
}
