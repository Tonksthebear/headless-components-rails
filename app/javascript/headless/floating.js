import { autoUpdate, computePosition, offset as offsetMiddleware, shift as shiftMiddleware, flip as flipMiddleware, size as sizeMiddleware } from '@floating-ui/dom'
import { innerMiddleware } from 'headless/inner' // Import the new inner middleware
// import { useFloating } from '@floating-ui/dom'
// import { useInnerOffset } from '@floating-ui/dom'
// import { useInteractions } from '@floating-ui/dom'

// Constants
const MINIMUM_ITEMS_VISIBLE = 4

/**
 * Resolves a CSS variable, string value (e.g., '10px', '1rem'), or number to a pixel value.
 * Uses the browser's computed style for accuracy with units, calc(), and variables.
 * @param {string|number|undefined} input - The value to resolve (e.g., 10, '10px', 'var(--my-var, 1rem)').
 * @param {HTMLElement} element - The element to compute the style against.
 * @returns {number} - The resolved pixel value, or 0 if resolution fails.
 */
function resolveCSSVariablePxValue(input, element) {
  // Nullish or non-string/non-number input -> 0
  if (input == null || (typeof input !== 'string' && typeof input !== 'number')) {
    return 0
  }

  // Number as-is
  if (typeof input === 'number') {
    return input
  }

  // String values: Use the temporary element technique
  // Check if element is actually in the DOM. If not, we can't compute styles.
  if (!element || !document.body.contains(element)) {
    console.warn('Cannot resolve CSS value: element is not in the DOM.', element);
    // Attempt to parse simple px value as a last resort
    const simplePx = parseFloat(input);
    return input.endsWith('px') && !isNaN(simplePx) ? simplePx : 0;
  }

  // Resolve the value: Instead of trying to compute the value ourselves,
  // let the browser compute it using a temporary element.
  let tmpEl = document.createElement('div');
  element.appendChild(tmpEl);

  // Set the value to `0px` otherwise if an invalid value is provided later the browser will read
  // out the default value. Use a property that accepts various units and negative values.
  tmpEl.style.setProperty('margin-top', '0px', 'important');

  // Set the new value, if this is invalid the previous value (0px) will be used.
  tmpEl.style.setProperty('margin-top', input, 'important');

  // Reading the `margin-top` will be in pixels (e.g., "16px").
  let pxValue = parseFloat(window.getComputedStyle(tmpEl).marginTop) || 0;
  element.removeChild(tmpEl);

  return pxValue;
}

/**
 * Creates a floating element that positions itself relative to a reference element
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.reference - The reference element to position against
 * @param {HTMLElement} options.floating - The floating element to position
 * @param {Object} [options.placement={ to: 'bottom', align: 'center' }] - Placement configuration
 * @param {string} [options.placement.to='bottom'] - The side to place the floating element on ('top', 'right', 'bottom', 'left', 'selection')
 * @param {string} [options.placement.align='center'] - The alignment of the floating element ('start', 'center', 'end')
 * @param {number|string} [options.gap='var(--anchor-gap, 0)'] - The gap between the reference and floating elements (number or CSS value)
 * @param {number|string} [options.offset='var(--anchor-offset, 0)'] - The offset to nudge the floating element (number or CSS value)
 * @param {number|string} [options.padding='var(--anchor-padding, 0)'] - The minimum space between the floating element and viewport (number or CSS value)
 * @param {boolean} [options.enabled=true] - Whether the floating element is enabled
 * @param {Object} [options.inner=null] - Inner positioning configuration (for 'selection' mode)
 * @param {HTMLElement} [options.inner.listRef=null] - The scrollable list element inside floating
 * @param {number} [options.inner.index=undefined] - The index of the active item in the list
 * @param {number} [options.inner.padding] - Optional padding for inner calculation (defaults to resolvedPadding).
 * @param {number} [options.inner.minItemsVisible] - Optional minimum items visible (defaults to MINIMUM_ITEMS_VISIBLE).
 * @param {number} [options.inner.referenceOverflowThreshold] - Optional threshold (defaults to resolvedPadding).
 * @returns {Function} - Cleanup function to remove the floating element and listeners
 */
