import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "button"]
  static values = {
    enabled: { type: Boolean, default: true },
    targetId: { type: String, default: "headlessui-portal-root" },
    anchor: { type: Boolean, default: false },
    placement: { type: String, default: "bottom" } // bottom, top, left, right
  }

  connect() {
    if (!this.enabledValue) return

    this.createPortalRoot()
    this.moveContentToPortal()

    if (this.anchorValue && this.hasButtonTarget) {
      this.positionPortalRelativeToButton()
      this.setupResizeObserver()
    }
  }

  disconnect() {
    this.cleanupPortal()
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }

  createPortalRoot() {
    // Check if portal root already exists
    this.portalRoot = document.getElementById(this.targetIdValue)

    if (!this.portalRoot) {
      // Create portal root if it doesn't exist
      this.portalRoot = document.createElement("div")
      this.portalRoot.setAttribute("id", this.targetIdValue)
      document.body.appendChild(this.portalRoot)
    }
  }

  moveContentToPortal() {
    if (!this.portalRoot || !this.hasContentTarget) return

    // Create a container for the portal content
    this.portalContainer = document.createElement("div")
    this.portalContainer.setAttribute("data-headlessui-portal", "")

    // Move the content to the portal
    while (this.contentTarget.firstChild) {
      this.portalContainer.appendChild(this.contentTarget.firstChild)
    }

    // Add the portal container to the portal root
    this.portalRoot.appendChild(this.portalContainer)
  }

  positionPortalRelativeToButton() {
    if (!this.portalContainer || !this.hasButtonTarget) return

    const buttonRect = this.buttonTarget.getBoundingClientRect()
    const portalRect = this.portalContainer.getBoundingClientRect()

    // Default to bottom placement
    let top = buttonRect.bottom
    let left = buttonRect.left

    // Adjust position based on placement
    switch (this.placementValue) {
      case "top":
        top = buttonRect.top - portalRect.height
        break
      case "left":
        top = buttonRect.top
        left = buttonRect.left - portalRect.width
        break
      case "right":
        top = buttonRect.top
        left = buttonRect.right
        break
      // "bottom" is default
    }

    // Apply positioning
    this.portalContainer.style.position = "fixed"
    this.portalContainer.style.top = `${top}px`
    this.portalContainer.style.left = `${left}px`
    this.portalContainer.style.zIndex = "50" // Ensure it appears above other content
  }

  setupResizeObserver() {
    // Create a ResizeObserver to update the portal position when the button moves
    this.resizeObserver = new ResizeObserver(() => {
      this.positionPortalRelativeToButton()
    })

    // Observe the button for size/position changes
    this.resizeObserver.observe(this.buttonTarget)

    // Also observe the window for scroll events
    window.addEventListener("scroll", this.updatePosition.bind(this), { passive: true })
    window.addEventListener("resize", this.updatePosition.bind(this), { passive: true })
  }

  updatePosition() {
    if (this.anchorValue) {
      this.positionPortalRelativeToButton()
    }
  }

  cleanupPortal() {
    if (!this.portalContainer || !this.portalRoot) return

    // Remove event listeners
    window.removeEventListener("scroll", this.updatePosition.bind(this))
    window.removeEventListener("resize", this.updatePosition.bind(this))

    // Remove the portal container
    if (this.portalRoot.contains(this.portalContainer)) {
      this.portalRoot.removeChild(this.portalContainer)
    }

    // Remove the portal root if it's empty
    if (this.portalRoot.childNodes.length === 0) {
      this.portalRoot.parentElement?.removeChild(this.portalRoot)
    }
  }
}
