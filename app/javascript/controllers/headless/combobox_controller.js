import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"
import { observeElementSize } from "headless/element_size_helper"
import { ComboboxState } from "headless/combobox_state"

export default class extends ApplicationController {
  static targets = ["input", "button", "options", "option", "hiddenInput", "templateOption", "filterScript"]
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
    selectedIndex: { type: Number, default: -1 },
  }

  constructor(context) {
    super(context)
    Object.assign(this, floatingControllerHelpers);
  }

  initialize() {
    this.optionsByValue = new Map()
  }

  connect() {
    this.state = new ComboboxState(this)
    this.portalValue = this.portalValue || this.hasAnchor(this.optionsTarget)
    this.inputSizeObserver = observeElementSize(this.inputTarget, this.#inputSizeChanged.bind(this))
    this.buttonSizeObserver = observeElementSize(this.buttonTarget, this.#buttonSizeChanged.bind(this))
    this.activeOption = null
    this.newlySelectedOption = null
    this.newlyDeselectedOption = null
    this.unmatchedOptions = []
    this.query = ""
    this.options = this.optionTargets

    this.#updateOptions()
    if (this.hasTemplateOptionTarget) {
      this.templateOption = this.templateOptionTarget.content.firstElementChild
      this.#presentCreateOption()
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
    this.#updateOptions()
    // this.optionTargets.forEach(this.filter.bind(this))
    // if (this.exactMatch || this.query == "") {
    //   this.#hideCreateOption()
    // } else {
    //   this.#presentCreateOption()
    // }
    // if (this.matchedOptions.length != 0) {
    //   if (!this.element.dataset.open) await this.headlessTransitionOutlet.enter()
    //   this.optionsTarget.classList.remove("!hidden")
    //   this.#setActiveOption(this.optionTargets[this.#nextActiveIndex(0)])
    // } else {
    //   this.optionsTarget.classList.add("!hidden")
    // }
  }

  inputFocused() {
    if (this.immediateValue) this.headlessTransitionOutlet.enter()
  }

  selectedIndexValueChanged(newIndex, oldIndex) {
    const direction = newIndex > oldIndex ? 1 : -1

    if (oldIndex == undefined) return
    var option = null
    const indexAdjustment = this.#createdOptionVisible() ? -1 : 0
    if (this.#createdOptionVisible() && newIndex == 0) {
      option = this.createdOption
    } else {
      option = this.options[this.displayOrder[newIndex + indexAdjustment]]
    }

    if (option?.disabled) {
      if (direction == 1) {
        this.selectedIndexValue = newIndex++
      } else {
        this.selectedIndexValue = newIndex--
      }
    } else if (!option) {
      if (direction == 1) {
        this.selectedIndexValue = 0
      } else {
        this.selectedIndexValue = this.displayOrder.length - 1 - indexAdjustment
      }
    } else {
      this.#setActiveOption(option)
    }
  }

  focusNextOption() {
    if (!this.element.hasAttribute("data-open")) {
      this.headlessTransitionOutlet.enter()
      if (this.activeOption) this.selectedIndexValue = this.#indexOfActiveOption()
    } else {
      this.selectedIndexValue = this.selectedIndexValue + 1
    }
  }

  focusPreviousOption() {
    if (!this.element.hasAttribute("data-open")) {
      this.headlessTransitionOutlet.enter()
      if (this.activeOption) this.selectedIndexValue = this.#indexOfActiveOption()
    } else {
      this.selectedIndexValue = this.selectedIndexValue - 1
    }
  }

  #indexOfActiveOption() {
    return this.displayOrder.indexOf(this.options.indexOf(this.activeOption))
  }

  async clearInput() {
    this.inputTarget.value = this.activeOption.dataset.displayValue
    if (!this.multipleValue) await this.headlessTransitionOutlet.leave()
    this.query = ""
    this.filterOptions()
  }

  focusOption({ currentTarget }) {
    this.#setActiveOption(currentTarget)
  }

  unfocusOption() {
    this.#unfocusActiveOption()
  }

  #createdOptionVisible() {
    if (!this.createdOption) return false
    return !this.createdOption.classList.contains("!hidden")
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

  #showCreateOption() {
    if (!this.createdOption) return
    this.createdOption.classList.remove("!hidden")
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
    this.#updateOption()
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

  async #updateOption() {
    if (!this.multipleValue) await this.headlessTransitionOutlet.leave()
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

  #previouslySelected(option) {
    if (!option) return false
    return this.optionsByValue.has(option.dataset.value)
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

  #processFilter() {
    try {
      const func = new Function(this.filterScriptTarget.content.textContent)
      func.call(this)
    } catch (error) {
      console.error('Error executing custom method script:', error)
    }
  }

  #getOptionsToHide(filteredOptionsList, key = null) {
    const userSet = key ? new Set(filteredOptionsList.map(item => item[key])) : new Set(filteredOptionsList)
    return this.options
      .map((item, index) => ({ value: key ? item[key] : item, index }))
      .filter(({ value }) => !userSet.has(value))
      .map(({ index }) => index)
  }

  #getOptionDisplayOrder(filteredOptionsList, key = null) {
    const userMap = new Map(filteredOptionsList.map((item, index) => [key ? item[key] : item, index]))
    return this.options
      .map((item, index) => ({ value: key ? item[key] : item, index }))
      .filter(({ value }) => userMap.has(value))
      .sort((a, b) => userMap.get(a.value) - userMap.get(b.value))
      .map(({ index }) => index)
  }

  #updateOptions() {
    this.#processFilter()
    const indicesToHide = this.#getOptionsToHide([this.createdOption, ...this.filteredOptions])
    this.displayOrder = this.#getOptionDisplayOrder([this.createdOption, ...this.filteredOptions])

    if (this.query == "") {
      this.#hideCreateOption()
    } else {
      this.#showCreateOption()
    }

    for (let i = 0; i < this.options.length; i++) {
      const isHidden = indicesToHide.includes(i)
      if (isHidden) {
        this.options[i].classList.add('!hidden')
        this.options[i].setAttribute("aria-hidden", "true")
      } else {
        this.options[i].classList.remove('!hidden')
        this.options[i].setAttribute("aria-hidden", "false")
        if (this.options[i].dataset.displayValue.toLowerCase() == this.query.toLowerCase()) {
          this.#hideCreateOption()
        }
      }
      this.options[i].style.order = this.displayOrder.indexOf(i) >= 0 ? this.displayOrder.indexOf(i) : 9999
    }
    this.selectedIndexValue = this.#indexOfActiveOption()
  }
}