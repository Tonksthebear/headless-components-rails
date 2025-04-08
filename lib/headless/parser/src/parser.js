
function extractTailwindClasses(code, options = {}) {
  const { component_parsers = {} } = options; // e.g., { Checkbox: 'function scrapeCheckbox(path) {...}' }
  const ast = Babel.packages.parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });

  var result = {};
  component_parsers.forEach(parser => {
    const parserFunction = (typeof globalThis[parser.parser_function] === 'function') ? globalThis[parser.parser_function] : parseDefault;
    result = Object.assign({}, result, parserFunction(ast, parser.component));
  });

  return result;
}