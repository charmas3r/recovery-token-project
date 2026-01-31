/**
 * Reviews Fallback Component
 * 
 * Displayed when reviews fail to load.
 * Provides graceful degradation for better UX.
 */

export function ReviewsFallback() {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <p className="text-gray-600">
        Reviews are temporarily unavailable. Please check back later.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        If you have questions about this product, please{' '}
        <a href="/contact" className="text-indigo-600 hover:text-indigo-700 underline">
          contact us
        </a>
        .
      </p>
    </div>
  );
}
