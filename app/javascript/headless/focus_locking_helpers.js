export function getAllFocusableElements(parent = document, ignoreElements = []) {
  return [
    ...parent.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]:not([contenteditable="false"])'
    ),
  ].filter(
    el =>
      !el.hasAttribute('disabled') &&
      el.tabIndex !== undefined &&
      el.offsetParent !== null && // Excludes display:none
      getComputedStyle(el).visibility !== 'hidden' &&
      !isElementIgnored(el, ignoreElements)
  );
}

function isElementIgnored(element, ignoreElements) {
  return ignoreElements.some(ignoreElement => ignoreElement.contains(element))
}
