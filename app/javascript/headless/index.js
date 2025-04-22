window.Headless = {
  elementFocus: (element) => {
    if (element.matches(':focus-visible')) {
      element.setAttribute('data-focus', "")
    }
  },
  elementBlur: (element) => {
    element.removeAttribute('data-focus')
  },
}