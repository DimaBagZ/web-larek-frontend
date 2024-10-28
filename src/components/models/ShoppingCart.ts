import { IProductInfo } from '../../types';
import { Model } from '../base/Model';

export class ShoppingCart extends Model<IProductInfo> {
	products: IProductInfo[] = [];
	total: number | null;

	private getTotalBasketPrice() {
		return this.products.reduce((sum, next) => sum + next.price, 0);
	}

	addProduct(product: IProductInfo) {
		product.inBasket = true;
		this.products.push(product);
		this.total = this.getTotalBasketPrice();
	}

	removeProduct(product: IProductInfo) {
		product.inBasket = false;
		this.products = this.products.filter((item) => item.id !== product.id);
		this.total = this.getTotalBasketPrice();
	}

	clearCart() {
		this.products = [];
		this.total = this.getTotalBasketPrice();
	}
}