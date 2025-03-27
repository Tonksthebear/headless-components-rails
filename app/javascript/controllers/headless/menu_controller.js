import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "items", "item"]
  static values = {
    open: Boolean,
    disabled: Boolean
  }

  connect() {
    this.closeOnClickOutside = this.closeOnClickOutside.bind(this)
    document.addEventListener("click", this.closeOnClickOutside)
  }

  disconnect() {
    document.removeEventListener("click", this.closeOnClickOutside)
  }

  toggle() {
    if (this.disabledValue) return
    this.openValue = !this.openValue
    this.updateMenuState()
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
      this.openValue = false
      this.updateMenuState()
    }
  }

  updateMenuState() {
    if (this.openValue) {
      this.itemsTarget.classList.remove("hidden")
      this.buttonTarget.setAttribute("aria-expanded", "true")
    } else {
      this.itemsTarget.classList.add("hidden")
      this.buttonTarget.setAttribute("aria-expanded", "false")
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