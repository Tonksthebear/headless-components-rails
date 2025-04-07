import { Controller } from "@hotwired/stimulus"
import { TokenListObserver, ValueListObserver, Multimap } from "@hotwired/stimulus"
import { capitalize, camelize, namespaceCamelize } from "headless/string_helpers"

export default class extends Controller {
  initialize() {
    this.portaledIdentifiers = {}
    this.valueListObserver = null
  }

  connect() {
    top.controller = this
    this.#setupValueListObserverForPortal()
    this.valueListObserver.start()
  }

  disconnect() {
    this.valueListObserver?.stop()
    for (let identifierObject of Object.values(this.portaledIdentifiers)) {
      identifierObject.tokenListObserver?.stop()
      identifierObject.tokenListObserver = null
      identifierObject.controllers.forEach(controller => {
        this.#resetControllerMethods(controller)
      })
    }
  }

  sync(controller) {
    const identifier = controller.scope.identifier
    this.valueListObserver?.refresh()

    if (!this.portaledIdentifiers[identifier]) {
      this.#setupIdentifier(identifier, controller)
    } else {
      this.portaledIdentifiers[identifier].controllers.add(controller)
    }

    this.#overrideControllerMethods(controller)
    this.portaledIdentifiers[identifier].tokenListObserver?.start()
    this.portaledIdentifiers[identifier].valueListObserver?.start()
  }

  desync(controller) {
    const identifier = controller.scope.identifier
    if (this.portaledIdentifiers[identifier]) {
      if (this.portaledIdentifiers[identifier].controllers.has(controller)) {
        this.portaledIdentifiers[identifier].controllers.delete(controller)
        this.#resetControllerMethods(controller)
      }
    }
  }

  // Action management
  parseValueForToken({ content, element }) {
    const [action, rest] = content.split("->")
    const [identifier, method] = rest.split("#")
    const portaledActions = element.dataset.portaledActions || ""

    if (identifier === this.identifier || portaledActions.includes(content)) {
      return
    }

    const methodName = namespaceCamelize(identifier) + capitalize(method)

    if (!this[methodName]) {
      this[methodName] = (event) => {
        this.portaledIdentifiers[identifier]?.controllers.forEach(controller => {
          event.params = this.#getProxyParams(element, identifier)
          controller.context.invokeControllerMethod(method, event)
        })
      }
    }

    const updatedAction = `${action}->headless--portal#${methodName}`
    this.valueListObserver?.tokenListObserver?.pause(() => {
      element.dataset.portaledActions = portaledActions + " " + content
      element.dataset.action = element.dataset.action.replace(content, updatedAction)
    })
  }

  // Target management

  tokenMatched({ element, attributeName }) {
    const identifier = attributeName.split("data-")[1].split("-target")[0]
    if (!this.portaledIdentifiers[identifier].targetByName.hasValue(element)) {
      this.connectTarget(element, identifier)
    }
  }

  tokenUnmatched({ element, attributeName }) {
    const identifier = attributeName.split("data-")[1].split("-target")[0]
    this.disconnectTarget(element, identifier)
  }

  connectTarget(element, identifier) {
    const targetName = element.getAttribute(`data-${identifier}-target`)
    this.portaledIdentifiers[identifier].targetByName.add(targetName, element)
    this.portaledIdentifiers[identifier].controllers.forEach(controller => {
      controller.context.invokeControllerMethod(`${targetName}TargetConnected`, element)
    })
  }

  disconnectTarget(element, identifier) {
    const targetName = element.getAttribute(`data-${identifier}-target`)
    this.portaledIdentifiers[identifier].targetByName.delete(element)
    this.portaledIdentifiers[identifier].controllers.forEach(controller => {
      controller.context.invokeControllerMethod(`${targetName}TargetDisconnected`, element)
    })
  }

  disconnectAllTargets() {
    for (const name of this.targetsByName.keys) {
      for (const element of this.targetsByName.getValuesForKey(name)) {
        this.disconnectTarget(element, name)
      }
    }
  }

  // Identifier management
  #setupIdentifier(identifier, controller) {
    const attributeName = controller.context.targetObserver.attributeName

    this.portaledIdentifiers[identifier] = {
      controllers: new Set([controller]),
      targetByName: new Multimap(),
      tokenListObserver: null,
    }

    this.#setupTokenListObserverForPortal(identifier, attributeName)
  }

  // Listen for portaled targets
  #setupTokenListObserverForPortal(identifier, attributeName) {
    const tokenListObserver = new TokenListObserver(this.element, attributeName, this)
    this.portaledIdentifiers[identifier].tokenListObserver = tokenListObserver
  }

  // Listen for portaled actions
  #setupValueListObserverForPortal() {
    this.valueListObserver = new ValueListObserver(this.element, this.context.bindingObserver.actionAttribute, this)
  }

  // Override controller methods
  #overrideControllerMethods(controller) {
    const targetsToOverride = controller.constructor.targets
    const portalController = this

    targetsToOverride.forEach(name => {
      Object.defineProperty(controller, `${name}Targets`, {
        get: function () {
          const portaledTargets = portalController.portaledIdentifiers[controller.context.identifier].targetByName.getValuesForKey(name)
          const originalTargets = controller.targets.findAll(name);
          return [...new Set([...originalTargets, ...portaledTargets])]
        },
        configurable: true
      });

      Object.defineProperty(controller, `${name}Target`, {
        get: function () {
          const target = controller.targets.find(name)
          const portaledTargets = portalController.portaledIdentifiers[controller.context.identifier].targetByName.getValuesForKey(name)
          if (target) {
            return target
          } else if (portaledTargets[0]) {
            return portaledTargets[0]
          } else {
            throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`)
          }
        },
        configurable: true
      });

      Object.defineProperty(controller, `has${capitalize(name)}Target`, {
        get: function () {
          const portaledTargets = portalController.portaledIdentifiers[controller.context.identifier].targetByName.getValuesForKey(name)
          return controller.targets.has(name) || (portaledTargets[0] ? true : false)
        },
        configurable: true
      });
    })
  }

  #resetControllerMethods(controller) {
    const targetsToOverride = controller.constructor.targets

    targetsToOverride.forEach(name => {
      const proto = Object.getPrototypeOf(controller);
      const propertiesToReset = [
        `${name}Target`,
        `${name}Targets`,
        `has${capitalize(name)}Target`
      ];

      const originalDescriptors = {};
      propertiesToReset.forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
        if (descriptor) {
          originalDescriptors[prop] = {
            ...descriptor,
            configurable: true
          };
        }
      });

      Object.defineProperties(controller, originalDescriptors);
    })
  }

  #getProxyParams(element, identifier) {
    const params = {}
    const pattern = new RegExp(`^data-${identifier}-(.+)-param$`, "i")

    for (const { name, value } of Array.from(element.attributes)) {
      const match = name.match(pattern)
      const key = match && match[1]
      if (key) {
        params[camelize(key)] = this.#typecast(value)
      }
    }
    return params
  }

  #typecast(value) {
    try {
      return JSON.parse(value)
    } catch (o_O) {
      return value
    }
  }
}