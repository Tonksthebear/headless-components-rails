import { readInheritableStaticArrayValues } from "@hotwired/stimulus";
import { capitalize, namespaceCamelize } from "@hotwired/stimulus";
// Note: Importing Constructor and Controller is optional in JS unless used as values.
// They are omitted here since they were only used as types in TypeScript.

export function PortalPropertiesBlessing(constructor) {
  const portals = readInheritableStaticArrayValues(constructor, "portals");
  return portals.reduce((properties, portalDefinition) => {
    return Object.assign(properties, propertiesForPortalDefinition(portalDefinition));
  }, {});
}

function propertiesForPortalDefinition(name) {
  const camelizedName = namespaceCamelize(name);

  return {
    [`${camelizedName}Portal`]: {
      get: function () {
        const portalElement = this.portals.find(name);

        if (portalElement) {
          return portalElement;
        }

        throw new Error(
          `Missing portal element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching portal element using selector "${selector}".`
        );
      },
    },

    [`${camelizedName}Portals`]: {
      get: function () {
        const portals = this.portals.findAll(name);

        if (portals.length > 0) {
          return portals;
        }

        return [];
      },
    },

    [`has${capitalize(camelizedName)}Portal`]: {
      get: function () {
        return this.portals.has(name);
      },
    },
  };
}