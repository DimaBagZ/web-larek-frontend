import { IContacts, IEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Form } from './Form';

export class ContactForm extends Form<IContacts> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;
	protected _submitButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		// Поля ввода email и телефона
		this._email = ensureElement<HTMLInputElement>(
			'.form__input[name="email"]',
			container
		);
		this._phone = ensureElement<HTMLInputElement>(
			'.form__input[name="phone"]',
			container
		);

		this._email.addEventListener('input', () => this.handleInputChange());
		this._phone.addEventListener('input', () => this.handleInputChange());

		// Кнопка сабмита
		this._submitButton = ensureElement<HTMLButtonElement>(
			'.button[type="submit"]',
			container
		);
	}

	// Метод для сброса формы
	resetForm() {
		this._email.value = '';
		this._phone.value = '';
		this._submitButton.disabled = true;
	}

	// Проверка валидности формы и активация кнопки сабмита
	private handleInputChange() {
		const isFormValid =
			this._email.value.trim() !== '' && this._phone.value.trim() !== '';
		this._submitButton.disabled = !isFormValid;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}