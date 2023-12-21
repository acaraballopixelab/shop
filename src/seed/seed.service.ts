import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/product-data.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService
  ){}
  async runSeed() {
    this.insertNewProducts()
    return `Seed executred`
  }


  private async insertNewProducts() {
    await this.productService.deleteAllProducts()

    const products =  initialData.products;

    const insertPromise = []

    products.forEach(product => {
      insertPromise.push(this.productService.createProduct(product))
    })

  await Promise.all(insertPromise)

  return true
  }
}
