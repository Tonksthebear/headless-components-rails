import { autoUpdate } from '@floating-ui/dom'
import { flip as flipMiddleware } from '@floating-ui/dom'
// import { inner as innerMiddleware } from '@floating-ui/dom'
import { offset as offsetMiddleware } from '@floating-ui/dom'
import { shift as shiftMiddleware } from '@floating-ui/dom'
import { size as sizeMiddleware } from '@floating-ui/dom'
import { computePosition } from '@floating-ui/dom'
// import { useFloating } from '@floating-ui/dom'
// import { useInnerOffset } from '@floating-ui/dom'
// import { useInteractions } from '@floating-ui/dom'

// Constants
const MINIMUM_ITEMS_VISIBLE = 4

/**
 * Creates a floating element that positions itself relative to a reference element
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.reference - The reference element to position against
 * @param {HTMLElement} options.floating - The floating element to position
 * @param {Object} options.placement - Placement configuration
 * @param {string} [options.placement.to='bottom'] - The side to place the floating element on ('top', 'right', 'bottom', 'left')
 * @param {string} [options.placement.align='center'] - The alignment of the floating element ('start', 'center', 'end')
 * @param {number} [options.gap=0] - The gap between the reference and floating elements
 * @param {number} [options.offset=0] - The offset to nudge the floating element from its original position
 * @param {number} [options.padding=0] - The minimum space between the floating element and the viewport
 * @param {boolean} [options.enabled=true] - Whether the floating element is enabled
 * @param {Object} [options.inner=null] - Inner positioning configuration
 * @returns {Object} - Cleanup function to remove the floating element
 */
export function createFloating({
  reference,
  floating,
  placement = { to: 'bottom', align: 'center' },
  gap = 0,
  offset = 0,
  padding = 0,
  enabled = true,
  inner = null
}) {
  if (!enabled || !reference || !floating) {
    return () => { }
  }

  const { to = 'bottom', align = 'center' } = placement

  // Calculate the placement string for floating-ui
  const placementString = to === 'selection'
    ? align === 'center'
      ? 'bottom'
      : `bottom-${align}`
    : align === 'center'
      ? `${to}`
      : `${to}-${align}`

  // Create middleware array
  const middleware = [
    // Offset middleware - defines the gap between reference and floating elements
    offsetMiddleware({
      mainAxis: to === 'selection' ? 0 : gap,
      crossAxis: offset,
    }),

    // Shift middleware - nudges the floating element to keep it in viewport
    shiftMiddleware({ padding }),

    // Flip middleware - swaps placement if there's not enough room
    to !== 'selection' && flipMiddleware({ padding }),

    // Size middleware - ensures the floating element doesn't overflow the viewport
    sizeMiddleware({
      padding,
      apply({ availableWidth, availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          overflow: 'auto',
          maxWidth: `${availableWidth}px`,
          maxHeight: `min(var(--anchor-max-height, 100vh), ${availableHeight}px)`,
        })
      },
    }),
  ].filter(Boolean)

  // Track inner offset for selection mode
  let innerOffset = 0

  // Function to update inner offset
  const updateInnerOffset = (newOffset) => {
    innerOffset = newOffset
    // Recompute position when inner offset changes
    computePosition(reference, floating, {
      placement: placementString,
      middleware,
    }).then(({ x, y, middlewareData }) => {
      // Apply position
      Object.assign(floating.style, {
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
      })

      // Apply data attributes for styling
      floating.setAttribute('data-anchor', `${to}${align !== 'center' ? ` ${align}` : ''}`)
    })
  }

  // Create the floating instance
  const cleanup = autoUpdate(reference, floating, () => {
    // Compute position using floating-ui
    computePosition(reference, floating, {
      placement: placementString,
      middleware,
    }).then(({ x, y, middlewareData }) => {
      // Apply position
      Object.assign(floating.style, {
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
      })

      // Apply data attributes for styling
      floating.setAttribute('data-anchor', `${to}${align !== 'center' ? ` ${align}` : ''}`)

      // Handle inner positioning if enabled
      if (to === 'selection' && inner) {
        handleInnerPositioning(floating, inner, updateInnerOffset)
      }
    })
  })

  // Fix scrolling pixel issue
  fixScrollingPixel(floating)

  return cleanup
}

/**
 * Handles inner positioning for selection mode
 * @param {HTMLElement} floating - The floating element
 * @param {Object} inner - Inner positioning configuration
 * @param {Function} updateInnerOffset - Function to update inner offset
 */
