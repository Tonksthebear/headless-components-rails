import { setupFloating } from "headless/floating"

export const floatingControllerHelpers = {
  setupFloating({ reference, floating, config = {} }) {
    this.cleanupNewFloating = setupFloating({
      reference,
      floating,
      config: {
        ...this.anchorConfig(floating),
        ...config
      }
    })
  },

  cleanupFloating() {
    if (this.cleanupNewFloating) {
      this.cleanupNewFloating()
    }
  },

  hasAnchor(element) {
    return (element.getAttribute("anchor") + element.getAttribute("anchor-to") + element.getAttribute("anchor-gap") + element.getAttribute("anchor-offset") + element.getAttribute("anchor-padding")) != ''
  },

  anchorConfig(element) {
    return {
      placement: this.stringOrNull(element.dataset.anchorTo || element.getAttribute("anchor")),
      gap: this.stringOrNull(element.dataset.anchorGap),
      offset: this.stringOrNull(element.dataset.anchorOffset),
      padding: this.stringOrNull(element.dataset.anchorPadding),
    }
  }
}