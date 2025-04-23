import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static targets = ["radio"]

  radioClicked({ currentTarget }) {
    this.#inputFor(currentTarget).checked = true
    this.#updateRadios()
  }

  selectNextRadio() {
    const currentIndex = this.radioTargets.findIndex(radio => radio.hasAttribute("data-checked"))
    if (currentIndex === -1) {
      this.radioTargets[0].click()
    } else {
      (this.radioTargets[currentIndex + 1] || this.radioTargets[0]).click()
    }
  }

  selectPreviousRadio() {
    const currentIndex = this.radioTargets.findIndex(radio => radio.hasAttribute("data-checked"))
    if (currentIndex === -1) {
      this.radioTargets[this.radioTargets.length - 1].click()
    } else {
      (this.radioTargets[currentIndex - 1] || this.radioTargets[this.radioTargets.length - 1]).click()
    }
  }

  #updateRadios() {
    this.radioTargets.forEach(radio => {
      const input = this.#inputFor(radio)
      if (input.checked) {
        this.#radioChecked(radio)
      } else {
        this.#radioUnchecked(radio)
      }
    })
  }

  #radioChecked(element) {
    const input = this.#inputFor(element)
    this.element.value = input.value
    element.setAttribute("data-checked", "")
    element.tabIndex = 0
    element.focus()
  }

  #radioUnchecked(element) {
    element.removeAttribute("data-checked")
    element.tabIndex = -1
  }

  #inputFor(element) {
    return element.querySelector("input[type='radio']")
  }
}