function handleInnerPositioning(floating, inner, updateInnerOffset) {
  const { listRef, index } = inner

  if (!listRef || index === undefined) return

  // Get the selected item
  const selectedItem = listRef.children[index]
  if (!selectedItem) return

  // Calculate the position of the selected item
  const selectedRect = selectedItem.getBoundingClientRect()
  const floatingRect = floating.getBoundingClientRect()

  // Calculate the offset needed to show the selected item
  const scrollPaddingBottom = parseFloat(window.getComputedStyle(floating).scrollPaddingBottom) || 0

  // Calculate how many items are visible
  let visibleItems = 0
  let elementHeight = 0
  let elementAmountVisible = 0

  for (let i = 0; i < listRef.children.length; i++) {
    const child = listRef.children[i]
    const childTop = child.offsetTop
    const childBottom = childTop + child.clientHeight + scrollPaddingBottom

    const parentTop = floating.scrollTop
    const parentBottom = parentTop + floating.clientHeight

    if (childTop >= parentTop && childBottom <= parentBottom) {
      visibleItems++
    } else {
      elementAmountVisible = Math.max(
        0,
        Math.min(childBottom, parentBottom) - Math.max(childTop, parentTop)
      )
      elementHeight = child.clientHeight
      break
    }
  }

  // Calculate how many items we need to show
  const missing = Math.min(MINIMUM_ITEMS_VISIBLE, listRef.children.length) - visibleItems

  // If we need to show more items, calculate the offset
  if (missing >= 1) {
    const newInnerOffset = elementHeight * missing - elementAmountVisible + scrollPaddingBottom

    // Update the inner offset
    updateInnerOffset(newInnerOffset)
  }
}

/**
 * Fixes a scrolling pixel issue where maxHeight can have fractional values
 * @param {HTMLElement} element - The element to fix
 */
function fixScrollingPixel(element) {
  if (!element) return

  const observer = new MutationObserver(() => {
    const maxHeight = window.getComputedStyle(element).maxHeight

    const maxHeightFloat = parseFloat(maxHeight)
    if (isNaN(maxHeightFloat)) return

    const maxHeightInt = parseInt(maxHeight)
    if (isNaN(maxHeightInt)) return

    if (maxHeightFloat !== maxHeightInt) {
      element.style.maxHeight = `${Math.ceil(maxHeightFloat)}px`
    }
  })

  observer.observe(element, {
    attributes: true,
    attributeFilter: ['style'],
  })

  return () => {
    observer.disconnect()
  }
}

/**
 * Resolves a CSS variable or number value to a pixel value
 * @param {string|number} value - The value to resolve
 * @param {HTMLElement} element - The element to resolve against
 * @returns {number} - The resolved pixel value
 */
function resolvePxValue(value, element) {
  if (value == null) return 0

  // Number as-is
  if (typeof value === 'number') return value

  // String values
  if (typeof value === 'string') {
    if (!element) return 0

    // Check if it's a CSS variable
    const matches = /var\((.*)\)/.exec(value)
    if (matches) {
      const variableName = matches[1].split(',')[0].trim()
      const computedValue = window.getComputedStyle(element).getPropertyValue(variableName)
      console.log(computedValue)
      return parseFloat(computedValue) || 0
    }

    // Try to parse as a number with unit
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      return numValue
    }
  }

  return 0
}

/**
 * Creates a floating element with a reference and floating element
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.reference - The reference element
 * @param {HTMLElement} options.floating - The floating element
 * @param {Object} options.config - Configuration for the floating element
 * @returns {Object} - Cleanup function
 */
export function setupFloating({ reference, floating, config = {} }) {
  if (!reference || !floating) return () => { }

  // Resolve configuration
  const resolvedConfig = {
    to: config.to || 'bottom',
    align: config.align || 'center',
    gap: resolvePxValue(config.gap || 'var(--anchor-gap, 0)', floating),
    offset: resolvePxValue(config.offset || 'var(--anchor-offset, 0)', floating),
    padding: resolvePxValue(config.padding || 'var(--anchor-padding, 0)', floating),
    inner: config.inner || null,
  }

  // Create floating element
  return createFloating({
    reference,
    floating,
    placement: {
      to: resolvedConfig.to,
      align: resolvedConfig.align,
    },
    gap: resolvedConfig.gap,
    offset: resolvedConfig.offset,
    padding: resolvedConfig.padding,
    inner: resolvedConfig.inner,
    enabled: true,
  })
}

function useResolvedConfig(
  config,
  element
) {
  let gap = useResolvePxValue(config?.gap ?? 'var(--anchor-gap, 0)', element)
  let offset = useResolvePxValue(config?.offset ?? 'var(--anchor-offset, 0)', element)
  let padding = useResolvePxValue(config?.padding ?? 'var(--anchor-padding, 0)', element)

  return { ...config, gap, offset, padding }
}

