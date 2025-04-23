import ApplicationController from "controllers/headless/application_controller"

export default class extends ApplicationController {
  static targets = ["tabList", "tab", "panels", "panel"]
  static values = {
    selectedIndex: { type: Number, default: 0 },
    manual: { type: Boolean, default: false }
  }

  selectedIndexValueChanged(index, previousIndex) {
    this.#deactivateIndex(previousIndex)
    this.#activateIndex(index)
  }

  selectPreviousTab() {
    if (this.manualValue) {
      var currentFocusedIndex = this.tabTargets.findIndex(tab => tab.hasAttribute("data-focus"))
      if (currentFocusedIndex === -1) {
        currentFocusedIndex = this.selectedIndexValue
      }
      const nextIndex = this.#previousActiveIndex(currentFocusedIndex - 1)
      this.tabTargets[nextIndex].focus()
    } else {
      this.selectedIndexValue = this.#previousActiveIndex(this.selectedIndexValue - 1)
      this.tabTargets[this.selectedIndexValue].focus()
    }
  }

  selectNextTab() {
    if (this.manualValue) {
      var currentFocusedIndex = this.tabTargets.findIndex(tab => tab.hasAttribute("data-focus"))
      if (currentFocusedIndex === -1) {
        currentFocusedIndex = this.selectedIndexValue
      }
      const nextIndex = this.#nextActiveIndex(currentFocusedIndex + 1)
      this.tabTargets[nextIndex].focus()
    } else {
      this.selectedIndexValue = this.#nextActiveIndex(this.selectedIndexValue + 1)
      this.tabTargets[this.selectedIndexValue].focus()
    }
  }

  selectFirstTab() {
    const nextIndex = this.#nextActiveIndex(0)
    if (this.manualValue) {
      this.tabTargets[nextIndex].focus()
    } else {
      this.selectedIndexValue = nextIndex
      this.tabTargets[this.selectedIndexValue].focus()
    }
  }

  selectLastTab() {
    const nextIndex = this.#previousActiveIndex(this.tabTargets.length - 1)
    if (this.manualValue) {
      this.tabTargets[nextIndex].focus()
    } else {
      this.selectedIndexValue = nextIndex
      this.tabTargets[this.selectedIndexValue].focus()
    }
  }

  selectTab({ currentTarget }) {
    this.selectedIndexValue = this.tabTargets.indexOf(currentTarget)
  }

  #activateIndex(index) {
    this.element.setAttribute("aria-selected-index", index)
    this.tabListTarget.setAttribute("aria-selected-index", index)
    this.panelsTarget.setAttribute("aria-selected-index", index)
    this.tabTargets[index].setAttribute("aria-selected", "true")
    this.tabTargets[index].setAttribute("data-selected", "")
    this.tabTargets[index].setAttribute("tabindex", "0")
    this.panelTargets[index].setAttribute("aria-selected", "true")
    this.panelTargets[index].setAttribute("data-selected", "")
    this.panelTargets[index].setAttribute("tabindex", "0")
    this.panelTargets[index].classList.remove("!hidden")
  }

  #deactivateIndex(index) {
    this.tabTargets[index].setAttribute("aria-selected", "false")
    this.tabTargets[index].removeAttribute("data-selected")
    this.tabTargets[index].setAttribute("tabindex", "-1")
    this.panelTargets[index].setAttribute("aria-selected", "false")
    this.panelTargets[index].removeAttribute("data-selected")
    this.panelTargets[index].setAttribute("tabindex", "-1")
    this.panelTargets[index].classList.add("!hidden")
  }

  #nextActiveIndex(index) {
    if (index < this.tabTargets.length) {
      if (!this.tabTargets[index].disabled) {
        return index
      } else {
        return this.#nextActiveIndex(index + 1)
      }
    } else {
      return this.#nextActiveIndex(0)
    }

  }

  #previousActiveIndex(index) {
    if (index >= 0) {
      if (!this.tabTargets[index].disabled) {
        return index
      } else {
        return this.#previousActiveIndex(index - 1)
      }
    } else {
      return this.#previousActiveIndex(this.tabTargets.length - 1)
    }
  }
}
