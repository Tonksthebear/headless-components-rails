import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"
import { observeElementSize } from "headless/element_size_helper"
// import {
//   debounce,

export default class extends ApplicationController {
  static targets = ["input", "button", "options", "option", "hiddenInput", "templateOption"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    value: { type: Array, default: [] },
    defaultValue: String,
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    open: { type: Boolean, default: false },
    nullable: { type: Boolean, default: true },
    immediate: { type: Boolean, default: false },
    virtual: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
  }

  constructor(context) {
    super(context)
    Object.assign(this, floatingControllerHelpers);
  }

  initialize() {
    this.optionsByValue = new Map()
  }

  connect() {
    this.portalValue = this.portalValue || this.hasAnchor(this.optionsTarget)
    this.inputSizeObserver = observeElementSize(this.inputTarget, this.#inputSizeChanged.bind(this))
    this.buttonSizeObserver = observeElementSize(this.buttonTarget, this.#buttonSizeChanged.bind(this))
    this.activeOption = null
    this.newlySelectedOption = null
    this.newlyDeselectedOption = null
    this.unmatchedOptions = []
    this.query = ""
    if (this.hasTemplateOptionTarget) {
      this.templateOption = this.templateOptionTarget.content.firstElementChild
    }

    if (this.openValue) {
      this.headlessTransitionOutlet.enter()
    } else {
      this.headlessTransitionOutlet.leave()
    }
  }

  disconnect() {
    this.valuesMap.clear()
    this.inputSizeObserver.disconnect()
    this.buttonSizeObserver.disconnect()
    this.activeOption = null
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
  }

  comboboxOpened() {
    this.dispatch("open")
    this.element.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.buttonTarget.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("data-active", "")
  }

  comboboxClosed() {
    this.dispatch("close")
    this.element.removeAttribute("data-open")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.buttonTarget.removeAttribute("data-open")
    this.buttonTarget.removeAttribute("data-active")
  }

  sendPortal() {
    this.portalValue && document.body.appendChild(this.optionsTarget)
    this.setupFloating({ reference: this.buttonTarget.parentElement, floating: this.optionsTarget })
  }

  retrievePortal() {
    this.portalValue && this.element.appendChild(this.optionsTarget)
    this.cleanupFloating()
  }

  selectActiveOption() {
    if (!this.activeOption) return
    this.selectOption({ currentTarget: this.activeOption })
  }

  async selectOption({ currentTarget }) {
    if (this.multipleValue && currentTarget.dataset.newValue) this.createdOption = null
    this.#addValue(currentTarget)
  }

  updateQuery() {
    this.query = this.inputTarget.value
    this.#updateCreateOption()
    this.filterOptions()
  }

  async filterOptions() {
    var hasOneVisible = false
    var exactMatch = false
    this.unmatchedOptions = []
    this.optionTargets.forEach(option => {
      if (option.dataset.displayValue.toLowerCase() === this.query.toLowerCase() && option != this.createdOption) {
        exactMatch = true
      }
      option.hidden = !option.dataset.displayValue.toLowerCase().includes(this.query.toLowerCase())
      if (option.hidden) {
        this.unmatchedOptions.push(option)
        option.setAttribute("aria-hidden", "true")
        option.classList.add("!hidden")
      } else {
        hasOneVisible = true
        option.setAttribute("aria-hidden", "false")
        option.classList.remove("!hidden")
      }
    })
    if (exactMatch || this.query == "") {
      this.#hideCreateOption()
    } else {
      this.#presentCreateOption()
    }
    if (hasOneVisible) {
      if (!this.element.dataset.open) await this.headlessTransitionOutlet.enter()
      this.optionsTarget.classList.remove("!hidden")
      this.#setActiveOption(this.optionTargets[this.#nextActiveIndex(0)])
    } else {
      this.optionsTarget.classList.add("!hidden")
    }
  }

  inputFocused() {
    if (this.immediateValue) this.headlessTransitionOutlet.enter()
  }

  focusNextOption() {
    var currentIndex = this.optionTargets.indexOf(this.activeOption) + 1

    if (!this.element.hasAttribute("data-open")) {
      this.headlessTransitionOutlet.enter()
      if (this.activeOption) currentIndex = this.optionTargets.indexOf(this.activeOption)
    }

    this.#setActiveOption(this.optionTargets[this.#nextActiveIndex(currentIndex)])
  }

  focusPreviousOption() {
    var currentIndex = this.optionTargets.indexOf(this.activeOption) - 1

    if (!this.element.hasAttribute("data-open")) {
      this.headlessTransitionOutlet.enter()
      if (this.activeOption) currentIndex = this.optionTargets.indexOf(this.activeOption)
    }

    this.#setActiveOption(this.optionTargets[this.#previousActiveIndex(currentIndex)])
  }

  async clearInput() {
    this.inputTarget.value = this.activeOption.dataset.displayValue
    if (!this.multipleValue) await this.headlessTransitionOutlet.leave()
    this.unmatchedOptions.forEach(option => {
      option.hidden = false
      option.setAttribute("aria-hidden", "false")
      option.classList.remove("!hidden")
    })
    if (!this.#previouslySelected(this.createdOption)) this.#hideCreateOption()
  }

  focusOption({ currentTarget }) {
    this.#setActiveOption(currentTarget)
  }

  unfocusOption() {
    this.#unfocusActiveOption()
  }

  #presentCreateOption() {
    if (this.createdOption) return
    this.createdOption = this.templateOption.cloneNode(true)
    this.createdOption.dataset.newValue = true
    this.optionsTarget.prepend(this.createdOption)
    this.#updateCreateOption()
  }

  #updateCreateOption() {
    if (!this.createdOption) return
    this.createdOption.dataset.value = this.query
    this.createdOption.dataset.displayValue = this.query
    this.createdOption.innerHTML = this.templateOption.innerHTML.replace("{query}", this.query)
  }

  #hideCreateOption() {
    if (!this.createdOption) return
    this.createdOption.classList.add("!hidden")
  }

