function parseButtonTouchTarget(ast, component_name) {
  const result = {};

  Babel.packages.traverse.default(ast, {
    JSXAttribute(path) {
      const parent = getParentObject(path);
      if (parent.name !== component_name) {
        return;
      }

      if (path.node.name.name === 'className') {
        if (result[component_name] === undefined) {
          result[component_name] = {};
        }

        result[component_name] = [`- "${path.node.value.value}"`];
      }
    }
  })

  return result;
}