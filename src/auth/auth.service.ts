import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { jwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger('AuthService')
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) {

    }
    async createUser(createUserDto: CreateUserDto) {

        try {
            const { password, ...userData } = createUserDto

            const user = this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10)
            })
            await this.userRepository.save(user)
            delete user.password

            return {
                ...user,
                token: this.getJwTToken({ id: user.id })
            }
        } catch (error) {
            this.handleDBErrors(error)
        }

    }

    async loginUser(LoginUserDto: LoginUserDto) {
        const { password, email } = LoginUserDto

        const user = await this.userRepository.findOne({
            where: { email },
            select: { email: true, password: true, id: true }
        })
        
        if (!user)
            throw new UnauthorizedException(`Credentials are not valid (email)`)

        if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException(`Credentials are not valid (password)`)

        delete user.password
        return {
            ...user,
            token: this.getJwTToken({ id: user.id })
        }
    }

    private getJwTToken(payload: jwtPayload) {
        try {
            const token = this.jwtService.sign(payload)
            return token;
        } catch (error) {
            this.handleDBErrors(error)
        }
    }



    private handleDBErrors(error: any) {

        this.logger.error(error)

        throw new InternalServerErrorException(`Please check server logs`)
    }
}
