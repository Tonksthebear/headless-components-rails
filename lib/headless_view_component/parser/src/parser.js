const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function extractTailwindClasses(code) {
  const ast = babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  const result = {};

  // Helper to extract class lines and comments
  function extractClassLines(node) {
    const lines = [];

    if (node.leadingComments) {
      node.leadingComments.forEach(comment => lines.push(`# ${comment.value.trim()}`));
    }

    if (node.type === 'StringLiteral') {
      lines.push(`- "${node.value}"`);
    } else if (node.type === 'CallExpression' && node.callee.name === 'clsx') {
      node.arguments.forEach(arg => {
        if (arg.type === 'StringLiteral') {
          if (arg.leadingComments) {
            arg.leadingComments.forEach(comment => lines.push(`# ${comment.value.trim()}`));
          }
          lines.push(`- "${arg.value}"`);
        } else if (arg.type === 'ArrayExpression') {
          arg.elements.forEach(elem => {
            if (elem && elem.type === 'StringLiteral') {
              if (elem.leadingComments) {
                elem.leadingComments.forEach(comment => lines.push(`# ${comment.value.trim()}`));
              }
              lines.push(`- "${elem.value}"`);
            }
          });
        }
      });
    } else if (node.type === 'JSXExpressionContainer') {
      return extractClassLines(node.expression);
    }
    return lines;
  }

  // Helper to process a JSX node recursively
  function processJSXNode(node, variables = {}) {
    if (node.type === 'JSXElement') {
      const elementName = node.openingElement.name.name || 'unknown';
      const classLines = [];
      const nested = [];

      node.openingElement.attributes.forEach(attr => {
        if (attr.name && (attr.name.name === 'className' || attr.name.name === 'class')) {
          if (attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type === 'Identifier') {
            const varName = attr.value.expression.name;
            if (variables[varName]) {
              classLines.push(...variables[varName]);
            }
          } else {
            classLines.push(...extractClassLines(attr.value));
          }
        }
      });

      node.children.forEach(child => {
        const childInfo = processJSXNode(child, variables);
        if (childInfo && (childInfo.classLines.length > 0 || childInfo.nested.length > 0)) {
          nested.push(childInfo);
        }
      });

      return { name: elementName, classLines, nested };
    } else if (node.type === 'JSXExpressionContainer') {
      const expr = node.expression;
      if (expr.type === 'CallExpression' && expr.callee.property && expr.callee.property.name === 'map') {
        if (expr.arguments[0] && expr.arguments[0].body && expr.arguments[0].body.type === 'JSXElement') {
          return processJSXNode(expr.arguments[0].body, variables);
        }
      } else if (expr.type === 'ConditionalExpression') {
        const consequent = processJSXNode(expr.consequent, variables);
        const alternate = processJSXNode(expr.alternate, variables);
        // Combine results, assuming one defines the root classes
        if (consequent) return consequent;
        if (alternate) return alternate;
      }
    }
    return null;
  }

  // Traverse the AST
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration && declaration.type === 'FunctionDeclaration') {
        const funcName = declaration.id.name;
        const componentInfo = { classLines: [], nested: [] };
        const variables = {};

        // Capture variable declarations
        path.traverse({
          VariableDeclaration(varPath) {
            varPath.node.declarations.forEach(decl => {
              if (decl.init && decl.init.type === 'CallExpression' && decl.init.callee.name === 'clsx') {
                const varName = decl.id.name;
                variables[varName] = extractClassLines(decl.init);
              }
            });
          },
          ReturnStatement(returnPath) {
            const returnNode = returnPath.node;
            if (returnNode.argument) {
              const rootInfo = processJSXNode(returnNode.argument, variables);
              if (rootInfo) {
                componentInfo.classLines = rootInfo.classLines;
                componentInfo.nested = rootInfo.nested;
              }
            }
          },
        });

        // Include in result if we found any variable-defined classes or JSX
        if (variables['classes'] || componentInfo.classLines.length > 0 || componentInfo.nested.length > 0) {
          result[funcName] = componentInfo;
          if (variables['classes'] && componentInfo.classLines.length === 0) {
            componentInfo.classLines = variables['classes'];
          }
        }
      }
    },
  });

  return result;
}

// Expose to MiniRacer
globalThis.extractTailwindClasses = extractTailwindClasses;