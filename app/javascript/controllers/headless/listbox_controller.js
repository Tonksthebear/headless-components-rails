import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"
import DisabledObserver from "headless/disabled_observer"
import ElementSizeObserver from "headless/element_size_observer"

export default class extends ApplicationController {
  static targets = ["button", "options", "option", "selectedOption"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    openAtStart: { type: Boolean, default: false },
    portal: { type: Boolean, default: false },
    activeIndex: { type: Number, default: -1 },
    multiple: { type: Boolean, default: false },
    value: { type: String, default: null },
    defaultValue: { type: String, default: null },
    name: { type: String, default: null },
    form: { type: String, default: null },
    anchorTo: { type: String, default: null }
  }

  constructor(context) {
    super(context)
    Object.assign(this, floatingControllerHelpers);
  }

  connect() {
    this.portalValue = this.portalValue || this.hasAnchor(this.optionsTarget)
    this.searchQuery = ""
    this.searchTimeout = null
    this.selectedOptions = new Set()
    this.#updateSelectedOptionElement()
    this.elementSizeObserver = new ElementSizeObserver([this.buttonTarget], {
      elementResized: this.#elementSizeChanged.bind(this)
    })
    this.elementSizeObserver.start()
    this.disabledObserver = new DisabledObserver(this.element, {
      elementDisabled: this.#elementDisabled,
      elementEnabled: this.#elementEnabled
    })
    this.disabledObserver.start()


    if (this.openAtStartValue) {
      this.open()
    } else {
      this.headlessTransitionOutlet.leave()
    }
  }

  disconnect() {
    this.disabledObserver.stop()
  }

  activeIndexValueChanged(newIndex, previousIndex) {
    if (previousIndex >= 0) {
      this.blurOption({ currentTarget: this.optionTargets[previousIndex] })
    }

    if (newIndex >= 0) {
      this.focusOption({ currentTarget: this.optionTargets[newIndex] })
    }
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
    this.portaledDisabledObserver = new DisabledObserver(controller.element, {
      elementDisabled: this.#elementDisabled,
      elementEnabled: this.#elementEnabled
    })
    this.portaledDisabledObserver.start()
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
    this.portaledDisabledObserver.stop()
  }

  async open() {
    if (this.#lastSelectedOption) this.focusOption({ currentTarget: this.#lastSelectedOption })
    await this.headlessTransitionOutlet.enter()
  }

  async close() {
    await this.headlessTransitionOutlet.leave()
    this.buttonTarget.focus()
  }

  async toggle() {
    if (this.element.hasAttribute("data-open")) {
      await this.close()
    } else {
      await this.open()
    }
  }

  listboxOpened() {
    this.dispatch("listboxOpened")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    this.buttonTarget.setAttribute("data-open", "")
    this.buttonTarget.setAttribute("data-active", "")
    this.element.setAttribute("data-active", "")
    this.optionsTarget.setAttribute("data-open", "")
    this.optionsTarget.removeAttribute("data-closed", "")
    this.element.setAttribute("data-open", "")
    if (this.activeIndex == -1) this.activeIndexValue = this.optionTargets.indexOf(this.#lastSelectedOption)
    this.optionsTarget.focus()
  }

  listboxClosed() {
    this.dispatch("listboxClosed")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    this.buttonTarget.removeAttribute("data-open")
    this.buttonTarget.removeAttribute("data-active")
    this.element.removeAttribute("data-active")
    this.optionsTarget.removeAttribute("data-open")
    this.optionsTarget.setAttribute("data-closed", "")
    this.element.removeAttribute("data-open")
    this.activeIndexValue = -1
  }

  closeOnClickOutside(event) {
    if (!this.element.contains(event.target) && !this.headlessPortalOutlet.element.contains(event.target)) {
      this.headlessTransitionOutlet.leave()
    }
  }

  sendPortal() {
    this.portalValue && document.body.appendChild(this.optionsTarget)
    this.setupFloating({ reference: this.buttonTarget, floating: this.optionsTarget })
  }

  retrievePortal() {
    this.portalValue && this.element.appendChild(this.optionsTarget)
    this.cleanupFloating()
  }

  focusOption({ currentTarget }) {
    if (!currentTarget) return
    if (currentTarget.hasAttribute("data-disabled")) return

    const index = this.optionTargets.indexOf(currentTarget)
    this.activeIndexValue = index

    currentTarget.setAttribute("data-focus", "")
    currentTarget.setAttribute("data-active", "")
    currentTarget.setAttribute("aria-selected", "true")

    this.optionsTarget.setAttribute("aria-activedescendant", currentTarget.id)
  }

  blurOptions() {
    this.optionTargets.forEach(option => {
      this.blurOption({ currentTarget: option })
    })
  }

  blurOption({ currentTarget }) {
    currentTarget.removeAttribute("data-focus")
    currentTarget.removeAttribute("data-active")
  }

  async selectActiveOption() {
    if (this.activeIndexValue >= 0) {
      this.selectOption({ currentTarget: this.optionTargets[this.activeIndexValue] })
    }
  }

  async selectOption({ currentTarget }) {
    if (currentTarget.hasAttribute("data-disabled")) return
    if (this.selectedOptions.has(currentTarget)) {
      this.#removeSelectedOption(currentTarget)
      return
    } else {
      this.#addSelectedOption(currentTarget)
    }
  }

  focusNextOption() {
    if (!this.element.hasAttribute("data-open") && !this.optionsTarget.hasAttribute("data-enter")) {
      this.open()
      return
    }

    if (this.activeIndexValue === -1) {
      this.focusFirstOption()
      return
    }

    // Find the next non-disabled, visible option
    for (let i = this.activeIndexValue + 1; i < this.optionTargets.length; i++) {
      const option = this.optionTargets[i]

      if (!option.disabled && !option.classList.contains("!hidden")) {
        this.activeIndexValue = i
        return
      }
    }
  }

  focusPreviousOption() {
    if (!this.element.hasAttribute("data-open") && !this.optionsTarget.hasAttribute("data-enter")) {

      this.open()
      return
    }

    if (this.activeIndexValue == -1) {
      this.focusLastOption()
      return
    }

    for (let i = this.activeIndexValue - 1; i >= 0; i--) {
      const option = this.optionTargets[i]

      if (!option.disabled && !option.classList.contains("!hidden")) {
        this.activeIndexValue = i
        return
      }
    }
  }

  focusFirstOption() {
    this.activeIndexValue = 0
  }

  focusLastOption() {
    this.activeIndexValue = this.optionTargets.length - 1
  }

  focusMatchedOption(event) {
    if (event.key.length !== 1 || !event.key.match(/[a-z0-9]/i)) return

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }

    this.searchQuery += event.key.toLowerCase()

    const options = this.optionTargets
    const currentOption = document.activeElement
    const currentIndex = options.includes(currentOption) ? options.indexOf(currentOption) : -1

    const searchOrder = currentIndex === -1
      ? options
      : [...options.slice(currentIndex + 1), ...options.slice(0, currentIndex + 1)]

    const matchedOption = searchOrder.find(option =>
      option.textContent.trim().toLowerCase().startsWith(this.searchQuery)
    )

    if (matchedOption) {
      this.activeIndexValue = this.optionTargets.indexOf(matchedOption)
    }

    this.searchTimeout = setTimeout(() => {
      this.searchQuery = ""
      this.searchTimeout = null
    }, 350)
  }

  async #addSelectedOption(option) {
    var previousSelectedOption = null

    if (this.multipleValue) {
      this.selectedOptions.add(option)
    } else {
      previousSelectedOption = this.selectedOptions.values().next().value
      this.selectedOptions.clear()
      this.selectedOptions.add(option)
    }

    this.#updateSelectedOptionElement(option)
    if (!this.multipleValue) await this.close()
    if (previousSelectedOption) this.#markOptionAsUnselected(previousSelectedOption)
    this.#markOptionAsSelected(option)
  }

