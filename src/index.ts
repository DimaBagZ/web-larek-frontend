import './scss/styles.scss';

import { AppEventEmitter } from './components/base/AppEventEmitter';
import { ProductCatalog } from './components/models/ProductCatalog';
import { AppPage } from './components/views/AppPage';
import {
	IOrderDetails,
	IProductInfo,
	PaymentOptions,
	ApiResponse,
} from './types';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { ProductCard } from './components/views/ProductCard';
import { ModalWindow } from './components/views/ModalWindow';
import { ShoppingCart } from './components/models/ShoppingCart';
import { ShoppingCartView } from './components/views/ShoppingCartView';
import { DeliveryForm } from './components/views/DeliveryForm';
import { OrderModel } from './components/models/OrderModel';
import { ContactForm } from './components/views/ContactForm';
import { SuccessMessage } from './components/views/SuccessMessage';
import { ApiService } from './components/base/ApiService';

const apiService = new ApiService(API_URL);
const eventEmitter = new AppEventEmitter();

// Шаблоны
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cartItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const modalContainer = ensureElement<HTMLElement>('#modal-container');
const deliveryFormTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactFormTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successMessageTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модели
const productCatalog = new ProductCatalog([], eventEmitter);
const shoppingCart = new ShoppingCart({}, eventEmitter);
const orderDetails = new OrderModel({}, eventEmitter);

// Представления
const appPage = new AppPage(document.body, eventEmitter);
const modalWindow = new ModalWindow(modalContainer, eventEmitter);
const shoppingCartView = new ShoppingCartView(
	'basket',
	cloneTemplate(cartTemplate),
	eventEmitter
);
const deliveryForm = new DeliveryForm(
	cloneTemplate(deliveryFormTemplate),
	eventEmitter
);
const contactForm = new ContactForm(
	cloneTemplate(contactFormTemplate),
	eventEmitter
);
const successMessage = new SuccessMessage(
	'order-success',
	cloneTemplate(successMessageTemplate),
	{
		onClick: () => eventEmitter.emit('success:close'),
	}
);

// Получение списка товаров и обновление модели каталога
apiService
	.get('/product')
	.then((response: ApiResponse) => {
		productCatalog.setProductList(response.items as IProductInfo[]);
	})
	.catch((error) => {
		console.error(error);
	});

// Отображение товаров из каталога
eventEmitter.on('items:changed', () => {
	appPage.catalog = productCatalog.products.map((product) => {
		const catalogCard = new ProductCard(
			'card',
			cloneTemplate(catalogCardTemplate),
			{
				onClick: () => eventEmitter.emit('catalog:selectCard', product),
			}
		);
		return catalogCard.renderContent(product);
	});
});

// Открытие карточки товара
eventEmitter.on('catalog:selectCard', (product: IProductInfo) => {
	const previewCard = new ProductCard(
		'card',
		cloneTemplate(previewCardTemplate),
		{
			onClick: () => {
				eventEmitter.emit('modal:toBasket', product);
				previewCard.updateButtonLabel(product);
			},
		}
	);
	previewCard.updateButtonLabel(product);
	modalWindow.renderContent({ content: previewCard.renderContent(product) });
});

// Блокировка прокрутки при открытой модалке
eventEmitter.on('modal:open', () => {
	appPage.isScrollLocked = true;
});

// Разблокировка прокрутки при закрытии модалки
eventEmitter.on('modal:close', () => {
	appPage.isScrollLocked = false;
});

// Добавление или удаление из корзины
eventEmitter.on('modal:toBasket', (item: IProductInfo) => {
	shoppingCart.products.some((product) => product.id === item.id)
		? shoppingCart.removeProduct(item)
		: shoppingCart.addProduct(item);
	appPage.cartItemCount = shoppingCart.products.length;
	updateCartView();
});

// Обновление отображения товаров в корзине
function updateCartView() {
	shoppingCartView.items = shoppingCart.products.map((product, index) => {
		const cartItem = new ProductCard('card', cloneTemplate(cartItemTemplate), {
			onClick: () => eventEmitter.emit('basket:delete', product),
		});
		cartItem.displayIndex = index + 1;
		return cartItem.renderContent(product);
	});
}

// Открытие корзины
eventEmitter.on('basket:open', () => {
	modalWindow.renderContent({
		content: shoppingCartView.renderContent(shoppingCart),
	});
});

// Удаление из корзины
eventEmitter.on('basket:delete', (productToRemove: IProductInfo) => {
	shoppingCart.removeProduct(productToRemove);
	shoppingCartView.total = shoppingCart.total;
	appPage.cartItemCount = shoppingCart.products.length;
	updateCartView();
});

// Переход к оформлению заказа
eventEmitter.on('basket:order', () => {
	orderDetails.items = shoppingCart.products.map((product) => product.id);
	orderDetails.total = shoppingCart.total;

	if (orderDetails.validateDeliveryDetails()) {
		orderDetails.isValid = true;
	}

	modalWindow.renderContent({
		content: deliveryForm.renderContent(orderDetails),
	});
});

// Обработка изменения способа оплаты
eventEmitter.on(
	'payment:change',
	(data: { field: keyof IOrderDetails; value: PaymentOptions }) => {
		orderDetails.payment = data.value;
		orderDetails.validateDeliveryDetails();
	}
);

// Обработка изменения адреса доставки
eventEmitter.on(
	'address:change',
	(data: { field: keyof IOrderDetails; value: string }) => {
		orderDetails.address = data.value;
		orderDetails.validateDeliveryDetails();
	}
);

// Обновление состояния ошибок формы доставки
eventEmitter.on(
	'deliveryDetailsErrors:change',
	(errors: Partial<IOrderDetails>) => {
		deliveryForm.isValid = !Object.keys(errors).length;
		const errorMessage = Object.values(errors).join(' и ');
		deliveryForm.errorMessages =
			errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
	}
);

// Переход к заполнению контактных данных
eventEmitter.on('order:submit', () => {
	if (orderDetails.validateContactDetails()) {
		orderDetails.isValid = true;
	}
	modalWindow.renderContent({
		content: contactForm.renderContent(orderDetails),
	});
});

// Обработка изменения электронной почты
eventEmitter.on(
	'email:change',
	(data: { field: keyof IOrderDetails; value: string }) => {
		orderDetails.email = data.value;
		orderDetails.validateContactDetails();
	}
);

// Обработка изменения номера телефона
eventEmitter.on(
	'phone:change',
	(data: { field: keyof IOrderDetails; value: string }) => {
		orderDetails.phone = data.value;
		orderDetails.validateContactDetails();
	}
);

// Обновление состояния ошибок контактной формы
eventEmitter.on('contactsErrors:change', (errors: Partial<IOrderDetails>) => {
	contactForm.isValid = !Object.keys(errors).length;
	const errorMessage = Object.values(errors).join(' и ');
	contactForm.errorMessages =
		errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
});

// Отправка данных заказа и отображение успешного сообщения
eventEmitter.on('contacts:submit', () => {
	apiService
		.post('/order', orderDetails)
		.then(() => {
			modalWindow.renderContent({
				content: successMessage.renderContent({ total: orderDetails.total }),
			});
			orderDetails.clearOrderData();
			shoppingCart.clearCart();
			shoppingCartView.items = [];
			productCatalog.resetProductSelection();
			appPage.cartItemCount = shoppingCart.products.length;
		})
		.catch((error) => console.error(error));
});

// Закрытие сообщения об успешном заказе
eventEmitter.on('success:close', () => {
	modalWindow.close();
});