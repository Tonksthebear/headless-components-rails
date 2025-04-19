/**
 * Enum representing the different focus strategies.
 * Based on Headless UI's Focus enum.
 */
export const Focus = {
  /** Focus the first non-disabled item. */
  First: 0,
  /** Focus the previous non-disabled item. */
  Previous: 1,
  /** Focus the next non-disabled item. */
  Next: 2,
  /** Focus the last non-disabled item. */
  Last: 3,
  /** Focus a specific item based on its index. */
  Specific: 4,
  /** Focus the item based on a search query. */
  Search: 5,
  /** Focus no item. */
  Nothing: 6,
}

/**
 * Calculates the next active index based on the current index and focus strategy.
 * Adapted from Headless UI's calculateActiveIndex utility.
 *
 * @template T The type of items in the list.
 * @param {object | ((items: T[]) => T)} R Information about the items or a resolver function.
 * @param {{ resolveItems: () => T[], resolveActiveIndex: () => number | null, resolveId?: (item: T) => string, resolveDisabled?: (item: T) => boolean }} S Resolvers for item properties.
 * @returns {number | null} The calculated next active index, or null if none found.
 */
export function calculateActiveIndex(action, resolvers) {
  let items = resolvers.resolveItems()
  if (items.length <= 0) return null

  let currentActiveIndex = resolvers.resolveActiveIndex()
  let activeIndex = currentActiveIndex ?? -1

  let nextActiveIndex = (() => {
    switch (action.focus) {
      case Focus.First:
        for (let i = 0; i < items.length; i++) {
          if (!resolvers.resolveDisabled?.(items[i])) return i
        }
        return activeIndex

      case Focus.Previous:
        for (let i = activeIndex - 1; i >= 0; i--) {
          if (!resolvers.resolveDisabled?.(items[i])) return i
        }
        return activeIndex

      case Focus.Next:
        for (let i = activeIndex + 1; i < items.length; i++) {
          if (!resolvers.resolveDisabled?.(items[i])) return i
        }
        return activeIndex

      case Focus.Last:
        for (let i = items.length - 1; i >= 0; i--) {
          if (!resolvers.resolveDisabled?.(items[i])) return i
        }
        return activeIndex

      case Focus.Specific:
        // Ensure the specific index is not disabled
        if (!resolvers.resolveDisabled?.(items[action.idx])) {
          return action.idx
        }
        return activeIndex // Don't change if specific is disabled

      case Focus.Search:
        // Requires resolveId or direct string comparison
        if (!resolvers.resolveId && typeof items[0] !== 'string') {
          console.warn('Search focus requires string items or resolveId resolver.')
          return activeIndex
        }
        let searchQuery = action.query.toLowerCase()
        for (let i = 0; i < items.length; i++) {
          let itemText = (resolvers.resolveId ? resolvers.resolveId(items[i]) : items[i]).toLowerCase()
          if (itemText.startsWith(searchQuery) && !resolvers.resolveDisabled?.(items[i])) {
            return i
          }
        }
        return activeIndex

      case Focus.Nothing:
        return null

      default:
        throw new Error('Invalid focus strategy')
    }
  })()

  // Wrap around if necessary (only for Previous/Next)
  if ((action.focus === Focus.Next || action.focus === Focus.Previous) && nextActiveIndex === activeIndex) {
    const enabledItems = items.filter(item => !resolvers.resolveDisabled?.(item))
    if (enabledItems.length === 0) return null // No enabled items to wrap to

    if (action.focus === Focus.Next) {
      // Find the index of the first enabled item in the original list
      return items.findIndex(item => !resolvers.resolveDisabled?.(item))
    } else { // Focus.Previous
      // Find the index of the last enabled item in the original list
      for (let i = items.length - 1; i >= 0; i--) {
        if (!resolvers.resolveDisabled?.(items[i])) return i
      }
    }
  }


  return nextActiveIndex === -1 ? null : nextActiveIndex
} 