  async #removeSelectedOption(option) {
    if (!option) return
    this.selectedOptions.delete(option)
    this.#updateSelectedOptionElement(this.#lastSelectedOption)
    if (!this.multipleValue) await this.close()
    this.#markOptionAsUnselected(option)
  }

  #updateSelectedOptionElement(option) {
    this.#selectOptionElement.innerHTML = this.#selectOptionInnerHTML(option)

    if (this.multipleValue) {
      // For multiple selection, show all selected options
      const values = value.split(',')
      const selectedOptions = this.optionTargets.filter(option =>
        values.includes(option.dataset.headlessListboxValue)
      )

      if (selectedOptions.length > 0) {
        selectedOption.textContent = selectedOptions.map(option => option.textContent).join(', ')
      } else if (selectedOption.dataset.placeholder) {
        selectedOption.textContent = selectedOption.dataset.placeholder
      } else {
        selectedOption.textContent = ""
      }
    }
  }

  focusMatchedItem(event) {
    if (event.key.length !== 1 || !event.key.match(/[a-z0-9]/i)) return

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }

    this.searchQuery += event.key.toLowerCase()

    const items = this.optionTargets
    const currentItem = document.activeElement
    const currentIndex = items.includes(currentItem) ? items.indexOf(currentItem) : -1

    const searchOrder = currentIndex === -1
      ? items
      : [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex + 1)]

    const matchedItem = searchOrder.find(item =>
      item.textContent.trim().toLowerCase().startsWith(this.searchQuery)
    )

    if (matchedItem) {
      this.activeIndexValue = this.optionTargets.indexOf(matchedItem)
    }

    this.searchTimeout = setTimeout(() => {
      this.searchQuery = ""
      this.searchTimeout = null
    }, 350)
  }

  #markOptionAsSelected(option) {
    option.setAttribute("data-selected", "")
    option.setAttribute("aria-selected", "true")
    option.setAttribute("data-active", "")
    option.setAttribute("data-focus", "")
  }

  #markOptionAsUnselected(option) {
    option.removeAttribute("data-selected")
    option.removeAttribute("aria-selected")
    option.removeAttribute("data-active")
    option.removeAttribute("data-focus")
  }

  #elementDisabled(target) {
    target.setAttribute("data-disabled", "")
  }

  #elementEnabled(target) {
    target.removeAttribute("data-disabled")
  }

  #elementSizeChanged(element, newSize) {
    this.optionsTarget.style.setProperty("--button-width", `${newSize.width}px`)
  }

  #selectOptionInnerHTML(option = this.#selectOptionElement) {
    const placeholders = this.templateSelect.match(/{[^}]+}/g) || []
    let result = this.templateSelect

    placeholders.forEach((placeholder) => {
      const variableName = placeholder.slice(1, -1)
      const value = option.dataset[variableName] || option.dataset.value || ""
      result = result.replace(placeholder, value)
    })

    return result
  }


  get #selectOptionElement() {
    if (this.hasSelectedOptionTarget) {
      return this.selectedOptionTarget
    } else {
      return this.buttonTarget
    }
  }

  get templateSelect() {
    if (!this._templateSelect) {
      this._templateSelect = this.#selectOptionElement.innerHTML
    }
    return this._templateSelect
  }

  get #lastSelectedOption() {
    return [...this.selectedOptions][this.selectedOptions.size - 1]
  }
}
