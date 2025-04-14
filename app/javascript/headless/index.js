// Export all functionality
export * from './floating'
export * from './interactions'
export * from './inner'
export * from './portal_blessing'
export * from './string_helpers'
export * from './floating_controller_helpers'
export * from './scroll_lock'

/**
 * Creates a complete floating UI setup with positioning and interactions
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.reference - The reference element
 * @param {HTMLElement} options.floating - The floating element
 * @param {Object} options.config - Configuration for the floating element
 * @param {Object} [options.interactions] - Interaction configuration
 * @returns {Object} - Cleanup function
 */
export function createFloatingUI({
  reference,
  floating,
  config = {},
  interactions = {}
}) {
  if (!reference || !floating) return () => { }

  // Set up floating positioning
  const positioningCleanup = setupFloating({
    reference,
    floating,
    config
  })

  // Set up interactions if provided
  const interactionsCleanup = createInteractions({
    reference,
    floating,
    config: interactions
  })

  // Return combined cleanup function
  return () => {
    positioningCleanup()
    interactionsCleanup()
  }
}
