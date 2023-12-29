import { Controller, Get, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';


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
  @Auth(ValidRoles.admin, ValidRoles.superUser)
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
