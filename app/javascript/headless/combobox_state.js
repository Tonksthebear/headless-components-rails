export class ComboboxState {
  constructor(controller) {
    this.controller = controller
    this.open = false
    this.query = ""
    this.options = []
    this.displayOrder = []
    this.activeOption = null
    this.selectedIndex = -1
    this.createdOption = null
    this.options = controller.optionTargets
  }

  updateOptions() {
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

  #processFilter() {
    try {
      const func = new Function(controller.filterScriptTarget.content.textContent)
      func.call(controller)
    } catch (error) {
      console.error('Error executing custom method script:', error)
    }
  }

  #optionsToHide(filteredOptionsList, key = null) {
    const userSet = key ? new Set(filteredOptionsList.map(item => item[key])) : new Set(filteredOptionsList)
    return this.options
      .map((item, index) => ({ value: key ? item[key] : item, index }))
      .filter(({ value }) => !userSet.has(value))
      .map(({ index }) => index)
  }

  #optionsToDisplayOrder(filteredOptionsList, key = null) {
    const userMap = new Map(filteredOptionsList.map((item, index) => [key ? item[key] : item, index]))
    return this.options
      .map((item, index) => ({ value: key ? item[key] : item, index }))
      .filter(({ value }) => userMap.has(value))
  }
}
