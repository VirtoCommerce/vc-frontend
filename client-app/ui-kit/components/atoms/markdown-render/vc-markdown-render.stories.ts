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

const FULL_HTML_EXAMPLE = `
<h1>Heading 1</h1>

<p>This is a paragraph with <strong>bold text</strong>, <em>italic text</em>, and <strong><em>bold italic text</em></strong>. You can also use <del>strikethrough</del> for deleted content.</p>

<h2>Heading 2</h2>

<p>Here is a <a href="https://example.com">link to example</a> and some inline <code>code</code> within a sentence.</p>

<h3>Heading 3</h3>

<p>Unordered list:</p>
<ul>
  <li>First item</li>
  <li>Second item
    <ul>
      <li>Nested item A</li>
      <li>Nested item B</li>
    </ul>
  </li>
  <li>Third item</li>
</ul>

<h4>Heading 4</h4>

<p>Ordered list:</p>
<ol>
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>

<h5>Heading 5</h5>

<h6>Heading 6</h6>

<blockquote>
  <p>This is a blockquote. It can contain multiple lines of text and is often used for quotations or important notes.</p>
  <p>It can span multiple paragraphs.</p>
</blockquote>

<hr>

<h3>Code Block</h3>

<pre><code>function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}</code></pre>

<h3>Table</h3>

<table>
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
      <th>Quantity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Apple</td>
      <td>$1.00</td>
      <td>50</td>
    </tr>
    <tr>
      <td>Banana</td>
      <td>$0.50</td>
      <td>100</td>
    </tr>
    <tr>
      <td>Orange</td>
      <td>$0.75</td>
      <td>75</td>
    </tr>
  </tbody>
</table>

<h3>Image</h3>

<img src="https://www.shutterstock.com/image-photo/sun-sets-behind-mountain-ranges-600nw-2479236003.jpg" alt="Placeholder Image">

<hr>

<p>This concludes the HTML style showcase.</p>
`;

export default {
  title: "Components/Atoms/VcMarkdownRender",
  component: VcMarkdownRender,
  argTypes: {
    src: {
      control: "text",
      description: "Markdown or HTML source string to render",
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

export const BasicHtml: StoryType = {
  args: {
    src: FULL_HTML_EXAMPLE,
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
