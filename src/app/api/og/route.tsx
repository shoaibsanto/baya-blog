/**
 * Dynamic Open Graph image generator for BAYA Blog
 * 
 * Usage: GET /api/og?title=Job+Title&category=government-jobs
 * 
 * Returns a 1200x630px image optimized for social sharing.
 */
import { ImageResponse } from 'next/og';
import { CATEGORIES } from '@/config/site.config';

// Color palette
const COLORS = {
  primary: '#1e40af',      // blue-800
  secondary: '#3b82f6',    // blue-500
  accent: '#f59e0b',       // amber-500
  dark: '#1e293b',         // slate-800
  light: '#f8fafc',        // slate-50
  white: '#ffffff',
};

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  'government-jobs': '#1e40af',
  'bank-jobs': '#059669',
  'private-jobs': '#7c3aed',
  'ngo-jobs': '#dc2626',
  'pharma-jobs': '#0891b2',
  'group-of-company-jobs': '#ea580c',
  'university-jobs': '#4f46e5',
  'defence-jobs': '#16a34a',
  'teletalk-application': '#0d9488',
  'hot-jobs': '#dc2626',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'বাস্তব চাকরির খবর';
  const category = searchParams.get('category') || 'government-jobs';
  const organization = searchParams.get('org') || '';

  // Get category color
  const catColor = CATEGORY_COLORS[category] || COLORS.primary;

  // Truncate title if too long (max ~60 chars for readability)
  const displayTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}dd 60%, ${catColor}88 100%)`,
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top bar with gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.secondary})`,
          }}
        />

        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content container */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Logo circle */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '24px',
                color: catColor,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              B
            </div>
            <div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: COLORS.white,
                  letterSpacing: '-0.5px',
                }}
              >
                BAYA Blog
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                বাংলাদেশের চাকরির খবর
              </div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ marginTop: '40px' }}>
            {/* Category badge */}
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.2)',
                color: COLORS.white,
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {category === 'government-jobs' && '🏛️ সরকারি চাকরি'}
              {category === 'bank-jobs' && '🏦 ব্যাংক চাকরি'}
              {category === 'private-jobs' && '💼 প্রাইভেট চাকরি'}
              {category === 'ngo-jobs' && '🌍 এনজিও চাকরি'}
              {category === 'pharma-jobs' && '💊 ফার্মা চাকরি'}
              {category === 'hot-jobs' && '🔥 হট জব'}
              {!['government-jobs', 'bank-jobs', 'private-jobs', 'ngo-jobs', 'pharma-jobs', 'hot-jobs'].includes(category) && category.toUpperCase()}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '42px',
                fontWeight: 800,
                color: COLORS.white,
                lineHeight: 1.2,
                margin: 0,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {displayTitle}
            </h1>

            {/* Organization name if provided */}
            {organization && (
              <div
                style={{
                  marginTop: '16px',
                  fontSize: '20px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                }}
              >
                {organization}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 0',
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                প্রতিদিন হালনাগাদ
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 600 }}>
              baya.blog
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '100px',
            right: '100px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [],
    }
  );
}
