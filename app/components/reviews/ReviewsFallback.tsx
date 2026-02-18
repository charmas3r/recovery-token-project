/**
 * Reviews Fallback Component
 *
 * Displayed when reviews fail to load.
 * Provides graceful degradation for better UX.
 */

export function ReviewsFallback() {
  return (
    <div className="p-6 bg-white/[0.05] rounded-lg border border-white/[0.08]">
      <p className="text-white/50">
        Reviews are temporarily unavailable. Please check back later.
      </p>
      <p className="text-sm text-white/40 mt-2">
        If you have questions about this product, please{' '}
        <a href="/contact" className="text-accent hover:text-accent/80 underline">
          contact us
        </a>
        .
      </p>
    </div>
  );
}
