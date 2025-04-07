/**
 * Creates an inner middleware for positioning elements relative to a selection
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.listRef - The list element containing selectable items
 * @param {number} options.index - The index of the selected item
 * @param {number} [options.padding=0] - The padding around the floating element
 * @param {number} [options.minItemsVisible=4] - The minimum number of items to show
 * @param {Function} [options.onOffsetChange] - Callback when the offset changes
 * @returns {Object} - Middleware object
 */
export function createInnerMiddleware({
  listRef,
  index,
  padding = 0,
  minItemsVisible = 4,
  onOffsetChange
}) {
  if (!listRef || index === undefined) {
    return null
  }

  return {
    name: 'inner',
    options: {
      listRef,
      index,
      padding,
      minItemsVisible,
      onOffsetChange
    },
    fn: ({ elements, middlewareData }) => {
      const { floating } = elements
      if (!floating) return {}

      // Get the selected item
      const selectedItem = listRef.children[index]
      if (!selectedItem) return {}

      // Calculate the position of the selected item
      const selectedRect = selectedItem.getBoundingClientRect()
      const floatingRect = floating.getBoundingClientRect()

      // Calculate the offset needed to show the selected item
      const scrollPaddingBottom = parseFloat(window.getComputedStyle(floating).scrollPaddingBottom) || 0

      // Calculate how many items are visible
      let visibleItems = 0
      let elementHeight = 0
      let elementAmountVisible = 0

      for (let i = 0; i < listRef.children.length; i++) {
        const child = listRef.children[i]
        const childTop = child.offsetTop
        const childBottom = childTop + child.clientHeight + scrollPaddingBottom

        const parentTop = floating.scrollTop
        const parentBottom = parentTop + floating.clientHeight

        if (childTop >= parentTop && childBottom <= parentBottom) {
          visibleItems++
        } else {
          elementAmountVisible = Math.max(
            0,
            Math.min(childBottom, parentBottom) - Math.max(childTop, parentTop)
          )
          elementHeight = child.clientHeight
          break
        }
      }

      // Calculate how many items we need to show
      const missing = Math.min(minItemsVisible, listRef.children.length) - visibleItems

      // If we need to show more items, calculate the offset
      let offset = 0
      if (missing >= 1) {
        offset = elementHeight * missing - elementAmountVisible + scrollPaddingBottom
      }

      // Notify about offset change
      if (onOffsetChange) {
        onOffsetChange(offset)
      }

      // Return middleware data
      return {
        ...middlewareData,
        inner: {
          offset,
          selectedItem,
          visibleItems,
          missing
        }
      }
    }
  }
}

/**
 * Creates a function to handle inner offset changes
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.floating - The floating element
 * @param {Function} options.onOffsetChange - Callback when the offset changes
 * @returns {Function} - Function to handle inner offset changes
 */
export function createInnerOffsetHandler({
  floating,
  onOffsetChange
}) {
  if (!floating) return () => { }

  return (offset) => {
    // Apply offset to the floating element
    floating.style.transform = `translateY(${offset}px)`

    // Notify about offset change
    if (onOffsetChange) {
      onOffsetChange(offset)
    }
  }
} 