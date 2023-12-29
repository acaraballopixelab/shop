import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';


@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  executeSeed(
    @GetUser() user: User
  ){
    return this.seedService.runSeed(user)
  }

}
