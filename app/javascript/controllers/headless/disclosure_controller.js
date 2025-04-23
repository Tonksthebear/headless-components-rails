import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static targets = ["button", "panel"]

  connect() {
    this.buttonTarget.setAttribute("aria-controls", this.panelTarget.id)
  }

  opened() {
    this.element.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("data-open", "")
    this.panelTarget.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("aria-expanded", true)
  }

  closed() {
    this.element.removeAttribute("data-open")
    this.buttonTarget.removeAttribute("data-open")
    this.panelTarget.removeAttribute("data-open")
    this.buttonTarget.setAttribute("aria-expanded", false)
  }
}