import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/product-data.seed';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService
  ){}
  async runSeed(user) {
    this.insertNewProducts(user)
    return `Seed executed`
  }


  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts()

    const products =  initialData.products;

    const insertPromise = []

    products.forEach(product => {
      this.productService.createProduct(product,user)
    })

  await Promise.all(insertPromise)

  return true
  }
}
