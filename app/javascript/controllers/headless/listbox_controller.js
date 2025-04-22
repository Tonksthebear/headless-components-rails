import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    openAtStart: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
    activeIndex: { type: Number, default: -1 }
  }

  connect() {
    this.portalValue = this.portalValue || this.hasAnchor(this.itemsTarget)
  }
}
