import { IProductInfo } from '../../types';
import { Model } from '../base/Model';

export class ProductCatalog extends Model<IProductInfo[]> {
	products: IProductInfo[] = [];

	setProductList(items: IProductInfo[]) {
		items.map((item) => this.products.push(item));
		this.emitChanges('items:changed', { products: this.products });
	}

	resetProductSelection(): void {
		this.products.forEach((product) => (product.inBasket = false));
		this.events.emit('catalog:update');
	}
}