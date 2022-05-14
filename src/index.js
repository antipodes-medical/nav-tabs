class Tabs extends HTMLElement {

	connectedCallback() {
		const tabs = Array.from(this.children);
		const hash = window.location.hash.replace('#', '');
		let currentTab = tabs[0];

		this.setAttribute('role', 'tablist');

		for (const [i, tab] of tabs.entries()) {
			const id = tab.getAttribute('href').replace('#', '');
			const tabPanel = document.getElementById(id);

			if (tab.getAttribute('aria-selected') === 'true' && hash === '') currentTab = tab;
			if (id === hash) currentTab = tab;

			// Add aria attributes on the tab
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-selected', 'false');
			tab.setAttribute('tabindex', '-1');
			tab.setAttribute('aria-controls', id);
			tab.setAttribute('id', `tab-${id}`);

			// Add aria attributes on the tab panel
			tabPanel.setAttribute('role', 'tabpanel');
			tabPanel.setAttribute('aria-labelledby', `tab-${id}`);
			tabPanel.setAttribute('hidden', 'hidden');
			tabPanel.setAttribute('tabindex', '0');

			// Keyboard navigation
			tab.addEventListener('keyup', e => {
				let index = null;

				if (e.key === 'ArrowRight') {
					index = i === tabs.length - 1 ? 0 : i + 1;
				} else if (e.key === 'ArrowLeft') {
					index = i === 0 ? tabs.length - 1 : i - 1;
				} else if (e.key === 'Home') {
					index = 0;
				} else if (e.key === 'End') {
					index = tabs.length - 1;
				}

				if (index !== null) {
					this.activate(tabs[index]);
					tabs[index].focus();
				}
			});

			// Mouse navigation
			tab.addEventListener('click', e => {
				e.preventDefault();
				this.activate(tab);
			});
		}

		this.activate(currentTab, false);
		if (currentTab.getAttribute('aria-controls') === hash) {
			const scrollPadding = 20;

			window.requestAnimationFrame(() => {
				window.scroll({
					left: 0,
					top: currentTab.getBoundingClientRect().top + window.scrollY - scrollPadding,
					behavior: 'smooth'
				});
			});
		}
	}

	/**
   * Activate a tab
   *
   * @param {Element} tab
   * @param {boolean} changeHash
   */
	activate(tab, changeHash = true) {
		const currentTab = this.querySelector('[aria-selected="true"]');
		if (currentTab !== null) {
			const tabPanel = document.getElementById(currentTab.getAttribute('aria-controls'));

			currentTab.setAttribute('aria-selected', 'false');
			currentTab.setAttribute('tabindex', '-1');
			tabPanel.setAttribute('hidden', 'hidden');
		}
		const id = tab.getAttribute('aria-controls');
		const tabPanel = document.getElementById(id);

		tab.setAttribute('aria-selected', 'true');
		tab.setAttribute('tabindex', '0');

		tabPanel.removeAttribute('hidden');
		if (changeHash) {
			window.history.replaceState({}, '', `#${id}`);
		}
	}

}

document.addEventListener('DOMContentLoaded', () => {
	customElements.define('nav-tabs', Tabs);
});