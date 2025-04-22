import ApplicationController from "controllers/headless/application_controller"
import { floatingControllerHelpers } from "headless/floating_controller_helpers"
import { observeElementSize } from "headless/element_size_helper"
import ComboboxState from "headless/combobox_state"

export default class extends ApplicationController {
  static targets = ["input", "button", "options", "option", "hiddenInput", "templateOption", "filterScript"]
  static outlets = ["headless--portal", "headless--transition"]
  static values = {
    value: { type: Array, default: [] },
    defaultValue: Array,
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

  connect() {
    // Initialize the state machine with callbacks
    this.state = new ComboboxState(this, {
      onSelectedChange: this.handleSelectedChange.bind(this),
      onStateChange: this.handleStateChange.bind(this)
    })

    // Setup portal if needed
    this.portalValue = this.portalValue || this.hasAnchor(this.optionsTarget)

    // Setup observers
    this.inputSizeObserver = observeElementSize(this.inputTarget, this.inputSizeChanged.bind(this))
    this.buttonSizeObserver = observeElementSize(this.buttonTarget, this.buttonSizeChanged.bind(this))

    // Initialize state variables
    this.query = ""
    this.options = this.optionTargets

    // Initialize the combobox
    this.updateOptions()

    // Setup template option if available
    if (this.hasTemplateOptionTarget) {
      this.templateOption = this.templateOptionTarget.content.firstElementChild
    }

    // Set initial open state
    if (this.openValue) {
      this.state.open()
    } else {
      this.state.close()
    }
  }

  disconnect() {
    this.inputSizeObserver.disconnect()
    this.buttonSizeObserver.disconnect()
  }

  open() {
    this.sendPortal()
    this.state.open()
  }

  close() {
    this.state.close()
  }

  toggle() {
    if (this.state.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  // Handle selected value changes from the state machine
  handleSelectedChange(value, displayValue) {
    this.hiddenInputTarget.value = value
    this.inputTarget.value = displayValue
  }

  // Handle state changes from the state machine
  handleStateChange(oldState, newState) {
    // Dispatch appropriate events based on state change
    if (newState === ComboboxState.STATES.OPEN) {
      this.dispatch("open")
    } else if (newState === ComboboxState.STATES.CLOSED) {
      this.retrievePortal()
      this.dispatch("close")
    }
  }

  headlessPortalOutletConnected(controller) {
    controller.sync(this)
  }

  headlessPortalOutletDisconnected(controller) {
    controller.desync(this)
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
    if (!this.state.activeOption) return
    this.selectOption({ currentTarget: this.state.activeOption })
  }

  async selectOption({ currentTarget }) {
    this.state.addToSelectedOptions(currentTarget)
  }

  filterOptions() {
    this.state.filter(this.inputTarget.value)
  }

  inputFocused() {
    this.state.inputFocused()
  }

  focusNextOption() {
    this.state.focusNextOption()
  }

  focusPreviousOption() {
    this.state.focusPreviousOption()
  }

  focusFirstOption() {
    if (!this.state.isOpen) {
      this.state.open()
    }
    this.state.focusFirstOption()
  }

  focusLastOption() {
    if (!this.state.isOpen) {
      this.state.open()
    }
    this.state.focusLastOption()
  }

  async clearInput() {
    this.state.handleEscaped()
  }

  focusOption({ currentTarget }) {
    this.state.setActiveOption(currentTarget)
  }

  unfocusOption({ currentTarget }) {
    this.state.unsetActiveOption(currentTarget)
  }

  inputSizeChanged(newSize) {
    this.optionsTarget.style.setProperty("--input-width", `${newSize.width}px`)
  }

  buttonSizeChanged(newSize) {
    this.optionsTarget.style.setProperty("--button-width", `${newSize.width}px`)
  }

  updateOptions() {
    this.state.updateOptions()
  }
}