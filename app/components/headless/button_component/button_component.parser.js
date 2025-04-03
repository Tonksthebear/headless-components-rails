function parseButton(ast, component_name) {
  const result = {};

  Babel.packages.traverse.default(ast, {
    VariableDeclarator(path) {
      if (path.node.id.name === "styles") {
        path.node.init.properties.forEach(property => {
          if (result[component_name] === undefined) {
            result[component_name] = {};
          }

          if (result[component_name][property.key.name] === undefined) {
            result[component_name][property.key.name] = [];
          }

          // console.log(property.value.elements)
          if (property.value.type === "ArrayExpression") {
            property.value.elements.forEach(propertyElement => {
              if (propertyElement.leadingComments) {
                propertyElement.leadingComments.forEach(comment => result[component_name][property.key.name].push(`# ${comment.value.trim()}`));
              }
              result[component_name][property.key.name].push(`- "${propertyElement.value}"`);
            })
          } else if (property.value.type === "ObjectExpression") {
            property.value.properties.forEach(attribute => {
              key = ""
              if (attribute.key.type === "StringLiteral") {
                key = attribute.key.value
              } else if (attribute.key.type === "Identifier") {
                key = attribute.key.name
              }

              if (result[component_name][key] === undefined) {
                result[component_name][key] = [];
              }

              if (attribute.value.type === "ArrayExpression") {
                attribute.value.elements.forEach(attributeElement => {
                  if (attributeElement.leadingComments) {
                    attributeElement.leadingComments.forEach(comment => result[component_name][key].push(`# ${comment.value.trim()}`));
                  }
                  result[component_name][key].push(`- "${attributeElement.value}"`);
                })
              } else {
                result[component_name][key].push(attribute.value.value);
              }
            })
          } else {
            console.log("Undefined", property.value.type);
            result[component_name][property.key.name].push(property.value.value);
          }
        });
      }
    }
  })

  return result;
}