import PortalApplicationController from "controllers/headless/portal_application_controller"

export default class extends PortalApplicationController {
  static targets = ["items", "item"]
  static outlets = ["headless--menu--portal", "headless--floating"]

  select(event) {
    const item = event.currentTarget
    if (item.dataset.disabled === "true") return

    this.openValue = false
    this.updateMenuState()

    // Dispatch a custom event that can be listened to
    this.dispatch("select", { detail: { item } })
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

}


returnToParent() {
  this.headlessMenuOutlet.element.append(this.element)
}
}