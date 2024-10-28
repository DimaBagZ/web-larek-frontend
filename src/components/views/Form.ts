import { IEvents, IFormState } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${String(field)}:change`, {
			field,
			value,
		});
	}

	set isValid(value: boolean) {
		this._submit.disabled = !value;
	}

	set errorMessages(value: string) {
		this.setText(this._errors, value);
	}

	renderContent(state: Partial<T> & IFormState) {
		const { isValid, errorMessages, ...inputs } = state;
		super.renderContent({ isValid });
		Object.assign(this, inputs);
		return this.container;
	}
}