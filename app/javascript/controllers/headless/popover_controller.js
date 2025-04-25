import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"
import { getAllFocusableElements } from "headless/focus_locking_helpers"
import { lockScroll, unlockScroll } from "headless/scroll_lock"

export default class extends ApplicationController {
  static targets = ["backdrop", "panel", "button"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    openAtStart: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
    focus: { type: Boolean, default: false },
    modal: { type: Boolean, default: false },
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

  disconnect() {
    if (this.modalValue) unlockScroll()
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
    this.hasBackdropTarget && this.backdropTarget.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.buttonTarget.setAttribute("data-open", "")
    this.panelTarget.setAttribute("data-open", "")
    if (this.focusValue) this.focusPanel()
    if (this.modalValue) lockScroll()
  }

  popoverClosed() {
    this.dispatch("popoverClosed")
    this.element.removeAttribute("data-open")
    this.hasBackdropTarget && this.backdropTarget.removeAttribute("data-open")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.buttonTarget.removeAttribute("data-open")
    this.panelTarget.removeAttribute("data-open")
    if (this.modalValue) unlockScroll()
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

  focusNext() {
    const focusableElements = getAllFocusableElements(this.panelTarget)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    // TODO: This is with focus lock
    // const nextIndex = (currentIndex + 1) % focusableElements.length
    const nextIndex = currentIndex + 1
    if (nextIndex < focusableElements.length) {
      focusableElements[nextIndex].focus()
    } else if (this.modalValue) {
      focusableElements[0].focus()
    } else {
      if (this.focusValue) this.headlessTransitionOutlet.leave()
      const documentFocusableElements = getAllFocusableElements(document.body, [this.panelTarget])
      const nextIndex = documentFocusableElements.indexOf(this.buttonTarget) + 1
      if (nextIndex < documentFocusableElements.length) {
        documentFocusableElements[nextIndex].focus()
      } else {
        documentFocusableElements[0].focus()
      }
    }
    this.dispatch("focusChanged")
  }

  focusPrevious() {
    const focusableElements = getAllFocusableElements(this.panelTarget)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    const previousIndex = currentIndex - 1
    if (previousIndex >= 0) {
      focusableElements[previousIndex].focus()
    } else if (this.modalValue) {
      focusableElements[focusableElements.length - 1].focus()
    } else {
      if (this.focusValue) this.headlessTransitionOutlet.leave()
      const documentFocusableElements = getAllFocusableElements(document.body, [this.panelTarget])
      const previousIndex = documentFocusableElements.indexOf(this.buttonTarget) - 1
      if (previousIndex >= 0) {
        documentFocusableElements[previousIndex].focus()
      } else {
        documentFocusableElements[documentFocusableElements.length - 1].focus()
      }
    }
    this.dispatch("focusChanged")
  }
}