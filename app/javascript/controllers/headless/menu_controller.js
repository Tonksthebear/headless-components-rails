import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"

export default class extends ApplicationController {
  static targets = ["button", "items", "item", "example"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    openAtStart: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
    ...floatingControllerHelpers.values
  }

  constructor(context) {
    super(context)
    Object.assign(this, floatingControllerHelpers);
  }

  connect() {
    top.menuController = this
    this.portalValue = this.portalValue || this.hasAnchor()
    this.searchQuery = ""
    this.searchTimeout = null

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

  menuOpened() {
    this.dispatch("menuOpened")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.element.setAttribute("data-active", "")
    this.itemsTarget.setAttribute("data-open", "")
    this.itemsTarget.removeAttribute("data-closed", "")
    this.element.setAttribute("data-open", "")
  }

  menuClosed() {
    this.dispatch("menuClosed")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.element.removeAttribute("data-active")
    this.itemsTarget.removeAttribute("data-open")
    this.itemsTarget.setAttribute("data-closed", "")
    this.element.removeAttribute("data-open")
  }

  closeOnClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.dispatch("leave")
    }
  }

  sendPortal() {
    this.portalValue && document.body.appendChild(this.itemsTarget)
    this.setupFloating({ reference: this.buttonTarget, floating: this.itemsTarget })
  }

  retrievePortal() {
    this.portalValue && this.element.appendChild(this.itemsTarget)
    this.cleanupFloating()
  }

  focusMenu() {
    this.itemsTarget.focus()
  }

  focus(event) {
    event.currentTarget.focus()
    event.currentTarget.setAttribute("data-focus", "")
    event.currentTarget.setAttribute("data-active", "")
  }

  blur(event) {
    event.currentTarget.blur()
    event.currentTarget.removeAttribute("data-focus")
    event.currentTarget.removeAttribute("data-active")
  }

  focusNextItem() {
    const items = this.itemTargets
    const currentIndex = items.indexOf(document.activeElement)
    const nextIndex = (currentIndex + 1) % items.length
    items[nextIndex].focus()
  }

  focusPreviousItem() {
    const items = this.itemTargets
    const currentIndex = items.indexOf(document.activeElement)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    items[previousIndex].focus()
  }

  focusMatchedItem(event) {
    if (event.key.length !== 1 || !event.key.match(/[a-z0-9]/i)) return

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }

    this.searchQuery += event.key.toLowerCase()

    const items = this.itemTargets
    const currentItem = document.activeElement
    const currentIndex = items.includes(currentItem) ? items.indexOf(currentItem) : -1

    const searchOrder = currentIndex === -1
      ? items
      : [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex + 1)]

    const matchedItem = searchOrder.find(item =>
      item.textContent.trim().toLowerCase().startsWith(this.searchQuery)
    )

    if (matchedItem) {
      matchedItem.focus()
    }

    this.searchTimeout = setTimeout(() => {
      this.searchQuery = ""
      this.searchTimeout = null
    }, 350)
  }
}