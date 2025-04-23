import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"
import DisabledObserver from "headless/disabled_observer"

export default class extends ApplicationController {
  static targets = ["button", "items", "item", "example"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    openAtStart: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
    activeIndex: { type: Number, default: -1 }
  }

  constructor(context) {
    super(context)
    Object.assign(this, floatingControllerHelpers);
  }

  connect() {
    this.portalValue = this.portalValue || this.hasAnchor(this.itemsTarget)
    this.searchQuery = ""
    this.searchTimeout = null
    this.disabledObserver = new DisabledObserver(this.element, {
      elementDisabled: this.#elementDisabled,
      elementEnabled: this.#elementEnabled
    })
    this.disabledObserver.start()

    if (this.openAtStartValue) {
      this.headlessTransitionOutlet.enter()
    } else {
      this.headlessTransitionOutlet.leave()
    }
  }

  disconnect() {
    this.disabledObserver.stop()
  }

  activeIndexValueChanged(index, previousIndex) {
    if (previousIndex >= 0) {
      this.unfocusItem(this.itemTargets[previousIndex])
    }
    if (index >= 0) {
      this.focusItem(this.itemTargets[index])
    }
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
    this.portaledDisabledObserver = new DisabledObserver(controller.element, {
      elementDisabled: this.#elementDisabled,
      elementEnabled: this.#elementEnabled
    })
    this.portaledDisabledObserver.start()
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
    this.portaledDisabledObserver.stop()
  }

  menuOpened() {
    this.dispatch("menuOpened")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.buttonTarget.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("data-active", "")
    this.element.setAttribute("data-active", "")
    this.itemsTarget.setAttribute("data-open", "")
    this.itemsTarget.removeAttribute("data-closed", "")
    this.element.setAttribute("data-open", "")
    this.focusMenu()
  }

  menuClosed() {
    this.dispatch("menuClosed")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.buttonTarget.removeAttribute("data-open")
    this.buttonTarget.removeAttribute("data-active")
    this.element.removeAttribute("data-active")
    this.itemsTarget.removeAttribute("data-open")
    this.itemsTarget.setAttribute("data-closed", "")
    this.element.removeAttribute("data-open")
    this.itemTargets.forEach(item => {
      this.unfocusItem(item)
    })
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
    this.activeIndexValue = -1
    this.itemsTarget.focus()
  }

  unfocusItem(item) {
    item.removeAttribute("data-focus")
    item.removeAttribute("data-active")
  }

  focusItem(item) {
    item.setAttribute("data-focus", "")
    item.setAttribute("data-active", "")
  }

  focus({ currentTarget }) {
    this.activeIndexValue = this.itemTargets.indexOf(currentTarget)
    this.focusItem(currentTarget)
  }

  blur(event) {
    event.currentTarget.blur()
    event.currentTarget.removeAttribute("data-focus")
    event.currentTarget.removeAttribute("data-active")
  }

  focusNextItem() {
    const nextIndex = this.activeIndexValue + 1
    if (nextIndex < this.itemTargets.length) {
      this.activeIndexValue = nextIndex
    }
  }

  focusPreviousItem() {
    const previousIndex = this.activeIndexValue - 1
    if (previousIndex >= 0) {
      this.activeIndexValue = previousIndex
    } else if (previousIndex == -2) {
      this.activeIndexValue = this.itemTargets.length - 1
    }
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
      this.activeIndexValue = this.itemTargets.indexOf(matchedItem)
    }

    this.searchTimeout = setTimeout(() => {
      this.searchQuery = ""
      this.searchTimeout = null
    }, 350)
  }

  selectItem() {
    this.itemTargets[this.activeIndexValue].click()
  }

  #elementDisabled(target) {
    target.setAttribute("data-disabled", "")
  }

  #elementEnabled(target) {
    target.removeAttribute("data-disabled")
  }
}