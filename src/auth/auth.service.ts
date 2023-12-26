import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService')
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){

    }
    async createUser(createUserDto: CreateUserDto){

        try {
            const { password, ...userData } = createUserDto
    
            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10)
            })
            await this.userRepository.save(user)
            delete user.password
    
            return user;
        } catch (error) {
            this.handleDBErrors(error)
        }

    }

    async loginUser(LoginUserDto: LoginUserDto){
        const { password, email} = LoginUserDto

        const user = await this.userRepository.findOne({
            where: { email },
            select: {email: true, password: true}
        })

        if(!user)
            throw new UnauthorizedException(`Credentials are not valid (email)`)

        if(!bcrypt.compareSync(password, user.password ))
            throw new UnauthorizedException(`Credentials are not valid (password)`)

        delete user.password  
        return user
    }



    private handleDBErrors(error: any) {

        this.logger.error(error)

        throw new InternalServerErrorException(`Please check server logs`)
    }
}