function useResolvePxValue(
  input,
  element,
  defaultValue = undefined
) {
  let d = useDisposables()
  let computeValue = useEvent((value, element) => {
    // Nullish
    if (value == null) return [defaultValue, null]

    // Number as-is
    if (typeof value === 'number') return [value, null]

    // String values, the interesting part
    if (typeof value === 'string') {
      if (!element) return [defaultValue, null]

      let result = resolveCSSVariablePxValue(value, element)

      return [
        result,
        (setValue) => {
          let variables = resolveVariables(value)

          // TODO: Improve this part and make it work
          //
          // Observe variables themselves. Currently the browser doesn't support this, but the
          // variables we are interested in resolve to a pixel value. Which means that we can use
          // this variable in the `margin` of an element. Then we can observe the `margin` of the
          // element and we will be notified when the variable changes.
          //
          // if (typeof ResizeObserver !== 'undefined') {
          //   let tmpEl = document.createElement('div')
          //   element.appendChild(tmpEl)
          //
          //   // Didn't use `fontSize` because a `fontSize` can't be negative.
          //   tmpEl.style.setProperty('margin-top', '0px', 'important')
          //
          //   // Set the new value, if this is invalid the previous value will be used.
          //   tmpEl.style.setProperty('margin-top', value, 'important')
          //
          //   let observer = new ResizeObserver(() => {
          //     let newResult = resolveCSSVariableValue(value, element)
          //
          //     if (result !== newResult) {
          //       setValue(newResult)
          //       result = newResult
          //     }
          //   })
          //   observer.observe(tmpEl)
          //   d.add(() => observer.disconnect())
          //   return d.dispose
          // }

          // Works as a fallback, but not very performant because we are polling the value.
          {
            let history = variables.map((variable) =>
              window.getComputedStyle(element).getPropertyValue(variable)
            )

            d.requestAnimationFrame(function check() {
              d.nextFrame(check)

              // Fast path, detect if the value of the CSS Variable has changed before completely
              // computing the new value. Once we use `resolveCSSVariablePxValue` we will have to
              // compute the actual px value by injecting a temporary element into the DOM.
              //
              // This is a lot of work, so we want to avoid it if possible.
              let changed = false
              for (let [idx, variable] of variables.entries()) {
                let value = window.getComputedStyle(element).getPropertyValue(variable)
                if (history[idx] !== value) {
                  history[idx] = value
                  changed = true
                  break
                }
              }

              // Nothing changed, no need to perform the expensive computation.
              if (!changed) return

              let newResult = resolveCSSVariablePxValue(value, element)

              if (result !== newResult) {
                setValue(newResult)
                result = newResult
              }
            })
          }

          return d.dispose
        },
      ]
    }

    return [defaultValue, null]
  })

  let immediateValue = useMemo(() => computeValue(input, element)[0], [input, element])
  let [value = immediateValue, setValue] = useState()

  useIsoMorphicEffect(() => {
    let [value, watcher] = computeValue(input, element)
    setValue(value)

    if (!watcher) return
    return watcher(setValue)
  }, [input, element])

  return value
}

function resolveVariables(value) {
  let matches = /var\((.*)\)/.exec(value)
  if (matches) {
    let idx = matches[1].indexOf(',')
    if (idx === -1) {
      return [matches[1]]
    }

    let variable = matches[1].slice(0, idx).trim()
    let fallback = matches[1].slice(idx + 1).trim()

    if (fallback) {
      return [variable, ...resolveVariables(fallback)]
    }

    return [variable]
  }

  return []
}

function resolveCSSVariablePxValue(input, element) {
  // Resolve the value: Instead of trying to compute the value ourselves by converting rem /
  // vwh / ... values to pixels or by parsing out the fallback values and evaluating it
  // (because it can contain calc expressions or other variables).
  //
  // We will let the browser compute all of it by creating a temporary element and setting
  // the value as a CSS variable. Then we can read the computed value from the browser.
  //
  //
  // BUG REPORT ABOUT INCORRECT VALUES, look here:
  // ---------------------------------------------
  //
  // Currently this technically contains a bug because we are rendering a new element inside of the
  // current element. Which means that if the passed in element has CSS that looks like:
  //
  // ```css
  // .the-element {
  //   --the-variable: 1rem
  // }
  //
  // .the-element > * {
  //   --the-variable: 2rem
  // }
  // ```
  //
  // Then this will result to resolved value of `2rem`, instead of `1rem`
  let tmpEl = document.createElement('div')
  element.appendChild(tmpEl)

  // Set the value to `0px` otherwise if an invalid value is provided later the browser will read
  // out the default value.
  //
  // Didn't use `fontSize` because a `fontSize` can't be negative.
  tmpEl.style.setProperty('margin-top', '0px', 'important')

  // Set the new value, if this is invalid the previous value will be used.
  tmpEl.style.setProperty('margin-top', input, 'important')

  // Reading the `margin-top` will already be in pixels (e.g.: 123px).
  let pxValue = parseFloat(window.getComputedStyle(tmpEl).marginTop) || 0
  element.removeChild(tmpEl)

  return pxValue
}