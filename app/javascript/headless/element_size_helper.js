/**
 * Element Size Helper
 * 
 * Tracks the size of an HTML element and provides a way to observe size changes.
 * Similar to the React useElementSize hook but for vanilla JavaScript.
 */

/**
 * Computes the size of an element
 * @param {HTMLElement|null} element - The element to measure
 * @returns {{width: number, height: number}} - The element's dimensions
 */
function computeSize(element) {
  if (element === null) return { width: 0, height: 0 };
  const { width, height } = element.getBoundingClientRect();
  return { width, height };
}

/**
 * Creates an element size observer
 * @param {HTMLElement} element - The element to observe
 * @param {Function} callback - Function to call when size changes
 * @returns {Object} - Object with disconnect method to stop observing
 */
export function observeElementSize(element, callback) {
  if (!element) return { disconnect: () => { } };

  // Initial size
  let size = computeSize(element);
  callback(size);

  // Set up observer
  const observer = new ResizeObserver(() => {
    const newSize = computeSize(element);
    callback(newSize);
  });

  observer.observe(element);

  return {
    disconnect: () => observer.disconnect()
  };
}

/**
 * Gets the current size of an element
 * @param {HTMLElement} element - The element to measure
 * @param {boolean} unit - Whether to return values with 'px' units
 * @returns {{width: number|string, height: number|string}} - The element's dimensions
 */
function getElementSize(element, unit = false) {
  const size = computeSize(element);

  if (unit) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    };
  }

  return size;
}