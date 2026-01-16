import { VcMarkdownRender } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const FULL_MARKDOWN_EXAMPLE = `
# Heading 1

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use ~~strikethrough~~ for deleted content.

## Heading 2

Here is a [link to example](https://example.com) and some inline \`code\` within a sentence.

### Heading 3

Unordered list:
- First item
- Second item
  - Nested item A
  - Nested item B
- Third item

#### Heading 4

Ordered list:
1. First step
2. Second step
3. Third step

##### Heading 5

###### Heading 6

> This is a blockquote. It can contain multiple lines of text and is often used for quotations or important notes.
>
> It can span multiple paragraphs.

---

### Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
\`\`\`

### Table

| Product | Price | Quantity |
|---------|-------|----------|
| Apple   | $1.00 | 50       |
| Banana  | $0.50 | 100      |
| Orange  | $0.75 | 75       |

### Image

![Placeholder Image](https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg)

---

This concludes the markdown style showcase.
`;

export default {
  title: "Components/Atoms/VcMarkdownRender",
  component: VcMarkdownRender,
  argTypes: {
    src: {
      control: "text",
      description: "Markdown source string to render",
      type: { name: "string", required: true },
    },
  },
} as Meta<typeof VcMarkdownRender>;

type StoryType = StoryObj<typeof VcMarkdownRender>;

export const Basic: StoryType = {
  args: {
    src: FULL_MARKDOWN_EXAMPLE,
  },
};

export const Headings: StoryType = {
  args: {
    src: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`,
  },
};

export const TextFormatting: StoryType = {
  args: {
    src: `This is a paragraph with **bold text**, *italic text*, and ***bold italic text***.

You can use ~~strikethrough~~ for deleted content.

Here is some \`inline code\` within a sentence.`,
  },
};

export const Links: StoryType = {
  args: {
    src: `Check out [this link](https://example.com) for more information.

You can also use [reference-style links][ref].

[ref]: https://example.com "Example Reference"`,
  },
};

export const Lists: StoryType = {
  args: {
    src: `**Unordered List:**
- First item
- Second item
  - Nested item A
  - Nested item B
    - Deeply nested
- Third item

**Ordered List:**
1. First step
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B`,
  },
};

export const Blockquote: StoryType = {
  args: {
    src: `> This is a blockquote. It's commonly used for quotations or to highlight important information.
>
> Blockquotes can span multiple paragraphs and contain other markdown elements like **bold** and *italic* text.`,
  },
};

export const CodeBlocks: StoryType = {
  args: {
    src: `Inline \`code\` looks like this.

\`\`\`javascript
// JavaScript code block
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
\`\`\`

\`\`\`css
/* CSS code block */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\``,
  },
};

export const Table: StoryType = {
  args: {
    src: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1, Cell 1 | Row 1, Cell 2 | Row 1, Cell 3 |
| Row 2, Cell 1 | Row 2, Cell 2 | Row 2, Cell 3 |
| Row 3, Cell 1 | Row 3, Cell 2 | Row 3, Cell 3 |
| Row 4, Cell 1 | Row 4, Cell 2 | Row 4, Cell 3 |`,
  },
};

export const Image: StoryType = {
  args: {
    src: `![Sample Image](https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg)

Images are displayed as block elements with rounded corners.`,
  },
};

export const HorizontalRule: StoryType = {
  args: {
    src: `Content above the horizontal rule.

---

Content below the horizontal rule.`,
  },
};
