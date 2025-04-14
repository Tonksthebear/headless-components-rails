import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static targets = ["describedElement", "description"]
  static values = { describedby: String } // To store the joined IDs

  connect() {
    this.descriptionIds = new Set()
    this.#updateDescribedby()
  }

  descriptionTargetConnected(target) {
    this.#addId(target.id)
    this.#updateDescribedby()
  }

  descriptionTargetDisconnected(target) {
    this.#removeId(target.id)
    this.#updateDescribedby()
  }

  describedElementTargetConnected(target) {
    this.#updateDescribedby()
  }

  #addId(id) {
    if (id) {
      this.descriptionIds.add(id)
    }
  }

  #removeId(id) {
    if (id) {
      this.descriptionIds.delete(id)
    }
  }

  #updateDescribedby() {
    const ids = Array.from(this.descriptionIds).join(' ')
    this.describedbyValue = ids // Update value for potential persistence/state checking

    if (this.hasDescribedElementTarget) {
      if (ids.length > 0) {
        this.describedElementTarget.setAttribute('aria-describedby', ids)
      } else {
        this.describedElementTarget.removeAttribute('aria-describedby')
      }
    } else {
      console.warn("DescriptionGroup controller needs a 'describedElement' target to set aria-describedby.")
    }
  }
}