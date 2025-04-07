import ApplicationController from "controllers/headless/application_controller"
import { createFloating, setupFloating } from "headless/floating"
import { createInteractions } from "headless/interactions"
import { createInnerMiddleware } from "headless/inner"

export default class extends ApplicationController {
  static targets = ["button", "items", "item", "example"]
  static outlets = ["headless--floating", "headless--portal"]
  static values = {
    open: Boolean,
    disabled: Boolean,
    placement: { type: String, default: "bottom" },
    align: { type: String, default: "start" },
    gap: { type: Number, default: 8 },
    padding: { type: Number, default: 16 },
    innerEnabled: { type: Boolean, default: false },
    innerIndex: { type: Number, default: 0 },
    innerPadding: { type: Number, default: 16 },
    innerMinItemsVisible: { type: Number, default: 1 }
  }

  connect() {
    top.menuController = this
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
  }

  headlessFloatingOutletConnected() {
    console.log("headlessFloatingOutletConnected")
    // this.setupFloating()
  }

  setupFloating() {
    // Configure floating controller
    this.headlessFloatingOutlet.placementValue = this.placementValue
    this.headlessFloatingOutlet.alignValue = this.alignValue
    this.headlessFloatingOutlet.gapValue = this.gapValue
    this.headlessFloatingOutlet.paddingValue = this.paddingValue
    this.headlessFloatingOutlet.openValue = this.openValue
    this.headlessFloatingOutlet.disabledValue = this.disabledValue
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
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.element.removeAttribute("data-active")

    // Update floating controller if available
    if (this.hasHeadlessFloatingOutlet) {
      this.headlessFloatingOutlet.openValue = false
    }

    // this.headlessMenuPortalOutlet.menuClosed()
  }

  closeOnClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.dispatch("leave")
    }
  }

  sendPortal() {
    document.body.appendChild(this.itemsTarget)
    setupFloating({ reference: this.buttonTarget, floating: this.itemsTarget })
    // this.#setupFloating()
  }

  retrievePortal() {
    this.element.appendChild(this.itemsTarget)
    this.floatingCleanup()
  }

  #setupFloating() {
    let inner = null
    if (this.innerEnabledValue) {
      inner = createInnerMiddleware({
        listRef: this.floatingTarget,
        index: this.innerIndexValue,
        minItemsVisible: this.innerMinItemsVisibleValue,
        onOffsetChange: (offset) => {
          this.dispatch("innerOffsetChange", { detail: { offset } })
        }
      })
    }

    // Set up floating positioning
    this.floatingCleanup = createFloating({
      reference: this.buttonTarget,
      floating: this.itemsTarget,
      placement: {
        to: this.placementValue,
        align: this.alignValue
      },
      enabled: true,
      inner
    })
  }

  menuClosed() {
    this.dispatch("menuClosed")
    this.itemsTarget.removeAttribute("data-open")
    this.itemsTarget.setAttribute("data-closed", "")
    this.element.removeAttribute("data-open")

    // Update floating controller if available
    if (this.hasHeadlessFloatingOutlet) {
      this.headlessFloatingOutlet.openValue = false
    }
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
}