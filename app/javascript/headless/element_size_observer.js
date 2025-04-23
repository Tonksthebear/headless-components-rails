/**
 * Element Size Observer
 * 
 * Tracks the size of HTML elements and provides a way to observe size changes.
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
 * Interface for the ElementSizeObserver callbacks
 * @typedef {Object} ElementSizeObserverCallbacks
 * @property {Function} elementResized - Callback function that receives the target element and its new size when resized
 */

/**
 * Class that observes size changes of target elements
 */
export default class ElementSizeObserver {
  /**
   * Creates a new ElementSizeObserver
   * @param {HTMLElement|HTMLElement[]} targets - The element(s) to observe for size changes
   * @param {ElementSizeObserverCallbacks} callbacks - Object containing callback functions
   * @param {Function} callbacks.elementResized - Function called when an element is resized
   */
  constructor(targets, callbacks) {
    this.targets = Array.isArray(targets) ? targets : [targets];
    this.callbacks = callbacks;
    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        const size = computeSize(element);
        this.callbacks.elementResized?.(element, size);
      });
    });
  }

  /**
   * Starts observing the target elements for size changes
   */
  start() {
    this.targets.forEach(target => {
      if (target) {
        // Initial size
        const size = computeSize(target);
        this.callbacks.elementResized?.(target, size);

        // Set up observer
        this.observer.observe(target);
      }
    });
  }

  /**
   * Stops observing all target elements
   */
  stop() {
    this.observer.disconnect();
  }

  /**
   * Adds a new element to observe
   * @param {HTMLElement} element - The element to add to observation
   */
  addElement(element) {
    if (element && !this.targets.includes(element)) {
      this.targets.push(element);
      const size = computeSize(element);
      this.callbacks.elementResized?.(element, size);
      this.observer.observe(element);
    }
  }

  /**
   * Removes an element from observation
   * @param {HTMLElement} element - The element to remove from observation
   */
  removeElement(element) {
    if (element) {
      this.observer.unobserve(element);
      this.targets = this.targets.filter(target => target !== element);
    }
  }
}

/**
 * Gets the current size of an element
 * @param {HTMLElement} element - The element to measure
 * @param {boolean} unit - Whether to return values with 'px' units
 * @returns {{width: number|string, height: number|string}} - The element's dimensions
 */
export function getElementSize(element, unit = false) {
  const size = computeSize(element);

  if (unit) {
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
    };
  }

  return size;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use ElementSizeObserver class instead
 */
export function observeElementSize(element, callback) {
  const observer = new ElementSizeObserver(element, {
    elementResized: (_, size) => callback(size)
  });
  observer.start();
  return {
    disconnect: () => observer.stop()
  };
}