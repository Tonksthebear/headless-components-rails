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
    return (this.anchorToValue + this.anchorGapValue + this.anchorOffsetValue + this.anchorPaddingValue) !== ''
  },

  anchorConfig(element) {
    return {
      placement: this.stringOrNull(element.dataset.anchorTo),
      gap: this.stringOrNull(element.dataset.anchorGap),
      offset: this.stringOrNull(element.dataset.anchorOffset),
      padding: this.stringOrNull(element.dataset.anchorPadding),
    }
  }
}