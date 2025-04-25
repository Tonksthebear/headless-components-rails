// Global state to manage lock count and original styles
let lockCount = 0;
let originalStyles = {
  overflow: '',
  paddingRight: ''
};
let iosCleanup = () => { };
let scrollPosition = 0;

/**
 * Calculates the width of the browser's scrollbar.
 * @param {Document} ownerDocument - The document object (defaults to global document).
 * @returns {number} The width of the scrollbar in pixels.
 */
function getScrollbarWidth(ownerDocument = document) {
  const documentElement = ownerDocument.documentElement;
  const ownerWindow = ownerDocument.defaultView ?? window;
  return Math.abs(ownerWindow.innerWidth - documentElement.clientWidth);
}

/**
 * Handles iOS-specific scroll locking by fixing the body position.
 * @param {boolean} lock - Whether to lock or unlock scrolling.
 * @param {Document} ownerDocument - The document object (defaults to global document).
 * @returns {Function} Cleanup function to restore iOS-specific styles.
 */
function handleIOSLocking(lock, ownerDocument = document) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS) return () => { };

  const body = ownerDocument.body;

  if (lock) {
    // Capture current scroll position
    scrollPosition = window.scrollY ?? window.pageYOffset;

    // Fix body position to prevent scrolling
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%'; // Prevent width changes

    // Return cleanup function
    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';

      // Restore scroll position after styles are reset
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    };
  }
  return () => { };
}

/**
 * Locks the scroll on the document body.
 * @param {Document} [ownerDocument=document] - The document object.
 */
export function lockScroll(ownerDocument = document) {
  lockCount++;

  // Only apply changes on the first lock
  if (lockCount === 1) {
    const scrollbarWidth = getScrollbarWidth(ownerDocument);
    const documentElement = ownerDocument.documentElement;

    // Store original styles
    originalStyles.overflow = documentElement.style.overflow;
    originalStyles.paddingRight = documentElement.style.paddingRight;

    // Apply scroll lock styles
    documentElement.style.overflow = 'hidden';
    documentElement.style.paddingRight = `${scrollbarWidth}px`;

    // Handle iOS-specific locking
    iosCleanup = handleIOSLocking(true, ownerDocument);
  }
}

/**
 * Unlocks the scroll on the document body.
 * @param {Document} [ownerDocument=document] - The document object.
 */
export function unlockScroll(ownerDocument = document) {
  if (lockCount <= 0) {
    console.warn('Scroll lock count is already zero or negative.');
    return;
  }

  lockCount--;

  // Only restore styles when all locks are released
  if (lockCount === 0) {
    const documentElement = ownerDocument.documentElement;

    // Restore original styles
    documentElement.style.overflow = originalStyles.overflow;
    documentElement.style.paddingRight = originalStyles.paddingRight;

    // Clean up iOS-specific styles and restore scroll position
    iosCleanup();

    // Reset global state
    originalStyles = { overflow: '', paddingRight: '' };
    iosCleanup = () => { };
  }
}