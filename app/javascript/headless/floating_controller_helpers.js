import { setupFloating } from "headless/floating"

export const floatingControllerHelpers = {
  // Extra values to append to static values
  values: {
    anchorTo: String,
    anchorGap: String,
    anchorOffset: String,
    anchorPadding: String,
  },

  setupFloating({ reference, floating, config = {} }) {
    const valueConfig = {
      placement: this.hasAnchorToValue ? this.anchorToValue : 'bottom center',
      offset: this.hasAnchorOffsetValue ? this.anchorOffsetValue : undefined,
      padding: this.hasAnchorPaddingValue ? this.anchorPaddingValue : undefined,
    }

    this.cleanupNewFloating = setupFloating({
      reference,
      floating,
      config: {
        ...valueConfig,
        ...config
      }
    })
  },

  cleanupFloating() {
    if (this.cleanupNewFloating) {
      this.cleanupNewFloating()
    }
  },

  hasAnchor() {
    return (this.anchorToValue + this.anchorGapValue + this.anchorOffsetValue + this.anchorPaddingValue) !== ''
  }
}