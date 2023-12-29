import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  createProduct(
    @GetUser() user: User,
    @Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto, user);
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
  updateProduct(@Param('term') term: string, @Body() updateProductDto: UpdateProductDto, @GetUser() user: User,) {
    return this.productsService.updateProduct(term, updateProductDto, user);
  }

  @Delete(':term')
  deleteProduct(@Param('term') term: string) {
    return this.productsService.deleteProduct(term);
  }
}
