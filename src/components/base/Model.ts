import { IEvents } from '../../types';

// Проверка на модель
export const isModel = (obj: unknown): obj is Model<any> => {
	return obj instanceof Model;
};

/**
 * Базовая модель, для отличия ее от простых объектов с данными
 */
export abstract class Model<T> {
	constructor(data: Partial<T>, protected events: IEvents) {
		Object.assign(this, data);
	}

	// Сообщить о смене модели
	emitChanges(event: string, payload?: object) {
		this.events.emit(event, payload ?? {});
	}
}