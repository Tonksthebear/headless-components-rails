import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"

export default class extends ApplicationController {
  static targets = ["backdrop", "panel", "button"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    openAtStart: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
  }

  constructor(context) {
    super(context)
    Object.assign(this, floatingControllerHelpers);
  }

  connect() {
    this.portalValue = this.portalValue || this.hasAnchor(this.panelTarget)
    if (this.openAtStartValue) {
      this.headlessTransitionOutlet.enter()
    } else {
      this.headlessTransitionOutlet.leave()
    }
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
  }

  popoverOpened() {
    this.dispatch("popoverOpened")
    this.element.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.buttonTarget.setAttribute("data-open", "")
    this.panelTarget.setAttribute("data-open", "")
    this.focusPanel()

  }

  popoverClosed() {
    this.dispatch("popoverClosed")
    this.element.removeAttribute("data-open")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.buttonTarget.removeAttribute("data-open")
    this.panelTarget.removeAttribute("data-open")
  }

  closeOnClickOutside(event) {
    if (this.element.hasAttribute("data-open")) {
      if (!this.panelTarget.contains(event.target)) {
        this.dispatch("leave")
      }
    }
  }

  closeOnEscape() {
    if (this.element.hasAttribute("data-open")) {
      this.dispatch("leave")
    }
  }

  focusPanel() {
    this.panelTarget.focus()
  }

  sendPortal() {
    this.portalValue && document.body.appendChild(this.panelTarget)
    this.setupFloating({ reference: this.buttonTarget, floating: this.panelTarget })
  }

  retrievePortal() {
    this.portalValue && this.element.appendChild(this.panelTarget)
    this.cleanupFloating()
  }
}