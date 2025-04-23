import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static outlets = ["headless--popover"]

  connect() {
    this.checkOpenStatus()
  }

  checkFocus() {
    const activeElement = document.activeElement
    if (this.element.contains(activeElement) || this.headlessPopoverOutlets.some(this.#popoverContainsActiveElement)) {
      return
    }

    this.#closeAllPopovers()
  }

  checkOpenStatus() {
    if (this.#hasOpenPopover()) {
      this.element.setAttribute("data-open", "")
    } else {
      this.element.removeAttribute("data-open")
    }
  }

  #popoverContainsActiveElement(popover) {
    return popover.headlessPortalOutlet.element.contains(document.activeElement)
  }

  #closeAllPopovers() {
    this.headlessPopoverOutlets.forEach(popover => {
      popover.headlessTransitionOutlet.leave()
    })
  }

  #hasOpenPopover() {
    return this.headlessPopoverOutlets.some(popover => popover.element.hasAttribute("data-open"))
  }
}