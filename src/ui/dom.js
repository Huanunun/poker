/**
 * Minimal DOM helpers.
 *
 * The app re-renders whole views from state rather than diffing, so there is no
 * need for a framework. `el` covers everything: a tag with optional class,
 * attributes, and children.
 */

/**
 * @param {string} spec tag name, optionally with classes: "div.card-panel.wide"
 * @param {object|string|Node|Array} [props] attributes, or the first child
 * @param {...(string|Node|null|false)} children
 */
export function el(spec, props, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');

  if (props && typeof props === 'object' && !(props instanceof Node) && !Array.isArray(props)) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') node.className = [node.className, value].filter(Boolean).join(' ');
      else if (key === 'html') node.innerHTML = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
      else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) node.setAttribute(key, '');
      else node.setAttribute(key, value);
    }
  } else if (props !== undefined && props !== null) {
    children.unshift(props);
  }

  append(node, children);
  return node;
}

function append(node, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false || child === '') continue;
    if (Array.isArray(child)) append(node, child);
    else node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function mount(node, ...children) {
  clear(node);
  append(node, children);
  return node;
}

/**
 * A very small subset of Markdown, for lesson copy: **bold**, `code`, and
 * paragraph breaks on blank lines. Everything is escaped first, so lesson text
 * can never inject markup.
 */
export function richText(text) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** Render text with blank-line paragraph breaks into a container. */
export function paragraphs(text, className = '') {
  const wrap = el(`div${className ? `.${className}` : ''}`);
  for (const chunk of String(text).split(/\n\s*\n/)) {
    if (!chunk.trim()) continue;
    wrap.append(el('p', { html: richText(chunk.trim()) }));
  }
  return wrap;
}

/** One-line rich text as a span. */
export function line(text, spec = 'span') {
  return el(spec, { html: richText(text) });
}

export function pctText(fraction, places = 0) {
  return `${(fraction * 100).toFixed(places)}%`;
}

/** Announce something to screen readers without a visual change. */
export function announce(message) {
  let region = document.getElementById('sr-live');
  if (!region) {
    region = el('div', {
      id: 'sr-live',
      'aria-live': 'polite',
      style: {
        position: 'absolute', width: '1px', height: '1px',
        overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
      },
    });
    document.body.append(region);
  }
  region.textContent = message;
}
