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
    this.activeTransitions = new Set()
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
    this.transitionedValue = true
    this.#transitionAll('enter')
  }

  leave() {
    this.transitionedValue = false
    this.#transitionAll('leave')
  }

  // Handle all transitions (parent and children)
  async #transitionAll(direction) {
    if (!this.enabledValue) {
      // If disabled, just update state without transitions
      this.transitionedValue = direction === 'enter'
      return
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

  // Update transition data attributes to match React implementation
  #updateTransitionData(element, direction) {
    const previous = element.style.transition
    element.style.transition = 'none'
    element.setAttribute('data-transition', '')
    element.offsetHeight
    element.style.transition = previous

    // element.removeAttribute('data-transition')
    element.removeAttribute('data-enter')
    element.removeAttribute('data-leave')
    element.removeAttribute('data-closed')

    if (direction === 'enter') {
      element.setAttribute('data-enter', '')
    } else if (direction === 'leave') {
      element.setAttribute('data-leave', '')
      element.offsetHeight
      element.setAttribute('data-closed', '')
    }
  }

  // Core transition logic for a single element
  async #transition(direction, element) {
    const abortController = new AbortController()
    const transitionId = Symbol()

    // Handle Turbo navigation interruption
    const cleanup = () => {
      document.removeEventListener('turbo:before-render', handleAbort)
      abortController.abort()
    }

    const handleAbort = () => {
      cleanup()
    }

    document.addEventListener('turbo:before-render', handleAbort, { once: true })
    this.cleanup.add(cleanup)

    try {
      // Track this transition
      const transitionPromise = (async () => {
        // Track this specific transition
        this.activeTransitions.add(transitionId)
        this.inFlightValue = true

        // Update state flags
        if (direction === 'enter') {
          this.#addFlag(TransitionState.Enter | TransitionState.Closed)
          this.#removeFlag(TransitionState.Leave)
        } else {
          this.#addFlag(TransitionState.Leave)
          this.#removeFlag(TransitionState.Enter)
        }

        // Update transition data attributes
        this.#updateTransitionData(element, direction)

        await this.#nextFrame()
        if (abortController.signal.aborted) return

        // Wait for the transition to complete
        await this.#afterTransition(element, abortController.signal)
        if (abortController.signal.aborted) return

        // Remove transition attribute after animation completes
        element.removeAttribute('data-transition')
        element.dataset.transitioned = (direction === 'enter').toString()
      })()

      this.childTransitions.add(transitionPromise)
      await transitionPromise
      this.childTransitions.delete(transitionPromise)

      // Cleanup state flags
      this.#removeFlag(TransitionState.Enter | TransitionState.Leave | TransitionState.Closed)
      this.activeTransitions.delete(transitionId)

      // Only set inFlight to false if no other transitions are active
      if (this.activeTransitions.size === 0) {
        this.inFlightValue = false
      }

      element.dispatchEvent(new Event(`${direction}:finished`))

    } catch (error) {
      if (error.name === 'AbortError') {
        // Clean up data attributes on abort
        element.removeAttribute('data-enter')
        element.removeAttribute('data-leave')
        element.removeAttribute('data-transition')
        element.removeAttribute('data-closed')
      }
      throw error
    } finally {
      this.cleanup.delete(cleanup)
    }
  }

  // State flag management
  #addFlag(flag) {
    this.stateValue |= flag
  }

  #removeFlag(flag) {
    this.stateValue &= ~flag
  }

  #hasFlag(flag) {
    return (this.stateValue & flag) === flag
  }

  #nextFrame() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })
  }

  #afterTransition(element, signal) {
    const animations = element.getAnimations()
    if (animations.length === 0) return Promise.resolve()

    return Promise.race([
      Promise.all(animations.map(animation => animation.finished)),
      new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Transition aborted', 'AbortError'))
        )
      })
    ])
  }
}
