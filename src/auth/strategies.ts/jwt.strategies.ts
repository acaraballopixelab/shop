import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { jwtPayload } from "../interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger = new Logger('JwtStrategy');
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }


    async validate(payload: jwtPayload): Promise<User>{
        try {
            const { id } = payload;
            const user = await this.userRepository.findOneBy({id})

            if(!user)
                throw new UnauthorizedException(`User not exist`)

            if(!user.isActive)
                throw new UnauthorizedException(`User is inactive, talk with an admin`);

            return user;

        } catch (error) {
            this.logger.error(error)
            throw new UnauthorizedException(`Token not valid`)
        }
    }
}