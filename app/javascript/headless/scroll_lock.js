// ==========================
// Scroll Locking Logic
// Inspired by Headless UI's scroll locking implementation
// ==========================

let lockCount = 0
let originalStyles = {
  overflow: '',
  paddingRight: ''
}
let iosCleanup = () => { }

/**
 * Calculates the width of the browser's scrollbar.
 * @param {Document} ownerDocument - The document object.
 * @returns {number} The width of the scrollbar in pixels.
 */
function getScrollbarWidth(ownerDocument = document) {
  const documentElement = ownerDocument.documentElement
  const ownerWindow = ownerDocument.defaultView ?? window
  // Calculate the scrollbar width by comparing the width of the viewport
  // with the width of the client area (excluding the scrollbar).
  return Math.abs(ownerWindow.innerWidth - documentElement.clientWidth)
}

/**
 * Prevents scrolling on iOS devices by handling touch events.
 * This is a simplified adaptation of the logic found in Headless UI.
 * @param {boolean} lock - Whether to lock or unlock scrolling.
 * @param {Document} ownerDocument - The document object.
 */
function handleIOSLocking(lock, ownerDocument = document) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (!isIOS) return () => { } // Only apply on iOS

  const body = ownerDocument.body
  let previousBodyPosition = null

  if (lock) {
    // Store previous body position styles
    previousBodyPosition = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
    }

    // Calculate scroll offset
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    // Apply fixed positioning to the body to lock scroll
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = `-${scrollX}px`

    // Return cleanup function to restore styles
    return () => {
      if (previousBodyPosition) {
        body.style.position = previousBodyPosition.position
        body.style.top = previousBodyPosition.top
        body.style.left = previousBodyPosition.left
        // Restore scroll position
        window.scrollTo(scrollX, scrollY)
        previousBodyPosition = null
      }
    }
  } else {
    // Unlock is handled by the returned cleanup function
    return () => { }
  }
}

/**
 * Locks the scroll on the document body.
 * Prevents background scrolling when a modal or dialog is open.
 * Applies padding to account for the scrollbar width to prevent layout shifts.
 * Handles iOS-specific scroll locking.
 * @param {Document} [ownerDocument=document] - The document object.
 */
export function lockScroll(ownerDocument = document) {
  lockCount++

  if (lockCount === 1) {
    const scrollbarWidth = getScrollbarWidth(ownerDocument)
    const documentElement = ownerDocument.documentElement

    // Store original styles
    originalStyles.overflow = documentElement.style.overflow
    originalStyles.paddingRight = documentElement.style.paddingRight

    // Apply lock styles
    documentElement.style.overflow = 'hidden'
    documentElement.style.paddingRight = `${scrollbarWidth}px`

    // Handle iOS locking and store cleanup
    iosCleanup = handleIOSLocking(true, ownerDocument)
  }
}

/**
 * Unlocks the scroll on the document body.
 * Restores original styles and cleans up iOS event listeners.
 * @param {Document} [ownerDocument=document] - The document object.
 */
export function unlockScroll(ownerDocument = document) {
  if (lockCount <= 0) {
    console.warn('Scroll lock count is already zero or negative.')
    return
  }

  lockCount--

  if (lockCount === 0) {
    const documentElement = ownerDocument.documentElement

    // Restore original styles
    documentElement.style.overflow = originalStyles.overflow
    documentElement.style.paddingRight = originalStyles.paddingRight

    // Clean up iOS locking
    iosCleanup()

    // Reset state
    originalStyles = { overflow: '', paddingRight: '' }
    iosCleanup = () => { }
  }
} 