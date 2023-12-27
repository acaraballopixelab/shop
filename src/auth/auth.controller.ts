import { Controller, Get, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { User } from './entities/user.entity';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto){
    return this.authService.createUser(createUserDto)
  }  

  @Post('login')
  loginUser(@Body() LoginUserDto: LoginUserDto){
    return this.authService.loginUser(LoginUserDto)
  }

  @Get('private')
  // @SetMetadata('roles', ['admin','super-admin'])
  // @UseGuards(AuthGuard(), UserRoleGuard)
  @UseGuards(AuthGuard())
  private(
    @GetUser() user: User
  ){
    return {
      ok: true,
      message: 'This route is private',
      user
    }
  }
}
