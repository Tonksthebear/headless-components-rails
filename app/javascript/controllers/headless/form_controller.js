import ApplicationController from "controllers/headless/application_controller"
import DisabledObserver from "headless/disabled_observer"

export default class extends ApplicationController {
  static targets = ["fieldset", "legend", "field", "input", "label", "description"]

  connect() {
    this.disabledObserver = new DisabledObserver(this.element, {
      elementDisabled: this.#elementDisabled.bind(this),
      elementEnabled: this.#elementEnabled.bind(this)
    })
    this.disabledObserver.start()
  }

  disconnect() {
    this.disabledObserver.stop()
  }

  legendTargetConnected(target) {
    this.fieldsetTarget.setAttribute("aria-labelledby", target.id)
  }

  legendTargetDisconnected(target) {
    this.fieldsetTarget.removeAttribute("aria-labelledby")
  }

  labelTargetConnected(target) {
    const field = this.#containerField(target)
    const input = field.querySelector("[data-headless--form-target='input']")
    if (input) {
      input.setAttribute("aria-labelledby", target.id)
    }
  }

  labelTargetDisconnected(target) {
    const field = this.#containerField(target)
    const input = field.querySelector("[data-headless--form-target='input']")
    if (input) {
      input.removeAttribute("aria-labelledby")
    }
  }

  inputTargetConnected(target) {
    const field = this.#containerField(target)
    const label = field.querySelector("[data-headless--form-target='label']")
    if (label) {
      label.setAttribute("for", target.id)
    }
  }

  inputTargetDisconnected(target) {
    const field = this.#containerField(target)
    const label = field.querySelector("[data-headless--form-target='label']")
    if (label) {
      label.removeAttribute("for")
    }
  }

  descriptionTargetConnected(target) {
    const field = this.#containerField(target)
    const input = field.querySelector("[data-headless--form-target='input']")
    this.#updateInputDescribedBy(input)
    this.#updateFieldsetDescribedBy()
  }

  descriptionTargetDisconnected(target) {
    const field = this.#containerField(target)
    const input = field.querySelector("[data-headless--form-target='input']")
    this.#updateInputDescribedBy(input)
    this.#updateFieldsetDescribedBy()
  }

  #updateFieldsetDescribedBy() {
    if (!this.fieldsetTarget) return
    const describedBy = this.descriptionTargets.map((target) => target.id).join(" ")
    this.fieldsetTarget.setAttribute("aria-describedby", describedBy)
  }

  #updateInputDescribedBy(input) {
    const field = this.#containerField(input)
    const descriptions = [...field.querySelectorAll("[data-headless--form-target='description']")]
    if (descriptions.length > 0) {
      input.setAttribute("aria-describedby", descriptions.map((description) => description.id).join(" "))
    } else {
      input.removeAttribute("aria-describedby")
    }
  }

  #containerField(target) {
    return target.closest("[data-headless--form-target='field']")
  }

  #elementDisabled(element) {
    var elementsToDisable = []
    if (element == this.element) {
      elementsToDisable = [element, ...this.inputTargets, ...this.fieldTargets]
    } else if (this.fieldTargets.includes(element)) {
      elementsToDisable = [element, element.querySelector("[data-headless--form-target='input']")]
    } else if (this.inputTargets.includes(element)) {
      elementsToDisable = [element]
    }

    this.disabledObserver.pause(() => {
      console.log("pausing", elementsToDisable)
      elementsToDisable.forEach((element) => {
        element.setAttribute("disabled", "disabled")
        element.setAttribute("data-disabled", "")
      })
    })
  }

  #elementEnabled(element) {
    var elementsToEnable = []
    if (element == this.element) {
      elementsToEnable = [element, ...this.inputTargets, ...this.fieldTargets]
    } else if (this.fieldTargets.includes(element)) {
      elementsToEnable = [element, element.querySelector("[data-headless--form-target='input']")]
    } else if (this.inputTargets.includes(element)) {
      elementsToEnable = [element]
    }

    this.disabledObserver.pause(() => {
      elementsToEnable.forEach((element) => {
        element.removeAttribute("disabled")
        element.removeAttribute("data-disabled")
      })
    })
  }
}
