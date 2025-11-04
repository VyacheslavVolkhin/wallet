class ResponsiveMenu {
	constructor(menuContainer, menuSelector, moreItemSelector, dropdownSelector) {
		this.menuContainer = menuContainer;
		this.menu = menuContainer.querySelector(menuSelector);
		this.moreItem = this.menu.querySelector(moreItemSelector);
		this.dropdown = this.menu.querySelector(dropdownSelector);
		this.menuItems = Array.from(this.menu.children).filter(item => !item.classList.contains('menu-more'));
		
		this.init();
	}

	init() {
		this.calculateMenu();
		window.addEventListener('resize', () => this.calculateMenu());
	}

	calculateMenu() {
		// Сначала показываем все элементы
		this.menuItems.forEach(item => {
			item.style.display = 'block';
		});
		
		// Очищаем выпадающий список
		this.dropdown.innerHTML = '';
		
		const containerWidth = this.menuContainer.offsetWidth;
		let totalWidth = 0;
		let itemsToMove = [];
		
		// Измеряем ширину всех элементов, включая кнопку "Еще"
		this.menuItems.forEach((item, index) => {
			const itemWidth = item.offsetWidth;
			
			// Проверяем, помещается ли элемент вместе с кнопкой "Еще"
			if (totalWidth + itemWidth + this.moreItem.offsetWidth <= containerWidth) {
				totalWidth += itemWidth;
			} else {
				itemsToMove = this.menuItems.slice(index);
				itemsToMove.forEach(item => {
					item.style.display = 'none';
				});
				return;
			}
		});
		
		// Если есть элементы для перемещения - показываем кнопку "Еще"
		if (itemsToMove.length > 0) {
			this.moreItem.classList.add('active');
			this.populateDropdown(itemsToMove);
		} else {
			this.moreItem.classList.remove('active');
		}
	}

	populateDropdown(items) {
		items.forEach(item => {
			const clone = item.cloneNode(true);
			clone.style.display = 'block';
			this.dropdown.appendChild(clone);
		});
	}
}

// Инициализация меню после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
	const menuContainer = document.querySelector('.header .menu-container');
	new ResponsiveMenu(menuContainer, '.menu', '.menu-more', '.menu-more-ul');
});