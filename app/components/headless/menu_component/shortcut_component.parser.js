function parseMenuShortcut(ast, component_name) {
  const result = {};


  Babel.packages.traverse.default(ast, {
    CallExpression(path) {
      if (path.node.callee.name === 'clsx') {
        const parent = getParentObject(path);
        if (parent.name !== component_name) {
          return;
        }

        const kbdParent = getKbdParent(path);
        if (kbdParent) {
          path.node.arguments.forEach(arg => {
            if (arg.type === 'ArrayExpression') {
              arg.elements.forEach(element => {
                if (element.type === 'StringLiteral') {
                  if (result[parent.name] === undefined) {
                    result[parent.name] = { classes: [] };
                  }
                  if (result[parent.name]["kbd"] === undefined) {
                    result[parent.name]["kbd"] = [];
                  }
                  if (element.leadingComments) {
                    element.leadingComments.forEach(comment => result[parent.name]["kbd"].push(`# ${comment.value.trim()}`));
                  }
                  result[parent.name]["kbd"].push(`- "${element.value}"`);
                }
              });
            }
          });

          const containingElementPath = getJSXParent(kbdParent); // Path to the parent JSX element

          if (containingElementPath) {
            const elementNameNode = containingElementPath.node.openingElement.name;
            let elementName;

            // Handle different types of JSX names
            if (elementNameNode.type === 'JSXIdentifier') {
              elementName = elementNameNode.name; // e.g., "div", "span"
            } else if (elementNameNode.type === 'JSXMemberExpression') {
              // For namespaced components like <Headless.Description>
              elementName = `${elementNameNode.object.name}.${elementNameNode.property.name}`;
            }
            result[parent.name]["nested"][elementNameNode.property.name] = elementName;
          }
        } else {
          path.node.arguments.forEach(arg => {
            if (arg.type === 'StringLiteral') {
              if (result[parent.name] === undefined) {
                result[parent.name] = { classes: [] };
              }
              if (arg.leadingComments) {
                arg.leadingComments.forEach(comment => result[parent.name].push(`# ${comment.value.trim()}`));
              }
              result[parent.name]["classes"].push(`- "${arg.value}"`);
            }
          });
        }
      }
    }
  })
  return result;
}
