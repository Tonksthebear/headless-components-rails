import ApplicationController from "controllers/headless/application_controller"

// Match React's transition states
const TransitionState = {
  None: 0,
  Closed: 1 << 0,
  Enter: 1 << 1,
  Leave: 1 << 2,
}

export default class extends ApplicationController {
  static targets = ['child']
  static values = {
    transitioned: Boolean,
    startAnimation: Boolean,
    mode: { type: String, default: 'sync' }, // 'sync', 'sequential', or 'independent'
    enabled: { type: Boolean, default: true },
    state: { type: Number, default: 0 }, // Store TransitionState in data attribute
    inFlight: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false }
  }

  connect() {
    this.cleanup = new Set()
    this.childTransitions = new Set()
    this.activeTransitions = new Map() // Use a Map: element -> { id, controller }
    this.startAnimationValue && this.enter()
  }

  disconnect() {
    this.cleanup.forEach(cleanup => cleanup())
    this.cleanup.clear()
  }

  toggle() {
    this.transitionedValue = !this.transitionedValue
    this.#transitionAll(this.transitionedValue ? 'enter' : 'leave')
  }

  enter() {
    if (this.transitionedValue === true) return
    this.transitionedValue = true
    this.#transitionAll('enter')
  }

  leave() {
    if (this.transitionedValue === false) return
    this.transitionedValue = false
    this.#transitionAll('leave')
  }

  // Handle all transitions (parent and children)
  async #transitionAll(direction) {
    if (!this.enabledValue) {
      this.transitionedValue = direction === 'enter'
      return
    }

    // If we're already transitioning, mark the current transition as cancelled
    if (this.inFlightValue) {
      this.cancelledValue = true
    }

    this.dispatch(`before${direction}`)

    switch (this.modeValue) {
      case 'sequential':
        await this.#transitionSequential(direction)
        break
      case 'independent':
        await this.#transitionIndependent(direction)
        break
      default: // 'sync'
        await this.#transitionSync(direction)
    }

    this.dispatch(`after${direction}`)
  }

  // All elements transition together
  async #transitionSync(direction) {
    // Start all transitions at once
    const transitions = [
      this.#transition(direction, this.element),
      ...this.childTargets.map(child =>
        this.#transition(direction, child)
      )
    ]
    await Promise.all(transitions)
  }

  // Parent transitions, then children in sequence
  async #transitionSequential(direction) {
    // Parent first
    await this.#transition(direction, this.element)

    // Then children in sequence
    for (const child of this.childTargets) {
      await this.#transition(direction, child)
    }
  }

  // Children transition independently of parent
  async #transitionIndependent(direction) {
    // Start parent transition
    const parentTransition = this.#transition(direction, this.element)

    // Start child transitions whenever they become visible
    const childTransitions = this.childTargets.map(async child => {
      // Optional: Wait for parent to start transitioning
      await this.#nextFrame()
      return this.#transition(direction, child)
    })

    // Wait for all transitions to complete
    await Promise.all([parentTransition, ...childTransitions])
  }

  // Enhanced transition preparation
  #prepareTransition(element, prepare, transitionId) {
    // Check if this element is already transitioning
    if (this.activeTransitions.has(element)) {
      // If already transitioning, just update the state/attributes for the *new*
      // transition direction. Don't explicitly abort the old one here.
      // The old transition promise will eventually resolve or be cleaned up.
      prepare()
      // Still need reflow etc. for the *new* transition, so proceed.
    }

    // Step 1: Ensure element is visible (remove !hidden if necessary)
    if (element.hasAttribute('data-hide-after-transition') && element.classList.contains('!hidden')) {
      element.classList.remove('!hidden')
    }
    element.offsetHeight

    // Store previous transition style
    const previous = element.style.transition

    // Force cancel current transition
    element.style.transition = 'none'

    // Step 2: Update flags and set initial data-attributes (e.g., data-enter, data-leave)
    prepare()

    // Step 3: Force ONE reflow to register visibility AND data-attributes/initial CSS
    element.offsetHeight

    // Step 4: Restore transition style to allow animation to run
    element.style.transition = previous
  }

  // Enhanced animation detection and handling
  #afterTransition(element, signal) {
    // If already aborted (by navigation) before even checking, resolve immediately.
    if (signal.aborted) return Promise.resolve();

    const animations = element.getAnimations?.() ?? [];
    if (animations.length === 0) return Promise.resolve();

    // Create a promise that resolves when the abort signal fires (e.g., navigation)
    const onAbort = new Promise(resolve => {
      // Check again in case it aborted right before adding the listener
      if (signal.aborted) {
        resolve();
      } else {
        // { once: true } ensures the listener cleans itself up
        signal.addEventListener('abort', resolve, { once: true });
      }
    });

    // Create a promise that resolves when all animations have settled
    // (finished naturally or cancelled by interruption/other means).
    // We use .then() to ensure this branch *always resolves* the outer promise,
    // swallowing any potential rejections from individual animation.finished promises.
    const animationsSettled = Promise.allSettled(
      animations.map(animation => animation.finished)
    ).then(() => { /* Always resolve void */ });

    // Return a promise that resolves when EITHER the abort signal fires
    // OR all animations have settled.
    return Promise.race([onAbort, animationsSettled]);
  }

  // Enhanced frame handling - Simplified to one frame
  #nextFrames() {
    return new Promise(resolve => {
      requestAnimationFrame(resolve)
    })
  }

  // Enhanced event dispatching
  dispatch(event, detail = {}) {
    this.element.dispatchEvent(
      new CustomEvent(`transition:${event}`, {
        bubbles: true,
        cancelable: true,
        detail
      })
    )
  }

  // Enhanced transition data update
  #updateTransitionData(element, direction, transitionId) {
    this.#prepareTransition(element, () => {
      // 1. Update state flags
      if (direction === 'enter') {
        this.#addFlag(TransitionState.Enter | TransitionState.Closed)
        this.#removeFlag(TransitionState.Leave)
      } else {
        this.#addFlag(TransitionState.Leave)
        this.#removeFlag(TransitionState.Enter)
      }

      // 2. Set initial data attributes based on direction
      element.setAttribute('data-transition', '')
      element.removeAttribute('data-enter')
      element.removeAttribute('data-leave')
      element.removeAttribute('data-closed')

      if (direction === 'enter') {
        // Enter starts from [data-leave][data-closed] state
        element.setAttribute('data-leave', '')
        element.setAttribute('data-closed', '')
      } else if (direction === 'leave') {
        // Leave starts from [data-leave] state
        element.setAttribute('data-leave', '')
      }
    }, transitionId)
  }

  // Core transition logic for a single element
  async #transition(direction, element) {
    const abortController = new AbortController()
    const transitionId = Symbol()

    // Handle Turbo navigation interruption ONLY
    const cleanup = () => {
      document.removeEventListener('turbo:before-render', handleAbort)
      // Only abort for navigation, not animation interruptions
      abortController.abort('navigation')
    }

    const handleAbort = () => {
      cleanup()
    }

    document.addEventListener('turbo:before-render', handleAbort, { once: true })
    this.cleanup.add(cleanup)

    try {
      // Remove any previous entry for this element before adding the new one
      // This handles the case where a new transition starts before the previous finished cleanup
      this.activeTransitions.delete(element)
      // Track this transition
      this.activeTransitions.set(element, { id: transitionId, controller: abortController })

      const transitionPromise = (async () => {
        // 1. Prepare the transition: Set initial state (flags, attributes)
        this.#updateTransitionData(element, direction, transitionId)
        // Do NOT check abortController.signal here, prepare doesn't abort anymore

        // 2. Wait for the next frame - crucial delay
        await this.#nextFrames()
        // Check if aborted by NAVIGATIION before proceeding
        if (abortController.signal.aborted) return

        // 3. Trigger the transition by applying the target state attribute changes
        // Reverted the cancelled check here
        if (direction === 'enter') {
          element.removeAttribute('data-leave')
          element.removeAttribute('data-closed')
          element.setAttribute('data-enter', '')
        } else if (direction === 'leave') {
          element.setAttribute('data-closed', '')
        }

        // 4. Mark this transition as active
        // No longer adding to activeTransitions here, moved to start of try block
        this.inFlightValue = true

        // 5. Wait for the animation to complete
        await this.#afterTransition(element, abortController.signal)
        // Check if aborted by NAVIGATIION during animation
        if (abortController.signal.aborted) return

        // 6. Cleanup after successful animation
        // Attributes are cleaned up here
        element.removeAttribute('data-enter')
        element.removeAttribute('data-leave')
        element.removeAttribute('data-transition')
        element.removeAttribute('data-closed')
        element.dataset.transitioned = (direction === 'enter').toString()

        // Handle hide after transition
        if (direction === 'leave' && element.hasAttribute('data-hide-after-transition')) {
          element.classList.add('!hidden')
        }
      })()

      this.childTransitions.add(transitionPromise)
      await transitionPromise
      this.childTransitions.delete(transitionPromise)

      // ---- SUCCESSFUL COMPLETION CLEANUP ----
      // If we reach here, the transition completed without being aborted by navigation

      // Cleanup state flags
      this.#removeFlag(TransitionState.Enter | TransitionState.Leave | TransitionState.Closed)

      // Remove from active map IF it's still this transition's ID (prevent race condition)
      const currentActive = this.activeTransitions.get(element)
      if (currentActive && currentActive.id === transitionId) {
        this.activeTransitions.delete(element)
      }

      // Only set inFlight to false if no other transitions are active
      if (this.activeTransitions.size === 0) {
        this.inFlightValue = false
      }

      // Dispatch finished event
      this.dispatch(`${direction}:finished`)

    } catch (error) {
      // Only catch AbortError specifically from navigation
      if (error.name === 'AbortError' && abortController.signal.reason === 'navigation') {
        console.log(`Transition aborted by navigation for element:`, element)
        // Perform full cleanup for navigation abort
        element.removeAttribute('data-enter')
        element.removeAttribute('data-leave')
        element.removeAttribute('data-transition')
        element.removeAttribute('data-closed')
      } else {
        // Rethrow other errors (including potential unexpected AbortErrors)
        console.error("Transition failed:", error) // Log other errors
        throw error
      }
    } finally {
      // Final cleanup check: Remove from map if still present and matches ID
      const currentActive = this.activeTransitions.get(element)
      if (currentActive && currentActive.id === transitionId) {
        this.activeTransitions.delete(element)
      }
      // Ensure inFlightValue is reset if this was the last transition
      if (this.activeTransitions.size === 0) {
        this.inFlightValue = false
      }
      this.cleanup.delete(cleanup) // Remove Turbo listener
    }
  }

  // State flag management
  #addFlag(flag) {
    this.stateValue |= flag
  }

  #removeFlag(flag) {
    this.stateValue &= ~flag
  }

  #nextFrame() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })
  }
}
