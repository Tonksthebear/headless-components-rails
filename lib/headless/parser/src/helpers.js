function getKbdParent(path) {
  return path.findParent(p => p.isJSXElement() && p.node.openingElement.name.name == "kbd")
}

function getJSXParent(path) {
  return path.findParent(p => p.isJSXOpeningElement())
}

function getJSXMemberExpressionParent(path) {
  return path.findParent(p => p.isJSXMemberExpression())
}

function getParentObject(path) {
  let currentPath = path;

  while (currentPath) {
    const parent = currentPath.findParent(p =>
      p.isFunctionDeclaration() ||
      p.isExportNamedDeclaration() ||
      p.isVariableDeclarator()
    );

    if (!parent) return { type: 'Unknown', name: 'global' };

    // If it's a VariableDeclarator, keep going up
    if (parent.isVariableDeclarator()) {
      currentPath = parent;
      continue;
    }

    // Handle FunctionDeclaration
    if (parent.isFunctionDeclaration()) {
      return { type: 'Function', name: parent.node.id.name };
    }

    // Handle ExportNamedDeclaration
    if (parent.isExportNamedDeclaration() && parent.node.declaration) {
      const decl = parent.node.declaration;
      if (decl.type === 'FunctionDeclaration') {
        return { type: 'Function', name: decl.id.name };
      }
      if (decl.type === 'VariableDeclaration') {
        return { type: 'Variable', name: decl.declarations[0].id.name };
      }
    }

    if (parent.isJSXElement()) {
      return { type: 'JSXElement', name: parent.node.name };
    }

    return { type: 'Unknown', name: 'unknown' };
  }

  return { type: 'Unknown', name: 'global' };
}

function setKbdClasses(result, path) {
  path.node.arguments.forEach(arg => {
    if (arg.type === 'ArrayExpression') {
      arg.elements.forEach(element => {
        if (element.type === 'StringLiteral') {
          if (result["kbd"] === undefined) {
            result["kbd"] = [];
          }
          if (element.leadingComments) {
            element.leadingComments.forEach(comment => result["kbd"].push(`# ${comment.value.trim()}`));
          }
          result["kbd"].push(`- "${element.value}"`);
        }
      });
    }
  });
}

function setContainingElementClasses(result, path) {
  const elementNameNode = path.node.openingElement.name;
  let elementName;

  // Handle different types of JSX names
  if (elementNameNode.type === 'JSXIdentifier') {
    elementName = elementNameNode.name; // e.g., "div", "span"
  } else if (elementNameNode.type === 'JSXMemberExpression') {
    // For namespaced components like <Headless.Description>
    elementName = `${elementNameNode.object.name}.${elementNameNode.property.name}`;
  }
  result[elementName] = elementName;
}

function setHashValue(hash, value, default_value = []) {
  if (hash === undefined) {
    hash = default_value;
  }
  if (value.leadingComments) {
    value.leadingComments.forEach(comment => hash.push(`# ${comment.value.trim()}`));
  }
  hash.push(`- "${value.value}"`);
}

function getMethods(obj) {
  return Object.getOwnPropertyNames(obj)
}

