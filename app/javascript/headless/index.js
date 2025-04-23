import { nextFrame } from "headless/animation_helpers"

window.Headless = {
  elementFocus: (element) => {
    if (element.matches(':focus-visible')) {
      element.setAttribute('data-focus', "")
    }
  },

  elementBlur: (element) => {
    element.removeAttribute('data-focus')
  },

  elementHover: (element) => {
    if (element.matches(':hover')) {
      element.setAttribute('data-hover', "")
    }
  },

  elementLeave: (element) => {
    element.removeAttribute('data-hover')
    element.removeAttribute('data-active')
  },

  elementMouseDown: (element) => {
    element.setAttribute('data-active', "")
  },

  elementMouseUp: (element) => {
    element.removeAttribute('data-active')
  },

  checkboxChanged: async (event, element) => {
    element.parentElement.setAttribute('aria-checked', element.checked)
    if (element.checked) {
      element.parentElement.setAttribute('data-checked', "")
    } else {
      element.parentElement.removeAttribute('data-checked')
    }

    element.parentElement.setAttribute("data-changing", "")
    await nextFrame()
    await nextFrame()
    element.parentElement.removeAttribute("data-changing")
  },

  checkboxClicked: (event, element) => {
    event.preventDefault()
    element.firstElementChild.checked = !element.firstElementChild.checked
    element.firstElementChild.dispatchEvent(new Event('change'))
  },

  checkboxKeydown: (event, element) => {
    if (event.key === ' ') {
      Headless.checkboxClicked(event, element)
    } else if (event.key === 'Enter') {
      const form = element.closest('form')
      if (form) {
        form.requestSubmit()
      }
    }
  }
}