export function createFloating({
  reference,
  floating,
  placement = {}, // Default object
  gap = 'var(--anchor-gap, 0)',
  offset = 'var(--anchor-offset, 0)',
  padding = 'var(--anchor-padding, 0)',
  enabled = true,
  inner = null
}) {
  if (!enabled || !reference || !floating) {
    return () => { } // Return no-op cleanup
  }


  // Resolve placement defaults
  const { to = 'bottom', align = 'center' } = placement;

  // Resolve CSS/number values - NOTE: This happens ONCE on setup.
  // For dynamic updates based on CSS variable changes, a more complex
  // observer/polling mechanism would be needed inside autoUpdate.
  const resolvedGap = resolveCSSVariablePxValue(gap, floating);
  const resolvedOffset = resolveCSSVariablePxValue(offset, floating);
  const resolvedPadding = resolveCSSVariablePxValue(padding, floating);

  // Calculate the placement string for floating-ui
  const placementString = to === 'selection'
    ? align === 'center'
      ? 'bottom' // Default for selection if no align
      : `bottom-${align}`
    : align === 'center'
      ? `${to}`
      : `${to}-${align}`;

  // Create middleware array
  const middleware = [
    // Offset middleware - defines the gap between reference and floating elements
    offsetMiddleware({
      mainAxis: to === 'selection' ? 0 : resolvedGap, // No gap for selection mode
      crossAxis: resolvedOffset,
    }),

    // Shift middleware - nudges the floating element to keep it in viewport
    shiftMiddleware({ padding: resolvedPadding }),

    // Flip middleware - swaps placement if there's not enough room (not for selection)
    to !== 'selection' && flipMiddleware({ padding: resolvedPadding }),

    // Conditionally add inner middleware for 'selection' mode
    to === 'selection' && inner && inner.listRef && typeof inner.index === 'number' && innerMiddleware({
      listRef: inner.listRef,
      index: inner.index,
      // Allow overriding defaults, otherwise use resolvedPadding / constant
      padding: inner.padding ?? resolvedPadding,
      minItemsVisible: inner.minItemsVisible ?? MINIMUM_ITEMS_VISIBLE,
      referenceOverflowThreshold: inner.referenceOverflowThreshold ?? resolvedPadding,
    }),

    // Size middleware - ensures the floating element doesn't overflow the viewport
    sizeMiddleware({
      padding: resolvedPadding,
      apply({ availableWidth, availableHeight, elements }) {
        // Check if elements.floating exists before styling
        if (elements.floating) {
          Object.assign(elements.floating.style, {
            overflow: 'auto', // Important for scrolling content
            maxWidth: `${availableWidth}px`,
            maxHeight: `min(var(--anchor-max-height, 100vh), ${availableHeight}px)`, // Use CSS var for external control + calculated max
          });
        }
      },
    }),
  ].filter(Boolean); // Filter out false values (like flip when to === 'selection')

  // Track inner offset for selection mode - To be handled by inner middleware later
  // let innerOffset = 0; // REMOVED - will be handled differently

  // Function to update inner offset - REMOVED - will be handled differently
  // const updateInnerOffset = (newOffset) => { ... }

  // Create the floating instance with autoUpdate
  const cleanupAutoUpdate = autoUpdate(reference, floating, () => {
    // Compute position using floating-ui
    computePosition(reference, floating, {
      placement: placementString,
      middleware,
    }).then(({ x, y, middlewareData, placement: actualPlacement }) => {
      // Apply position
      Object.assign(floating.style, {
        position: 'absolute', // Use 'absolute' or 'fixed' based on strategy (defaults to absolute)
        top: `${y ?? 0}px`, // Use ?? 0 for safety
        left: `${x ?? 0}px`, // Use ?? 0 for safety
        // Reset transform initially
        transform: '',
      });

      // Apply data attributes for styling based on *actual* placement
      const [actualTo, actualAlign = 'center'] = actualPlacement.split('-');
      // Map 'bottom' back to 'selection' for the data attribute if that was the original intent
      const finalAnchorTo = (to === 'selection' && actualTo === 'bottom') ? 'selection' : actualTo;
      floating.setAttribute('data-anchor', `${finalAnchorTo}${actualAlign !== 'center' ? ` ${actualAlign}` : ''}`);

      // --- Apply Inner Offset (if applicable) --- 
      const innerOffset = middlewareData.inner?.offset;
      if (typeof innerOffset === 'number' && innerOffset > 0) {
        floating.style.transform = `translateY(${innerOffset}px)`;
      } else {
        // Ensure transform is cleared if inner offset is not needed/calculated
        floating.style.transform = '';
      }
    });
  });

  // Fix scrolling pixel issue - setup mutation observer
  const cleanupScrollingFix = fixScrollingPixel(floating);

  // Return a combined cleanup function
  return () => {
    cleanupAutoUpdate(); // Stop autoUpdate
    if (cleanupScrollingFix) cleanupScrollingFix(); // Disconnect observer
    // Any other cleanup needed (e.g., removing listeners if added later)
  };
}

/**
 * Fixes a scrolling pixel issue where maxHeight can have fractional values
 * @param {HTMLElement} element - The element to fix
 * @returns {Function|null} - Cleanup function to disconnect observer, or null if no element
 */
function fixScrollingPixel(element) {
  if (!element) return null; // Return null if no element

  let observer = null; // Initialize observer

  // Use setTimeout to delay observation until element is likely mounted and styled
  const timeoutId = setTimeout(() => {
    // Check again if element exists before observing
    if (!element || !document.body.contains(element)) return;

    observer = new MutationObserver(() => {
      // Check if observer exists before accessing style
      if (!observer || !element) return;

      const maxHeight = window.getComputedStyle(element).maxHeight;

      const maxHeightFloat = parseFloat(maxHeight);
      if (isNaN(maxHeightFloat)) return;

      const maxHeightInt = parseInt(maxHeight); // Use parseInt directly
      if (isNaN(maxHeightInt)) return;

      if (maxHeightFloat !== maxHeightInt) {
        element.style.maxHeight = `${Math.ceil(maxHeightFloat)}px`;
      }
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style'],
    });
  }, 0); // Delay observation slightly


  // Return cleanup function
  return () => {
    clearTimeout(timeoutId); // Clear timeout if cleanup happens before observation starts
    if (observer) {
      observer.disconnect(); // Disconnect if observer was created
    }
  };
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

  const [to, align] = config.placement?.split(' ') || [null, null]

  // Resolve configuration
  const resolvedConfig = {
    to: to || 'bottom',
    align: align || 'center',
    gap: resolveCSSVariablePxValue(config.gap || 'var(--anchor-gap, 0)', floating),
    offset: resolveCSSVariablePxValue(config.offset || 'var(--anchor-offset, 0)', floating),
    padding: resolveCSSVariablePxValue(config.padding || 'var(--anchor-padding, 0)', floating),
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

// Removed original_resolveCSSVariablePxValue function (using resolveCSSVariablePxValue instead)

// Removed resolveVariables function (React hook helper)