import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }


  async createProduct(createProductDto: CreateProductDto) {

    try {
      const product = this.productRepository.create(createProductDto)

      await this.productRepository.save(product)

      return product;

    } catch (error) {
      this.logger.error(error)
    }

  }

  async getAllProducts() {
    try {
      const products = await this.productRepository.find()

      return products;
    } catch (error) {
      console.log(error)
    }

  }

  async getOneProduct(term: string) {
    let product: Product;

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({ id : term})
    }else {
      product = await this.productRepository.findOneBy([
        { title: term},
        { slug: term}
      ])
    }
    
    if(!product)
      throw new NotFoundException(`Not found record with this term ${term}`)

    return product;
  }

  async updateProduct(term: string, updateProductDto: UpdateProductDto) {
    const product = await this.getOneProduct(term)
    const { id } = product

    const newProduct = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })
    

    await this.productRepository.save(newProduct)

    return newProduct;
   
  }

  async deleteProduct(term: string) {
    const product = await this.getOneProduct(term)
    await this.productRepository.remove(product)
    return `Product with this term ${term} was removed`
  }
}
