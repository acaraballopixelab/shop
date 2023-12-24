import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){

    }
    async createUser(createUserDto: CreateUserDto){
        const user = this.userRepository.create(createUserDto)
        await this.userRepository.save(user)
        return user;

    }

    loginUser(LoginUserDto: LoginUserDto){

    }
}
