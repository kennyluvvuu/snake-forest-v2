/**
 * Shared filter utility for catalog pages.
 * Usage: import and call initFilter() with appropriate selectors.
 */

export interface FilterOptions {
  /** Selector for the container holding filter buttons */
  filterContainerSelector: string;
  /** Selector for all filterable items */
  itemSelector: string;
  /** data-* attribute name on items to match against (without "data-") */
  itemDataKey: string;
  /** CSS classes for active button state (removed from inactive btns) */
  activeClasses: string[];
  /** CSS classes for inactive button state (removed from active btn) */
  inactiveClasses: string[];
}

export function initFilter(options: FilterOptions): void {
  const container = document.querySelector(options.filterContainerSelector);
  if (!container) return;

  const buttons = container.querySelectorAll<HTMLElement>('button[data-filter]');
  const items = document.querySelectorAll<HTMLElement>(options.itemSelector);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter') ?? 'all';

      // Update button styles
      buttons.forEach((btn) => {
        btn.classList.remove(...options.activeClasses);
        btn.classList.add(...options.inactiveClasses);
      });
      button.classList.remove(...options.inactiveClasses);
      button.classList.add(...options.activeClasses);

      // Show/hide items
      items.forEach((item) => {
        const value = item.dataset[options.itemDataKey] ?? '';
        const visible = filter === 'all' || value.includes(filter);
        item.style.display = visible ? 'block' : 'none';
      });
    });
  });
}
