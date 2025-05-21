import ApplicationController from "controllers/headless/application_controller"
import { lockScroll, unlockScroll } from "headless/scroll_lock"
import { getAllFocusableElements } from "headless/focus_locking_helpers"

export default class extends ApplicationController {
  static targets = ["dialog", "backdrop", "panel", "title"]
  static outlets = ["headless--portal", "headless--transition"]

  static values = {
    autofocus: { type: Boolean, default: false },
    startOpen: { type: Boolean, default: false }
  }

  connect() {
    window.headlessActiveDialogStack ||= []
  }

  disconnect() {
    this.retrievePortal()
    this.#removeFromStack()
    unlockScroll()
  }

  open() {
    this.sendPortal()
    this.opened()
    this.headlessTransitionOutlet.enter()
  }

  async close() {
    await this.headlessTransitionOutlet.leave()
    this.retrievePortal()
    this.closed()
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this).then(() => {
      if (this.startOpenValue) {
        this.startOpenValue = false
        this.open()
      }
    })
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
    this.autofocusValue && this.headlessPortalOutlet.element.focus()
    this.#addToStack()
    lockScroll()
  }

  closed() {
    this.element.removeAttribute("data-open")
    this.dialogTarget.removeAttribute("data-open")
    this.hasBackdropTarget && this.backdropTarget.removeAttribute("data-open")
    this.panelTarget.removeAttribute("data-open")
    this.hasTitleTarget && this.titleTarget.removeAttribute("data-open")
    this.#removeFromStack()
    unlockScroll()
  }

  sendPortal() {
    document.body.appendChild(this.dialogTarget)
  }

  retrievePortal() {
    this.element.appendChild(this.dialogTarget)
  }

  documentClicked({ target }) {
    if (this.#currentDialog()) {
      if (target != this.panelTarget && !this.panelTarget.contains(target)) {
        this.close()
      }
    } else {
      const dialogTarget = target.closest("[data-dialog]")
      if (dialogTarget && dialogTarget.dataset.dialog == this.element.id) {
        this.open()
      }
    }
  }

  focusNext() {
    if (!this.#currentDialog()) return
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
    if (!this.#currentDialog()) return
    const focusableElements = getAllFocusableElements(this.dialogTarget)
    const currentIndex = focusableElements.indexOf(document.activeElement)
    const previousIndex = (currentIndex - 1)
    if (previousIndex >= 0) {
      focusableElements[previousIndex].focus()
    } else {
      focusableElements[focusableElements.length - 1].focus()
    }
  }

  #addToStack() {
    window.headlessActiveDialogStack.push(this)
  }

  #removeFromStack() {
    window.headlessActiveDialogStack = window.headlessActiveDialogStack.filter(dialog => dialog != this)
  }

  #currentDialog() {
    return window.headlessActiveDialogStack[window.headlessActiveDialogStack.length - 1] == this
  }
}