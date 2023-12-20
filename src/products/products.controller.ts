import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get(':term')
  getOneProduct(@Param('term') term: string) {
    return this.productsService.getOneProduct(term);
  }

  @Patch(':term')
  updateProduct(@Param('term') term: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(term, updateProductDto);
  }

  @Delete(':term')
  deleteProduct(@Param('term') term: string) {
    return this.productsService.deleteProduct(term);
  }
}
