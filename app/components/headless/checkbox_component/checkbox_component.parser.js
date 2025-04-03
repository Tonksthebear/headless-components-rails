function parseCheckbox(ast, component_name) {
  const result = {};

  Babel.packages.traverse.default(ast, {
    CallExpression(path) {
      if (path.node.callee.name === 'clsx') {
        const parent = getParentObject(path);
        if (parent.name !== component_name) {
          return;
        }
        path.node.arguments.forEach(arg => {
          if (arg.type === 'StringLiteral') {
            if (result[parent.name] === undefined) {
              result[parent.name] = [];
            }
            if (arg.leadingComments) {
              arg.leadingComments.forEach(comment => result[parent.name].push(`# ${comment.value.trim()}`));
            }
            result[parent.name].push(`- "${arg.value}"`);
          }
        });
      }
    },
  });
  return result;
}