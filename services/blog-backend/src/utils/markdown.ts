
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOM window for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false
});

// Custom renderer for better HTML output
const renderer = new marked.Renderer();

// Custom heading renderer with anchor links
renderer.heading = (text: string, level: number) => {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `
    <h${level} id="${escapedText}">
      <a href="#${escapedText}" class="anchor-link">#</a>
      ${text}
    </h${level}>
  `;
};

// Custom code block renderer with syntax highlighting classes
renderer.code = (code: string, language?: string) => {
  const lang = language || 'text';
  return `<pre><code class="language-${lang}">${code}</code></pre>`;
};

// Custom image renderer with lazy loading
renderer.image = (href: string, title?: string, text?: string) => {
  return `<img src="${href}" alt="${text || ''}" title="${title || ''}" loading="lazy" />`;
};

marked.use({ renderer });

export const markdownToHtml = (markdown: string): string => {
  try {
    // Convert markdown to HTML
    const html = marked(markdown);
    
    // Sanitize HTML to prevent XSS
    const cleanHtml = purify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 's',
        'a', 'img', 'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'loading'
      ],
      ALLOW_DATA_ATTR: false
    });

    return cleanHtml;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
};

export const extractExcerpt = (content: string, maxLength: number = 160): string => {
  try {
    // Remove markdown syntax and get plain text
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/!\[(.*?)\]\(.*?\)/g, '') // Remove images
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Truncate at word boundary
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  } catch (error) {
    console.error('Error extracting excerpt:', error);
    return '';
  }
};

export const calculateReadingTime = (content: string): number => {
  try {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    
    // Remove markdown syntax and count words
    const plainText = content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/!\[(.*?)\]\(.*?\)/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return Math.max(1, readingTime); // Minimum 1 minute
  } catch (error) {
    console.error('Error calculating reading time:', error);
    return 1;
  }
};
