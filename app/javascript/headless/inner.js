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

// Constants (Copied from floating.js for self-containment)
const MINIMUM_ITEMS_VISIBLE = 4;

/**
 * Floating UI Middleware to handle "inner" positioning for selection mode.
 * Calculates the required vertical offset to ensure the selected item
 * (based on index) is visible within the scrollable floating element.
 *
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.listRef - The list element containing selectable items.
 * @param {number} options.index - The index of the selected/active item.
 * @param {number} [options.padding=0] - The padding around the floating element (used for overflow calculation).
 * @param {number} [options.minItemsVisible=4] - The minimum number of items that should ideally be visible.
 * @param {number} [options.referenceOverflowThreshold=0] - Threshold for reference overflow check (can use padding).
 * @returns {Object} - Floating UI Middleware object (or null if options are invalid).
 */
export const innerMiddleware = (options) => {
  const { listRef, index, padding = 0, minItemsVisible = MINIMUM_ITEMS_VISIBLE, referenceOverflowThreshold = 0 } = options ?? {};

  // Basic validation
  if (!listRef || typeof index !== 'number' || index < 0) {
    // console.warn('innerMiddleware: Invalid options provided.', options);
    return {
      name: 'inner',
      fn: () => ({ data: { offset: 0 } }), // Return 0 offset if invalid
    };
  }

  return {
    name: 'inner',
    options: options, // Pass options along
    async fn(state) {
      const { elements, middlewareData, rects } = state;
      const { floating } = elements;
      const selectedItem = listRef.children[index];

      // If floating element or selected item doesn't exist, or listRef has no children, bail out.
      if (!floating || !selectedItem || listRef.childElementCount === 0) {
        return { data: { offset: 0 } };
      }

      // --- Offset Calculation Logic (Adapted from React version's onFallbackChange) ---

      const scrollPaddingBottom = parseFloat(window.getComputedStyle(floating).scrollPaddingBottom) || 0;

      let elementHeight = 0; // Height of one item (assume uniform height for simplicity)
      let elementAmountVisible = 0; // How much of the *first non-fully-visible* item is visible
      let visibleItemsCount = 0;
      let firstItemHeight = 0;

      // Determine item height and count visible items
      for (let i = 0; i < listRef.childElementCount; i++) {
        const child = listRef.children[i];
        if (!(child instanceof HTMLElement)) continue; // Skip non-elements

        // Use first child's height as the standard element height
        if (i === 0) {
          firstItemHeight = child.offsetHeight;
        }
        elementHeight = firstItemHeight; // Assume uniform height after the first

        const childTop = child.offsetTop;
        // Include scroll padding in the effective bottom position
        const childBottom = childTop + child.offsetHeight + scrollPaddingBottom;

        const parentTop = floating.scrollTop;
        const parentBottom = parentTop + floating.clientHeight;

        // Check if the item is fully visible within the scrollport
        if (childTop >= parentTop && childBottom <= parentBottom) {
          visibleItemsCount++;
        } else if (elementAmountVisible === 0 && childTop < parentBottom && childBottom > parentTop) {
          // If this is the first partially visible item, calculate how much is visible.
          // This happens when an item is cut off at the top or bottom.
          elementAmountVisible = Math.max(0, Math.min(childBottom, parentBottom) - Math.max(childTop, parentTop));
        }
      }

      // If no items are visible and list isn't empty, use the first item's height
      if (visibleItemsCount === 0 && elementAmountVisible === 0 && elementHeight === 0 && listRef.childElementCount > 0) {
        const firstChild = listRef.children[0];
        if (firstChild instanceof HTMLElement) {
          elementHeight = firstChild.offsetHeight;
        }
      }

      // Calculate how many items are *missing* from the desired visible count
      // Ensure we don't need more items than exist total.
      const numItemsToTarget = Math.min(minItemsVisible, listRef.childElementCount);
      const missing = Math.max(0, numItemsToTarget - visibleItemsCount);

      let calculatedOffset = 0;
      if (missing >= 1 && elementHeight > 0) {
        // Calculate the offset needed to bring the missing items into view.
        // Start with the total height of the missing items.
        calculatedOffset = (elementHeight * missing)
          // Subtract the portion of the partially visible item that *is* showing.
          - elementAmountVisible
          // Add back the scroll padding to ensure space at the bottom.
          + scrollPaddingBottom;

        // Ensure offset doesn't become negative if calculations are weird
        calculatedOffset = Math.max(0, calculatedOffset);
      }

      // --- End Offset Calculation ---

      // Return the calculated offset in middleware data
      // This offset will be applied using transform: translateY() later
      return {
        data: {
          offset: calculatedOffset,
        }
      };
    },
  };
};

// Removed createInnerOffsetHandler as the offset is now handled via middleware data and CSS transform

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