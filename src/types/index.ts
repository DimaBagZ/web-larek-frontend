export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface IFormState {
	valid: boolean;
	errors: {};
}

export interface IModalData {
	content: HTMLElement;
}

export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export interface ISuccess {
	total: number;
}

export interface ISuccessActions {
	onClick: () => void;
}

export type CategoryType =
	| 'софт-скил'
	| 'хард-скил'
	| 'дополнительное'
	| 'другое'
	| 'кнопка';

export interface IBasket {
	products: IProduct[];
	total: number | null;
}
export interface IProduct {
	id: string;
	title: string;
	category: CategoryType;
	description: string;
	image: string;
	price: number | null;
	inBasket: boolean;
}

export type PaymentMethods = 'онлайн' | 'при получении';

export interface IDeliveryDetails {
	payment: PaymentMethods;
	address: string;
}

export interface IContacts {
	email: string;
	phone: string;
}

export interface IFormValidation {
	valid: boolean;
	errors: Partial<Record<keyof IOrder, string>>;
}

export type IOrder = IBasket & IDeliveryDetails & IContacts & IFormValidation;

export type ApiListResponse<Type> = {
	total: number;
	items: Type[];
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface ApiResponse {
	items: IProduct[];
}

export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
	eventName: string;
	data: unknown;
};

export interface IEvents {
	on<T extends object>(event: EventName, callback: (data: T) => void): void;
	emit<T extends object>(event: string, data?: T): void;
	trigger<T extends object>(
		event: string,
		context?: Partial<T>
	): (data: T) => void;
}