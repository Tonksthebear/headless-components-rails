export default class ComboboxState {
  // Define possible states as static constants
  static STATES = {
    CLOSED: 'closed',
    OPEN: 'open',
    FILTERING: 'filtering',
    CREATING: 'creating',
    SELECTING: 'selecting'
  }

  // Define option states as static constants
  static OPTION_STATES = {
    DISABLED: 'disabled',
    SELECTED: 'selected',
    HIDDEN: 'hidden',
    UNSELECTED: 'unselected',
    ACTIVE: 'active'
  }

  constructor(controller, callbacks = {}) {
    this.controller = controller
    this.optionsByValue = new Map()
    this.currentState = ComboboxState.STATES.CLOSED
    this.query = ""
    this.options = controller.optionTargets
    this.displayOrder = []
    this.activeOption = null
    this.activeIndex = -1
    this.createOption = null
    this.filteredOptions = []
    this.selectedOptions = new Set()
    this.newlySelectedOption = null
    this.newlyDeselectedOption = null
    this.immediate = controller.immediateValue
    this.transitioning = false

    // Store callbacks
    this.onSelectedChange = callbacks.onSelectedChange || (() => { })
    this.onStateChange = callbacks.onStateChange || (() => { })

    // Initialize state based on controller's current state
    if (this.controller.element.hasAttribute("data-open")) {
      this.transitionTo(ComboboxState.STATES.OPEN)
    }

    // Initialize selected options from controller values
    this.initializeSelectedOptions()
  }

  // Initialize selected options from controller values
  initializeSelectedOptions() {
    if (this.controller.valueValue && this.controller.valueValue.length > 0) {
      this.controller.valueValue.forEach(value => {
        const option = this.findOptionByValue(value)
        if (option) {
          this.addToSelectedOptions(option)
        }
      })
    } else if (this.controller.defaultValueValue && this.controller.defaultValueValue.length > 0) {
      const option = this.findOptionByValue(this.controller.defaultValueValue)
      if (option) {
        this.addToSelectedOptions(option)
      }
    } else {
      this.updateOptions()
    }
  }

  menuTransitioning() {
    return this.controller.optionsTarget.dataset.transitioned == "false"
  }

  // Find an option by its value
  findOptionByValue(value) {
    return this.options.find(option => option.dataset.value === value)
  }

  // State transition methods
  async transitionTo(newState) {
    const oldState = this.currentState

    // Only proceed if the state is actually changing
    if (oldState === newState) {
      return
    }

    this.currentState = newState

    // Handle state-specific actions
    switch (newState) {
      case ComboboxState.STATES.CLOSED:
        await this.handleClosedState()
        break
      case ComboboxState.STATES.OPEN:
        await this.handleOpenState(oldState)
        break
      case ComboboxState.STATES.FILTERING:
        this.handleFilteringState()
        break
      case ComboboxState.STATES.CREATING:
        this.handleCreatingState()
        break
      case ComboboxState.STATES.SELECTING:
        this.handleSelectingState()
        break
    }

    // Notify controller of state change
    this.onStateChange(oldState, newState)
  }

  // State-specific handlers
  async handleClosedState() {
    // Close the dropdown
    this.transitioning = true
    await this.controller.headlessTransitionOutlet.leave()
    this.transitioning = false

    // Update attributes for closed state
    this.controller.element.removeAttribute("data-open")
    this.controller.buttonTarget.setAttribute("aria-expanded", "false")
    this.controller.buttonTarget.removeAttribute("data-open")
    this.controller.buttonTarget.removeAttribute("data-active")

    if (this.selectedOptions.size > 0) {
      this.unsetActiveOption(this.activeOption)
      this.setActiveOption(this.selectedOptionsArray[0])
    }
  }

  async handleOpenState(oldState) {
    if (oldState !== ComboboxState.STATES.FILTERING) this.updateOptions()

    // Open the dropdown
    if (document.activeElement != this.controller.inputTarget) {
      this.controller.inputTarget.focus()
    }

    this.transitioning = true
    await this.controller.headlessTransitionOutlet.enter()
    this.transitioning = false

    // Update attributes for open state
    this.controller.element.setAttribute("data-open", "")
    this.controller.buttonTarget.setAttribute("aria-expanded", "true")
    this.controller.buttonTarget.setAttribute("data-open", "")
    this.controller.buttonTarget.setAttribute("data-active", "")
  }

  handleFilteringState() {
    this.updateOptions()
    this.transitionTo(ComboboxState.STATES.OPEN)
  }

  handleCreatingState() {
    this.showCreateOption()
  }

  handleSelectingState() {
    // Handle selection logic
    this.updateSelectedOptionsUI()
  }

  handleEscaped() {
    this.query = ""
    this.controller.inputTarget.value = this.selectedOptionsArray[0].dataset.displayValue
    this.close()
  }

  // Public methods for the controller to call
  async open() {
    await this.transitionTo(ComboboxState.STATES.OPEN)
  }

  async close() {
    await this.transitionTo(ComboboxState.STATES.CLOSED)
  }

  filter(query) {
    this.query = query
    this.transitionTo(ComboboxState.STATES.FILTERING)
  }

  inputFocused() {
    if (this.immediate && this.isClosed && !this.menuTransitioning()) {
      this.open()
    }
  }

  createOption() {
    this.transitionTo(ComboboxState.STATES.CREATING)
  }

  selectOption(option) {
    this.transitionTo(ComboboxState.STATES.SELECTING)
  }

  // Selection methods
  async addToSelectedOptions(option) {
    if (!option) return

    // Check if the selected option is the created option
    if (option.dataset.newValue) {
      this.handleCreateOptionSelected()
    }

    if (this.controller.multipleValue) {
      // For multiple selection, just add the option
      this.optionsByValue.set(option.dataset.value, option)
      this.selectedOptions.add(option)
      this.newlySelectedOption = option
    } else {
      // For single selection, clear previous selections and add the new one
      if (!this.previouslySelected(option)) {
        this.clearSelectedOptions()
      }
      this.optionsByValue.set(option.dataset.value, option)
      this.selectedOptions.add(option)
      this.newlySelectedOption = option
    }

    this.syncInputValue()

    if (!this.controller.multipleValue) {
      this.query = ""
      await this.close()
    }

    this.setActiveIndexByOption(option)
    this.controller.inputTarget.focus()

    this.updateSelectedOptionsUI()
  }

  removeFromSelectedOptions(option) {
    if (!option) return

    this.optionsByValue.delete(option.dataset.value)
    this.selectedOptions.delete(option)
    this.newlyDeselectedOption = option

    this.syncInputValue()
  }

  clearSelectedOptions() {
    this.selectedOptions.forEach(option => {
      this.removeFromSelectedOptions(option)
    })
  }

  previouslySelected(option) {
    if (!option) return false
    return this.optionsByValue.has(option.dataset.value)
  }

  syncInputValue() {
    if (this.optionsByValue.size === 0) return

    if (this.controller.multipleValue) {
      const values = Array.from(this.optionsByValue.keys()).join(", ")
      const displayValues = Array.from(this.selectedOptions)
        .map(opt => opt.dataset.displayValue)
        .join(", ")

      // Call the callback with the values
      this.onSelectedChange(values, displayValues)
    } else {
      const selectedOption = Array.from(this.selectedOptions)[0]
      if (selectedOption) {
        const value = selectedOption.dataset.value
        const displayValue = selectedOption.dataset.displayValue

        // Call the callback with the values
        this.onSelectedChange(value, displayValue)
      } else {
        // Call the callback with empty values
        this.onSelectedChange("", "")
      }
    }
  }

  updateSelectedOptionsUI() {
    // Update the UI for newly selected options
    if (this.newlySelectedOption) {
      this.setOptionSelected(this.newlySelectedOption)
    }

    // Update the UI for newly deselected options
    if (this.newlyDeselectedOption) {
      this.setOptionUnselected(this.newlyDeselectedOption)
    }

    // Reset the newly selected/deselected options
    this.newlySelectedOption = null
    this.newlyDeselectedOption = null
  }

  // Helper methods
  updateOptions() {
    this.processFilter()

    // Handle created option visibility
    if (this.query === "" && !this.selectedOptions.has(this.createOption)) {
      this.hideCreateOption()
    } else if (this.controller.hasTemplateOptionTarget) {
      this.showCreateOption()
    }

    // Calculate display order and visibility
    const optionsToDisplay = this.isCreateOptionVisible() ?
      [this.createOption, ...this.filteredOptions] :
      this.filteredOptions

    const indicesToHide = this.optionsToHide(optionsToDisplay)
    this.displayOrder = this.optionsDisplayOrder(optionsToDisplay)

    // Update option visibility and order
    for (let i = 0; i < this.optionsList().length; i++) {
      const isHidden = indicesToHide.includes(i)
      if (isHidden) {
        this.setOptionHidden(this.optionsList()[i])
      } else {
        this.setOptionVisible(this.optionsList()[i])

        // If an option matches the query exactly, hide the create option
        if (this.optionsList()[i] != this.createOption && this.optionsList()[i].dataset.displayValue.toLowerCase() === this.query.toLowerCase()) {
          this.hideCreateOption()
        }
      }

      // Set the order of the option
      this.optionsList()[i].style.order = this.displayOrder.indexOf(i) >= 0 ?
        this.displayOrder.indexOf(i) : 9999
    }

    this.updateActiveIndex()
  }

  processFilter() {
    try {
      if (this.controller.hasFilterScriptTarget) {
        const func = new Function(this.controller.filterScriptTarget.content.textContent)
        func.call(this)
      }
    } catch (error) {
      console.error('Error executing custom method script:', error)
    }
  }

  optionsToHide(filteredOptionsList, key = null) {
    const userSet = key ? new Set(filteredOptionsList.map(item => item[key])) : new Set(filteredOptionsList)
    return this.optionsList()
      .map((item, index) => ({ value: key ? item[key] : item, index }))
      .filter(({ value }) => !userSet.has(value))
      .map(({ index }) => index)
  }

  optionsDisplayOrder(filteredOptionsList, key = null) {
    const userMap = new Map(filteredOptionsList.map((item, index) => [key ? item[key] : item, index]))
    return this.optionsList()
      .map((item, index) => ({ value: key ? item[key] : item, index }))
      .filter(({ value }) => userMap.has(value))
      .map(({ index }) => index)
  }

  optionsList() {
    return this.isCreateOptionVisible() ?
      [this.createOption, ...this.options] :
      this.options
  }

  // Active index management
  updateActiveIndex() {
    if (this.activeOption) {
      this.setActiveIndexByOption(this.activeOption)
    } else {
      this.activeIndex = -1
      this.controller.optionsTarget.removeAttribute("aria-activedescendant")
    }
  }

  setActiveIndex(newIndex) {
    // Ensure the index is within bounds
    if (newIndex < 0 || newIndex >= this.displayOrder.length) {
      return
    }

    // Get the option at the new index
    const optionIndex = this.displayOrder[newIndex]
    const option = this.optionsList()[optionIndex]

    // Check if the option is disabled or hidden
    if (option.disabled || option.classList.contains("!hidden")) {
      return
    }

    // Set the active option
    this.setActiveOption(option)

    // Update the active index
    this.activeIndex = newIndex
  }

  // Set the active option with appropriate attributes
  setActiveOption(option) {
    if (this.activeOption === option) return
    // Clear previous active option if exists
    if (this.activeOption) {
      this.unsetActiveOption(this.activeOption)
    }

    // Set the new active option
    this.activeOption = option

    // Apply active state attributes
    this.setOptionActive(option)
  }

  // Get the index of an option in the display order
  getOptionIndex(option) {
    if (!option) return -1

    // If it's the create option
    if (option === this.createOption) {
      return 0
    }

    // Find the option in the options array
    const optionIndex = this.optionsList().indexOf(option)
    if (optionIndex === -1) return -1

    // Find the index in the display order
    const displayOrderIndex = this.displayOrder.indexOf(optionIndex)
    if (displayOrderIndex === -1) return -1

    // Apply the create option index adjustment
    return displayOrderIndex + this.createOptionIndexAdjustment
  }

  // Set active index by providing an option
  setActiveIndexByOption(option) {
    const index = this.getOptionIndex(option)
    if (index !== -1) {
      this.setActiveIndex(index)
    }
  }

  // Unset the active option
  unsetActiveOption(option) {
    if (!option) return
    // Remove active state attributes
    this.unsetOptionActive(option)

    // Clear the active option reference if it's the current one
    if (this.activeOption === option) {
      this.activeOption = null
      this.activeIndex = -1
      this.controller.optionsTarget.removeAttribute("aria-activedescendant")
    }
  }

  // Navigation methods
  focusFirstOption() {
    if (this.displayOrder.length === 0) return

    // Find the first non-disabled, visible option
    for (let i = 0; i < this.displayOrder.length; i++) {
      const optionIndex = this.displayOrder[i]
      const option = this.optionsList()[optionIndex]

      if (!option.disabled && !option.classList.contains("!hidden")) {
        this.setActiveIndex(i)
        return
      }
    }
  }

  focusLastOption() {
    if (this.displayOrder.length === 0) return

    // Find the last non-disabled, visible option
    for (let i = this.displayOrder.length - 1; i >= 0; i--) {
      const optionIndex = this.displayOrder[i]
      const option = this.optionsList()[optionIndex]

      if (!option.disabled && !option.classList.contains("!hidden")) {
        this.setActiveIndex(i)
        return
      }
    }
  }

  focusNextOption() {
    if (this.displayOrder.length === 0) return
    if (this.isClosed) {
      this.open()
      return
    }

    // If no option is active, focus the first one
    if (this.activeIndex === -1) {
      this.focusFirstOption()
      return
    }

    // Find the next non-disabled, visible option
    for (let i = this.activeIndex + 1; i < this.displayOrder.length; i++) {
      const optionIndex = this.displayOrder[i]
      const option = this.optionsList()[optionIndex]

      if (!option.disabled && !option.classList.contains("!hidden")) {
        this.setActiveIndex(i)
        return
      }
    }

    // If we couldn't find a next option, wrap around to the first one
    this.focusFirstOption()
  }

  focusPreviousOption() {
    if (this.displayOrder.length === 0) return
    if (this.isClosed) {
      this.open()
      return
    }

    // If no option is active, focus the last one
    if (this.activeIndex === -1) {
      this.focusLastOption()
      return
    }

    // Find the previous non-disabled, visible option
    for (let i = this.activeIndex - 1; i >= 0; i--) {
      const optionIndex = this.displayOrder[i]
      const option = this.optionsList()[optionIndex]

      if (!option.disabled && !option.classList.contains("!hidden")) {
        this.setActiveIndex(i)
        return
      }
    }

    // If we couldn't find a previous option, wrap around to the last one
    this.focusLastOption()
  }

  showCreateOption() {
    if (!this.controller.hasTemplateOptionTarget) return

    if (!this.createOption) {
      this.createOption = this.controller.templateOptionTarget.content.firstElementChild.cloneNode(true)
      this.createOption.dataset.newValue = true
      this.controller.optionsTarget.prepend(this.createOption)
    }

    if (this.query) {
      this.createOption.dataset.value = this.query
      this.createOption.dataset.displayValue = this.query
      this.createOption.innerHTML = this.controller.templateOptionTarget.content.firstElementChild.innerHTML.replace("{query}", this.query)
    }
    this.setOptionVisible(this.createOption)
  }

  hideCreateOption() {
    if (!this.createOption) return
    this.setOptionHidden(this.createOption)
  }

  isCreateOptionVisible() {
    if (!this.createOption) return false
    return !this.createOption.classList.contains("!hidden")
  }

  // Handle the case when a created option is selected
  handleCreateOptionSelected() {
    // If multiple selection is allowed, we need to create a new created option
    if (this.controller.multipleValue) {
      // The created option becomes a regular option
      this.createOption.dataset.newValue = false
      this.createOption = null

      // Create a new created option
      this.showCreateOption()
    }
  }

  // Option state helper methods
  setOptionDisabled(option) {
    if (!option) return

    option.setAttribute("aria-disabled", "true")
    option.setAttribute("data-disabled", "")
    option.classList.add("disabled")
  }

  setOptionEnabled(option) {
    if (!option) return

    option.setAttribute("aria-disabled", "false")
    option.removeAttribute("data-disabled")
    option.classList.remove("disabled")
  }

  setOptionSelected(option) {
    if (!option) return

    option.setAttribute("aria-selected", "true")
    option.setAttribute("data-selected", "")
    option.classList.add("selected")
  }

  setOptionUnselected(option) {
    if (!option) return

    option.setAttribute("aria-selected", "false")
    option.removeAttribute("data-selected")
    option.classList.remove("selected")
  }

  setOptionHidden(option) {
    if (!option) return

    option.classList.add("!hidden")
    option.setAttribute("aria-hidden", "true")
  }

  setOptionVisible(option) {
    if (!option) return

    option.classList.remove("!hidden")
    option.setAttribute("aria-hidden", "false")
  }

  setOptionActive(option) {
    if (!option) return

    option.setAttribute("data-focus", "")
    option.setAttribute("data-hover", "")
    option.setAttribute("data-active", "")

    this.controller.optionsTarget.setAttribute("aria-activedescendant", option.id)
  }

  unsetOptionActive(option) {
    if (!option) return

    option.removeAttribute("data-focus")
    option.removeAttribute("data-hover")
    option.removeAttribute("data-active")
  }

  // Set multiple option states at once
  setOptionStates(option, states) {
    if (!option) return

    // Reset all states first
    this.setOptionEnabled(option)
    this.setOptionUnselected(option)
    this.setOptionVisible(option)
    this.unsetOptionActive(option)

    // Apply requested states
    if (states.includes(ComboboxState.OPTION_STATES.DISABLED)) {
      this.setOptionDisabled(option)
    }

    if (states.includes(ComboboxState.OPTION_STATES.SELECTED)) {
      this.setOptionSelected(option)
    }

    if (states.includes(ComboboxState.OPTION_STATES.HIDDEN)) {
      this.setOptionHidden(option)
    }

    if (states.includes(ComboboxState.OPTION_STATES.ACTIVE)) {
      this.setOptionActive(option)
    }
  }

  // Getters for the controller to use
  get isOpen() {
    return this.currentState === ComboboxState.STATES.OPEN
  }

  get isClosed() {
    return this.currentState === ComboboxState.STATES.CLOSED
  }

  get isFiltering() {
    return this.currentState === ComboboxState.STATES.FILTERING
  }

  get isCreating() {
    return this.currentState === ComboboxState.STATES.CREATING
  }

  get isSelecting() {
    return this.currentState === ComboboxState.STATES.SELECTING
  }

  // Helper method to get the index adjustment for created option
  get createOptionIndexAdjustment() {
    return this.isCreateOptionVisible() ? -1 : 0
  }

  // Getter for selected options
  get selectedOptionsArray() {
    return Array.from(this.selectedOptions)
  }

  // Getter for selected values
  get selectedValues() {
    return Array.from(this.optionsByValue.keys())
  }
}
