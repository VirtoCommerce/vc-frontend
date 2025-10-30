/** @type {import('eslint').Rule.RuleModule} */

function removeTrailingWhitespace(text) {
  let endIndex = text.length;

  while (endIndex > 0 && /\s/.test(text[endIndex - 1])) {
    endIndex--;
  }

  return text.slice(0, endIndex);
}

function checkSiblings(parent, context, sourceCode) {
  if (!parent || !parent.children) return;

  const children = parent.children.filter((child) => {
    return child.type === "VElement" || child.type === "VComment";
  });

  for (let i = 0; i < children.length - 1; i++) {
    const current = children[i];
    const next = children[i + 1];

    const currentEnd = current.loc.end.line;
    const nextStart = next.loc.start.line;

    const linesBetween = nextStart - currentEnd;

    if (linesBetween < 2) {
      context.report({
        node: next,
        loc: {
          start: current.loc.end,
          end: next.loc.start,
        },
        messageId: "missingEmptyLine",
        fix(fixer) {
          const range = [current.range[1], next.range[0]];
          const textBetween = sourceCode.text.slice(range[0], range[1]);

          const nextLineText = sourceCode.lines[next.loc.start.line - 1];
          const indentMatch = /^[ \t]*/.exec(nextLineText);
          const indent = indentMatch ? indentMatch[0] : "";

          const cleanText = removeTrailingWhitespace(textBetween);
          const newText = cleanText + "\n\n" + indent;

          return fixer.replaceTextRange(range, newText);
        },
      });
    }

    if (current.type === "VElement") {
      checkSiblings(current, context, sourceCode);
    }
  }

  if (children.length > 0) {
    const last = children[children.length - 1];
    if (last.type === "VElement") {
      checkSiblings(last, context, sourceCode);
    }
  }
}

const rule = {
  meta: {
    type: "layout",
    docs: {
      description: "Require empty lines between sibling elements in Vue template",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      missingEmptyLine: "Expected empty line between sibling elements",
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    if (!context.getFilename().endsWith(".vue")) {
      return {};
    }

    return {
      Program(node) {
        const templateBody = node.templateBody;
        if (!templateBody) return;

        if (templateBody.type === "VElement") {
          checkSiblings(templateBody, context, sourceCode);
        }
      },
    };
  },
};

export default rule;
