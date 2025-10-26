# Accessibility Features

CheckMyOpsec is built with accessibility in mind to ensure all users can effectively use the application.

## Features Implemented

### 1. Dark Mode Support

**Theme Toggle**
- System preference detection (respects OS dark/light mode)
- Manual toggle available in navigation bar
- Smooth transitions between themes
- Persistent preference storage

**How to Use:**
- Click the sun/moon icon in the top navigation
- Or let the app follow your system preference automatically

**Keyboard Access:**
- Press `Tab` to navigate to the theme toggle
- Press `Enter` or `Space` to toggle between light/dark modes

### 2. Keyboard Navigation

**Skip to Content Link**
- Press `Tab` on any page to reveal "Skip to main content" link
- Bypasses navigation and jumps directly to page content
- Essential for keyboard-only users

**Tab Order**
- Logical tab order throughout the application
- All interactive elements are keyboard accessible
- Clear focus indicators on all focusable elements

**Keyboard Shortcuts:**
- `Tab` - Move forward through interactive elements
- `Shift + Tab` - Move backward through interactive elements
- `Enter` - Activate buttons and links
- `Space` - Toggle buttons (like theme toggle)
- `Escape` - Close modals and dropdowns (when implemented)

### 3. ARIA Labels & Attributes

**Navigation**
- `role="navigation"` on nav elements
- `aria-label` on navigation regions
- Descriptive link labels

**Forms**
- `aria-required="true"` on required fields
- `aria-invalid` for error states
- `aria-busy` for loading states
- Proper `autocomplete` attributes

**Alerts & Status**
- `role="alert"` for error messages
- `aria-live="polite"` for dynamic updates
- Screen reader friendly error messages

**Interactive Elements**
- Descriptive `aria-label` on icon buttons
- `sr-only` class for screen-reader-only text
- Hidden decorative elements from screen readers

### 4. Semantic HTML

**Proper Structure**
- Semantic HTML5 elements (`<nav>`, `<main>`, `<footer>`, `<article>`)
- Correct heading hierarchy (h1 → h2 → h3)
- Meaningful link text (no "click here")

**Form Labels**
- All form inputs have associated `<label>` elements
- Labels are properly linked with `htmlFor` / `id`
- Placeholder text supplements labels, doesn't replace them

### 5. Color Contrast

**WCAG AA Compliant**
- Minimum 4.5:1 contrast ratio for normal text
- 3:1 for large text and UI components
- Tested in both light and dark modes

**Status Indicators**
- Not relying solely on color to convey meaning
- Icons and text labels supplement color coding
- Clear visual hierarchy

### 6. Focus Management

**Visible Focus Indicators**
- Clear outline on focused elements
- Custom focus styles that work in both themes
- Keyboard navigation is always visible

**Focus Trapping**
- Modals trap focus when open (when implemented)
- Focus returns to trigger element when closed
- Logical focus order within components

## Testing Accessibility

### Keyboard Navigation Test
1. Navigate the entire site using only keyboard
2. Ensure all interactive elements are reachable
3. Verify focus indicators are visible
4. Test form submission with keyboard only

### Screen Reader Test
Compatible with:
- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS/iOS)
- **TalkBack** (Android)

Test checklist:
- [ ] All images have alt text
- [ ] Forms are properly labeled
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Navigation structure is logical

### Color Contrast Test
Use tools like:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Lighthouse
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Browser Support

Tested and working in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## Accessibility Standards

CheckMyOpsec aims to meet:
- **WCAG 2.1 Level AA** compliance
- **Section 508** requirements
- **ARIA 1.2** best practices

## Known Issues & Roadmap

### Current Limitations
- [ ] No dedicated skip links for repeated blocks
- [ ] Tab panels could use better ARIA support
- [ ] Loading states could be more descriptive

### Planned Improvements
- [ ] Add more comprehensive keyboard shortcuts
- [ ] Improve screen reader announcements for scan progress
- [ ] Add high contrast mode option
- [ ] Implement focus trap for modals
- [ ] Add reduced motion preferences support
- [ ] Font size controls
- [ ] Better mobile touch targets (minimum 44x44px)

## Reporting Accessibility Issues

If you encounter any accessibility barriers:

1. **GitHub Issues**: Report at https://github.com/yourusername/checkmyopsec/issues
2. **Email**: Include "Accessibility" in subject line
3. **Include**:
   - Your assistive technology (if any)
   - Browser and OS
   - Steps to reproduce
   - Expected vs actual behavior

## Development Guidelines

When contributing, please:

1. **Test keyboard navigation** for all new features
2. **Add ARIA labels** to interactive elements
3. **Maintain color contrast** in both themes
4. **Use semantic HTML** wherever possible
5. **Test with screen readers** when possible
6. **Check focus indicators** are visible
7. **Run Lighthouse** accessibility audits

### Code Examples

**Good - Accessible Button:**
```jsx
<button
  onClick={handleClick}
  aria-label="Delete scan result"
  disabled={loading}
  aria-busy={loading}
>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete</span>
</button>
```

**Good - Accessible Form:**
```jsx
<div className="space-y-2">
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <div id="email-error" role="alert">
      Please enter a valid email
    </div>
  )}
</div>
```

**Good - Skip Link:**
```jsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute ..."
>
  Skip to main content
</a>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [The A11Y Project](https://www.a11yproject.com/)

## License

Accessibility is a right, not a feature. This documentation is provided to help make the web more accessible for everyone.