  #inputSizeChanged(newSize) {
    this.optionsTarget.style.setProperty("--input-width", `${newSize.width}px`)
  }

  #buttonSizeChanged(newSize) {
    this.optionsTarget.style.setProperty("--button-width", `${newSize.width}px`)
  }

  #addValue(option) {
    if (this.multipleValue) {
      this.#addToOptionsByValue(option)
    } else {
      if (!this.#previouslySelected(option)) this.#clearOptionsByValue()
      this.#addToOptionsByValue(option)
    }
    this.#updateOptions()
  }

  #removeValue(option) {
    this.#removeFromOptionsByValue(option)
    this.#updateOptions()
  }

  #syncInputValue() {
    if (this.optionsByValue.size === 0) return
    if (this.multipleValue) {
      this.hiddenInputTarget.value = Array.from(this.optionsByValue.keys()).join(", ")
      this.inputTarget.value = this.optionsByValue.values().map(opt => opt.dataset.displayValue).join(", ")
    } else {
      this.hiddenInputTarget.value = this.optionsByValue.keys().next().value
      this.inputTarget.value = this.optionsByValue.values().next().value.dataset.displayValue
    }
  }

  async #addToOptionsByValue(option) {
    this.optionsByValue.set(option.dataset.value, option)
    this.newlySelectedOption = option
    this.#syncInputValue()
    if (!this.multipleValue) this.query = ""
  }

  async #removeFromOptionsByValue(option) {
    this.optionsByValue.delete(option.dataset.value)
    this.newlyDeselectedOption = option
    this.#syncInputValue()
  }

  async #updateOptions() {
    if (!this.multipleValue) await this.headlessTransitionOutlet.leave()
    this.clearInput()
    if (this.newlySelectedOption != this.createdOption) this.#hideCreateOption()
    if (this.newlySelectedOption) {
      this.newlySelectedOption.setAttribute("aria-selected", "true")
      this.newlySelectedOption.setAttribute("data-selected", "")
    }
    if (this.newlyDeselectedOption) {
      this.newlyDeselectedOption.setAttribute("aria-selected", "false")
      this.newlyDeselectedOption.removeAttribute("data-selected")
    }
  }

  #clearOptionsByValue() {
    this.optionsByValue.forEach(this.#removeFromOptionsByValue.bind(this))
  }

  #nextActiveIndex(index) {
    if (index < this.optionTargets.length) {
      if (!this.optionTargets[index].disabled && !this.optionTargets[index].classList.contains("!hidden")) {
        return index
      } else {
        return this.#nextActiveIndex(index + 1)
      }
    } else {
      return this.#nextActiveIndex(0)
    }
  }

  #previouslySelected(option) {
    if (!option) return false
    return this.optionsByValue.has(option.dataset.value)
  }

  #previousActiveIndex(index) {
    if (index >= 0) {
      if (!this.optionTargets[index].disabled && !this.optionTargets[index].classList.contains("!hidden")) {
        return index
      } else {
        return this.#previousActiveIndex(index - 1)
      }
    } else {
      return this.#previousActiveIndex(this.optionTargets.length - 1)
    }
  }

  #setActiveOption(option) {
    if (this.activeOption) this.#unfocusActiveOption()
    option.setAttribute("data-focus", "")
    option.setAttribute("data-active", "")
    this.activeOption = option
  }

  #unfocusActiveOption() {
    if (!this.activeOption) return
    this.activeOption.removeAttribute("data-focus")
    this.activeOption.removeAttribute("data-active")
    this.activeOption = null
  }
}