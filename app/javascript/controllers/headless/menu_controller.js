import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static targets = ["button", "items", "item"]
  static values = {
    open: Boolean,
    disabled: Boolean
  }

  menuOpened() {
    this.itemsTarget.setAttribute("data-open", "")
    this.itemsTarget.removeAttribute("data-closed", "")
    this.element.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.element.setAttribute("data-active", "")
    this.element.focus()
  }

  menuClosed() {
    this.itemsTarget.removeAttribute("data-open")
    this.itemsTarget.setAttribute("data-closed", "")
    this.element.removeAttribute("data-open")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.element.removeAttribute("data-active")
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

  select(event) {
    const item = event.currentTarget
    if (item.dataset.disabled === "true") return

    this.openValue = false
    this.updateMenuState()

    // Dispatch a custom event that can be listened to
    this.dispatch("select", { detail: { item } })
  }

  closeOnClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.dispatch("leave")
    }
  }

  // Keyboard navigation
  keydown(event) {
    if (this.disabledValue) return

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        this.focusNextItem()
        break
      case "ArrowUp":
        event.preventDefault()
        this.focusPreviousItem()
        break
      case "Escape":
        event.preventDefault()
        this.openValue = false
        this.updateMenuState()
        break
      case "Enter":
      case " ":
        event.preventDefault()
        const focusedItem = this.element.querySelector("[data-headless--menu-target='item']:focus")
        if (focusedItem) {
          this.select({ currentTarget: focusedItem })
        }
        break
    }
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