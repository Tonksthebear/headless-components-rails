import ApplicationController from "controllers/headless/application_controller"
import { enterTransition, leaveTransition, toggleTransition } from "headless/el-transition"

export default class extends ApplicationController {
  static targets = ['listener']
  static values = {
    transitioned: Boolean,
    startAnimation: Boolean
  }

  connect() {
    this.startAnimationValue && this.enter()
  }

  toggle() {
    this.transitionedValue = !this.transitionedValue
    this.#transition(this.transitionedValue ? 'enter' : 'leave')
  }

  enter() {
    this.transitionedValue = true
    this.#transition('enter')
  }

  leave() {
    this.transitionedValue = false
    this.#transition('leave')
  }

  #transition(direction) {
    // this.listenerTargets.forEach((listener) => {
    //   eval(`${direction}Transition(listener)`)
    //     .then(() => this.element.dispatchEvent(new Event(`transition:${direction}`)))
    // })

    this.transitionedValue ? this.dispatch("enter") : this.dispatch("leave")
  }
}
