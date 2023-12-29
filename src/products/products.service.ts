import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }


  async createProduct(createProductDto: CreateProductDto, user: User) {

    try {
      const { images = [], ...productDetails } = createProductDto

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user
      })

      await this.productRepository.save(product)

      return product;

    } catch (error) {
      this.logger.error(error)
    }

  }

  async getAllProducts() {
    try {
      const products = await this.productRepository.find({
        relations: {
          images: true
        }
      })

      return products;
    } catch (error) {
      console.log(error)
    }

  }

  async getOneProduct(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      product = await this.productRepository.findOneBy([
        { title: term },
        { slug: term }
      ])
    }

    if (!product)
      throw new NotFoundException(`Not found record with this term ${term}`)

    return product;
  }

  async updateProduct(term: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({
      id: term, // Con la funcion preload lo que hacemos es quie va a buscar con la primera propiedad, es decir id en este caso.
      ...toUpdate, // Con esto vamos a decir que prepare el objeto que ya ha conseguido y lo construya tal cual como lo que nos viene en toUpdate
      user
    })

    if (!product)
      throw new NotFoundException(`Not found record with this term ${term}`)

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id: term } })

        product.images = images.map(image => this.productImageRepository.create({ url: image }))

      }

      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction();

      await queryRunner.release();

      return product;

    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.logger.error(error)
    }

  }

  async deleteProduct(term: string) {
    const product = await this.getOneProduct(term)
    await this.productRepository.remove(product)
    return `Product with this term ${term} was removed`
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')

    try {
      return await query.delete().where({}).execute()
    } catch (error) {
      this.logger.error(error)
    }

  }
}
