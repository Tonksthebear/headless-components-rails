function parseDefault(ast, component_name) {
  const result = {};

  Babel.packages.traverse.default(ast, {
    CallExpression(path) {
      if (path.node.callee.name === 'clsx') {
        const parent = getParentObject(path);
        if (parent.name !== component_name) {
          return;
        }

        const kbdParent = getKbdParent(path);
        const memberExpressionParent = getJSXMemberExpressionParent(path);
        if (kbdParent) {
          setKbdClasses(result, parent.name, path.node.arguments);
        } else if (memberExpressionParent) {
          setContainingElementClasses(result, memberExpressionParent);
        } else {
          path.node.arguments.forEach(arg => {
            if (arg.type === 'StringLiteral') {
              if (result[parent.name] === undefined) {
                result[parent.name] = { classes: [] };
              }
              if (arg.leadingComments) {
                arg.leadingComments.forEach(comment => result[parent.name]["classes"].push(`# ${comment.value.trim()}`));
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
