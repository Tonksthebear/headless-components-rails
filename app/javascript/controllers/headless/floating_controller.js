import { Controller } from "@hotwired/stimulus"
import { createFloating } from "headless/floating"
import { createInteractions } from "headless/interactions"
import { createInnerMiddleware } from "headless/inner"

export default class extends Controller {
  static targets = ["reference", "floating"]
  static values = {
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    placement: { type: String, default: "bottom" },
    align: { type: String, default: "center" },
    gap: { type: Number, default: 0 },
    offset: { type: Number, default: 0 },
    padding: { type: Number, default: 0 },
    openOnHover: { type: Boolean, default: false },
    openOnFocus: { type: Boolean, default: false },
    openOnClick: { type: Boolean, default: false },
    hoverDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 0 },
    innerEnabled: { type: Boolean, default: false },
    innerIndex: { type: Number, default: 0 },
    innerPadding: { type: Number, default: 0 },
    minItemsVisible: { type: Number, default: 4 }
  }

  connect() {
    if (!this.hasReferenceTarget || !this.hasFloatingTarget) return

    // Set up floating positioning
    this.setupFloating()

    // Set up interactions if needed
    if (this.openOnHoverValue || this.openOnFocusValue || this.openOnClickValue) {
      this.setupInteractions()
    }

    // Initialize state
    this.updateFloatingState()
  }

  disconnect() {
    // Clean up floating and interactions
    if (this.floatingCleanup) {
      this.floatingCleanup()
    }
    if (this.interactionsCleanup) {
      this.interactionsCleanup()
    }
  }

  setupFloating() {
    // Create inner middleware if enabled
    let inner = null
    if (this.innerEnabledValue) {
      inner = createInnerMiddleware({
        listRef: this.floatingTarget,
        index: this.innerIndexValue,
        padding: this.innerPaddingValue,
        minItemsVisible: this.minItemsVisibleValue,
        onOffsetChange: (offset) => {
          this.dispatch("innerOffsetChange", { detail: { offset } })
        }
      })
    }

    // Set up floating positioning
    this.floatingCleanup = createFloating({
      reference: this.referenceTarget,
      floating: this.floatingTarget,
      placement: {
        to: this.placementValue,
        align: this.alignValue
      },
      gap: this.gapValue,
      offset: this.offsetValue,
      padding: this.paddingValue,
      enabled: true,
      inner
    })
  }

  setupInteractions() {
    this.interactionsCleanup = createInteractions({
      reference: this.referenceTarget,
      floating: this.floatingTarget,
      config: {
        openOnHover: this.openOnHoverValue,
        openOnFocus: this.openOnFocusValue,
        openOnClick: this.openOnClickValue,
        hoverDelay: this.hoverDelayValue,
        closeDelay: this.closeDelayValue
      },
      onOpen: () => {
        this.openValue = true
        this.updateFloatingState()
        this.dispatch("open")
      },
      onClose: () => {
        this.openValue = false
        this.updateFloatingState()
        this.dispatch("close")
      }
    })
  }

  updateFloatingState() {
    if (this.openValue) {
      this.floatingTarget.setAttribute("data-open", "")
      this.floatingTarget.removeAttribute("data-closed", "")
      this.referenceTarget.setAttribute("aria-expanded", "true")
    } else {
      this.floatingTarget.removeAttribute("data-open")
      this.floatingTarget.setAttribute("data-closed", "")
      this.referenceTarget.setAttribute("aria-expanded", "false")
    }
  }

  openValueChanged() {
    this.updateFloatingState()
  }

  // Public methods
  open() {
    if (this.disabledValue) return
    this.openValue = true
    this.updateFloatingState()
    this.dispatch("open")
  }

  close() {
    this.openValue = false
    this.updateFloatingState()
    this.dispatch("close")
  }

  toggle() {
    if (this.openValue) {
      this.close()
    } else {
      this.open()
    }
  }

  // Event handlers
  closeOnClickOutside(event) {
    if (!this.element.contains(event.target) && this.openValue) {
      this.close()
    }
  }

  // Keyboard navigation
  keydown(event) {
    if (this.disabledValue) return

    switch (event.key) {
      case "Escape":
        event.preventDefault()
        this.close()
        break
      case "Enter":
      case " ":
        event.preventDefault()
        this.toggle()
        break
    }
  }
}