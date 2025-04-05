import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static targets = ["button", "items", "item"]
  static outlets = ["headless--menu--portal"]
  static values = {
    open: Boolean,
    disabled: Boolean
  }

  menuOpened() {
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.element.setAttribute("data-active", "")
    this.#sendPortal()
  }

  menuClosed() {
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.element.removeAttribute("data-active")
    this.headlessMenuPortalOutlet.menuClosed()
  }

  closeOnClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.dispatch("leave")
    }
  }

  #sendPortal() {
    document.body.appendChild(this.headlessMenuPortalOutlet.element)
    this.headlessMenuPortalOutlet.menuOpened()
  }

  #retrievePortal() {
    this.headlessMenuPortalOutlet.menuClosed()
  }
} 