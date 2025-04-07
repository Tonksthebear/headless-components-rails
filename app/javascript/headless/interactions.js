/**
 * Creates interaction handlers for floating elements
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.reference - The reference element
 * @param {HTMLElement} options.floating - The floating element
 * @param {Object} options.config - Interaction configuration
 * @param {boolean} [options.config.openOnHover=false] - Whether to open on hover
 * @param {boolean} [options.config.openOnFocus=false] - Whether to open on focus
 * @param {boolean} [options.config.openOnClick=false] - Whether to open on click
 * @param {number} [options.config.hoverDelay=0] - Delay before opening on hover (ms)
 * @param {number} [options.config.closeDelay=0] - Delay before closing on hover out (ms)
 * @param {Function} [options.onOpen] - Callback when the floating element opens
 * @param {Function} [options.onClose] - Callback when the floating element closes
 * @returns {Object} - Cleanup function
 */
export function createInteractions({
  reference,
  floating,
  config = {},
  onOpen,
  onClose
}) {
  if (!reference || !floating) return () => { }

  // Default configuration
  const {
    openOnHover = false,
    openOnFocus = false,
    openOnClick = false,
    hoverDelay = 0,
    closeDelay = 0
  } = config

  // State
  let isOpen = false
  let hoverTimeout = null
  let closeTimeout = null

  // Helper functions
  const open = () => {
    if (isOpen) return

    clearTimeout(closeTimeout)
    clearTimeout(hoverTimeout)

    isOpen = true
    floating.style.display = ''
    floating.setAttribute('data-state', 'open')

    if (onOpen) onOpen()
  }

  const close = () => {
    if (!isOpen) return

    clearTimeout(closeTimeout)
    clearTimeout(hoverTimeout)

    isOpen = false
    floating.style.display = 'none'
    floating.setAttribute('data-state', 'closed')

    if (onClose) onClose()
  }

  const handleMouseEnter = () => {
    if (!openOnHover) return

    clearTimeout(closeTimeout)

    if (hoverDelay > 0) {
      hoverTimeout = setTimeout(open, hoverDelay)
    } else {
      open()
    }
  }

  const handleMouseLeave = () => {
    if (!openOnHover) return

    clearTimeout(hoverTimeout)

    if (closeDelay > 0) {
      closeTimeout = setTimeout(close, closeDelay)
    } else {
      close()
    }
  }

  const handleFocus = () => {
    if (!openOnFocus) return
    open()
  }

  const handleBlur = (event) => {
    if (!openOnFocus) return

    // Check if the related target is inside the floating element
    const relatedTarget = event.relatedTarget
    if (floating.contains(relatedTarget)) return

    close()
  }

  const handleClick = (event) => {
    if (!openOnClick) return

    // Toggle open state
    if (isOpen) {
      close()
    } else {
      open()
    }

    // Prevent event from bubbling
    event.stopPropagation()
  }

  // Set up event listeners
  if (openOnHover) {
    reference.addEventListener('mouseenter', handleMouseEnter)
    reference.addEventListener('mouseleave', handleMouseLeave)
    floating.addEventListener('mouseenter', handleMouseEnter)
    floating.addEventListener('mouseleave', handleMouseLeave)
  }

  if (openOnFocus) {
    reference.addEventListener('focus', handleFocus)
    reference.addEventListener('blur', handleBlur)
  }

  if (openOnClick) {
    reference.addEventListener('click', handleClick)

    // Close when clicking outside
    document.addEventListener('click', (event) => {
      if (isOpen && !reference.contains(event.target) && !floating.contains(event.target)) {
        close()
      }
    })
  }

  // Initialize state
  floating.style.display = 'none'
  floating.setAttribute('data-state', 'closed')

  // Return cleanup function
  return () => {
    if (openOnHover) {
      reference.removeEventListener('mouseenter', handleMouseEnter)
      reference.removeEventListener('mouseleave', handleMouseLeave)
      floating.removeEventListener('mouseenter', handleMouseEnter)
      floating.removeEventListener('mouseleave', handleMouseLeave)
    }

    if (openOnFocus) {
      reference.removeEventListener('focus', handleFocus)
      reference.removeEventListener('blur', handleBlur)
    }

    if (openOnClick) {
      reference.removeEventListener('click', handleClick)
    }

    clearTimeout(hoverTimeout)
    clearTimeout(closeTimeout)
  }
} 