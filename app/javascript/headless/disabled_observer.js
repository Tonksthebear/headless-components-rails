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
    this.started = false
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
    if (!this.started) {
      this.observer.observe(this.target, { attributes: true, attributeFilter: ["disabled"], subtree: true })
      this.started = true
    }
  }

  /**
   * Stops observing the target element
   */
  stop() {
    if (this.started) {
      this.observer.disconnect()
      this.started = false
    }
  }

  /**
   * Pauses the observer and calls the callback when the observer is resumed
   * @param {Function} callback - The callback to call when the observer is resumed
   */
  pause(callback) {
    if (this.started) {
      this.observer.disconnect()
      this.started = false
    }

    callback()

    if (!this.started) {
      this.observer.observe(this.target, { attributes: true, attributeFilter: ["disabled"], subtree: true })
      this.started = true
    }
  }
}

