/**
 * Interface for the DisabledObserver callbacks
 * @typedef {Object} DisabledObserverCallbacks
 * @property {Function} elementDisabled - Callback function that receives the target element when it becomes disabled
 * @property {Function} elementEnabled - Callback function that receives the target element when it becomes enabled
 */

/**
 * Class that observes changes to the disabled attribute on a target element
 */
export default class DisabledObserver {
  /**
   * Creates a new DisabledObserver
   * @param {HTMLElement} target - The element to observe for disabled attribute changes
   * @param {DisabledObserverCallbacks} callbacks - Object containing callback functions
   * @param {Function} callbacks.elementDisabled - Function called when the element becomes disabled
   * @param {Function} callbacks.elementEnabled - Function called when the element becomes enabled
   */
  constructor(target, callbacks) {
    this.target = target
    this.callbacks = callbacks
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
          const target = mutation.target
          if (target.hasAttribute("disabled")) {
            this.callbacks.elementDisabled?.(target)
          } else {
            this.callbacks.elementEnabled?.(target)
          }
        }
      })
    })
  }

  /**
   * Starts observing the target element for disabled attribute changes
   */
  start() {
    this.observer.observe(this.target, { attributes: true, attributeFilter: ["disabled"], subtree: true })
  }

  /**
   * Stops observing the target element
   */
  stop() {
    this.observer.disconnect()
  }
}

