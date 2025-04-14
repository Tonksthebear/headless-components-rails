import ApplicationController from "controllers/headless/application_controller"
import { lockScroll, unlockScroll } from "headless/scroll_lock"
import { getAllFocusableElements } from "headless/focus_locking_helpers"

export default class extends ApplicationController {
  static targets = ["dialog", "backdrop", "panel", "title"]
  static outlets = ["headless--portal"]

  static values = {
    autoFocus: { type: Boolean, default: false }
  }

  connect() {
  }

  disconnect() {
    this.retrievePortal()
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
  }

  opened() {
    this.element.setAttribute("data-open", "")
    this.dialogTarget.setAttribute("data-open", "")
    this.hasBackdropTarget && this.backdropTarget.setAttribute("data-open", "")
    this.panelTarget.setAttribute("data-open", "")
    this.hasTitleTarget && this.titleTarget.setAttribute("data-open", "")
    this.autofocusValue && this.panelTarget.focus()
    lockScroll()
  }

  closed() {
    this.element.removeAttribute("data-open")
    this.dialogTarget.removeAttribute("data-open")
    this.hasBackdropTarget && this.backdropTarget.removeAttribute("data-open")
    this.panelTarget.removeAttribute("data-open")
    this.hasTitleTarget && this.titleTarget.removeAttribute("data-open")
    unlockScroll()
  }

  sendPortal() {
    document.body.appendChild(this.dialogTarget)
  }

  retrievePortal() {
    this.element.appendChild(this.dialogTarget)
  }

  documentClicked({ target }) {
    if (this.element.hasAttribute("data-open")) {
      if (target != this.panelTarget && !this.panelTarget.contains(target)) {
        this.dispatch("leave")
      }
    } else {
      if (target.matches(`[data-modal="${this.element.id}"]`)) {
        this.dispatch("enter")
      }
    }
  }

  focusNext() {
    if (!this.element.hasAttribute("data-open")) return
    const focusableElements = getAllFocusableElements(this.dialogTarget)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    const nextIndex = (currentIndex + 1)
    if (nextIndex < focusableElements.length) {
      focusableElements[nextIndex].focus()
    } else {
      focusableElements[0].focus()
    }
  }

  focusPrevious() {
    if (!this.element.hasAttribute("data-open")) return
    const focusableElements = getAllFocusableElements(this.dialogTarget)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    const previousIndex = (currentIndex - 1)
    if (previousIndex >= 0) {
      focusableElements[previousIndex].focus()
    } else {
      focusableElements[focusableElements.length - 1].focus()
    }
  }
}