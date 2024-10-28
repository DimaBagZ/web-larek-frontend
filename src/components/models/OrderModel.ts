import { IOrderDetails, PaymentOptions } from '../../types';
import { Model } from '../base/Model';

export class OrderModel extends Model<IOrderDetails> {
	items: string[] = [];
	total: number | null = null;
	payment: PaymentOptions = undefined;
	address: string = '';
	email: string = '';
	phone: string = '';
	isValid: boolean = false;
	errorMessages: Partial<Record<keyof IOrderDetails, string>>;

	validateContactDetails() {
		const regExpPhone = /(^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$)/;
		const regExpEmail =
			/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

		const errorMessages: typeof this.errorMessages = {};
		if (!this.email || !regExpEmail.test(this.email)) {
			errorMessages.email = 'укажите корректный email';
		}

		if (!this.phone || !regExpPhone.test(this.phone)) {
			errorMessages.phone = 'введите корректный номер';
		}
		this.errorMessages = errorMessages;
		this.events.emit('contactsErrors:change', this.errorMessages);
		return Object.keys(errorMessages).length === 0;
	}

	validateDeliveryDetails() {
		const errorMessages: typeof this.errorMessages = {};
		if (!this.payment) {
			errorMessages.payment = 'выберите способ оплаты';
		}
		if (!this.address) {
			errorMessages.address = 'укажите адрес';
		}
		this.errorMessages = errorMessages;
		this.events.emit('deliveryDetailsErrors:change', this.errorMessages);
		return Object.keys(errorMessages).length === 0;
	}

	clearOrderData() {
		this.items = [];
		this.total = null;
		this.payment = undefined;
		this.address = '';
		this.email = '';
		this.phone = '';
		this.isValid = false;
		this.errorMessages = {};
	}
}