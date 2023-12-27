# Instalar Nest.js CLI: 
    1: Command line interface: npm i -g @nestjs/cli

# Crear nuevo proyecto de nest: 
    1: Command line interface: nest new nombre-proyecto

# Instalar dependencias: 
    1: Command line interface: npm install

# Iniciar servidor: 
    1: Command line interface: npm run start

# Iniciar servidor de desarrollo: 
    1: Command line interface: npm run start:dev

# Iniciar servidor de producción: 
    1: Command line interface: npm run start:prod

# Configuraciones

    1: Configurar nuestro archivo yaml.

    version: '3'

    services:
      db:
        image: postgres:14.3
        restart: always
        ports:
          - "5432:5432"
        environment:
          POSTGRES_PASSWORD: ${DB_PASSWORD}
          POSTGRES_DB: ${DB_NAME}
        container_name: shopdb
        volumes:
          - ./postgres:/var/lib/postgresql/data


    2: Configurar nuestro archivo environment.
    
    3: Importante descargar esta librería npm i --save @nestjs/config
    
    4: Sin haber instalado la libreria @nestjs/config, no podremos acceder a las variables de variables de entorno de nuestra aplicación. Las cuales estan ubicadas en el archivo .env de nuestro proyecto.
    
    5: Y luego en el archivo app.module importar este paquete en los imports ConfigModule.forRoot() ya que con esta configuración tendremos acceso a las variables de entorno que se declare en el archivo environment “.env” desde cualquier parte de la aplicación
    
    6: Configurar la conexión de nuestra app con la base de datos.
    
    7: Crear la conexión para visualizar nuestros registros en TablePlus.

# Líneas de configuración para la conexión con la base de datos
    Esta configuración debe aplicarse en el archivo app.module

    instalar los siguientes paquetes
    - npm install --save @nestjs/typeorm typeorm 
    - npm install pg --save


    TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: +process.env.DB_PORT,
                username: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                autoLoadEntities: true,
                synchronize: true,
            });

# Pasos a seguir luego de terminar las configuraciones.
    
    1: Ejecutar el comando docker-compose up -d asegurarnos que todo se ejecute sin errores
    
    2: Debemos excluir la carpeta ./postgres:/var/lib/postgresql/data que se va a crear en la raíz del directorio
    
    3: Luego de esto podremos volver a correr npm run start:dev y comprobar que todo se ejecute correctamente

# Modificando prefijos
    1: Podemos colocar prefijos a las rutas haciendo uso de la siguiente linea en el main.ts app.setGlobalPrefix('api'); 

# Librerias externas utiles
    1: npm i class-validator class-transformer
    
    2: Class validator es una librería de JavaScript que nos permite validar los datos de entrada de un formulario de manera muy sencilla. Class transformer es una librería que nos permite convertir un objeto en otro objeto de manera muy sencilla.
    
    3: Para aplicar esta configuración en nuestra aplicación solamente debemos aplicar estas líneas en nuestro archivo main.ts
    
    app.useGlobalPipes(
        new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        })
    )
    
    4: whiteList: Remueve todo lo que no está incluído en los DTOs
    
    5: forbidNonWhiteListed: Retorna bad request si hay propiedades en el objeto no requeridas

    6: Y de esta manera quedaria configurado un DTO como por ejemplo:
        import { IsIn, IsNumber, IsString } from "class-validator"

        export class CreateCarDto {

            @IsString()
            name: string

            @IsString()
            @IsIn(['Toyota','Chevrolet','Ford'])
            brand: string
            
            @IsNumber()
            serial: number
        }

    Y si yo mandara una peticion y en el json que yo envio por el body, violara o faltara alguno de estos valores que no son opcionales, entonces me arrojaria un error bastante especifico de cual propiedad es la que me esta fallando.

    NOTA: Es importante colocarle a cada atributo al menos un decorador con el tipo de atributo, ya que de lo contrario podria arrojarnos algun tipo de error o restriccion.


# Creando entidades para reflejarlas en nuestra base de datos.
    1. Podriamos empezar creando un nuevo modulo con el comando nest g res products
    2. Esto va crear un esqueleto de un CRUD en el cual estara creada una carpeta entity y adentro un archivo product.entity.ts
    3. Esto no es mas que una clase comun y corriente, pero para convertirla en una entidad y que nest junto con typeorm sepan que sera una tabla en BD hay que aplicarle un decorador, @Entity el cual se importa de typeorm
    4. import { Entity } from "typeorm"; y deberia quedar algo como esto.

        @Entity({ name: 'products'})
        export class Product(){
        }
    
    5. De esta forma la aplicacion y el ORM saben que esta clase es una entidad y se creara de esta forma en la base de datos.
    6. Se esta especificando el name y con ese name se creara la tabla en BD, pero si no se le especifica el name y se deja de esta formas @Entity(), entonces tomara por defecto el nombre de la clase y lo coloca en minuscula ( lowercase ) y en plural.
    7. El siguiente paso seria agregarle las propiedades ( columnas de la tabla ) y para que el ORM entienda que son Columnas debemos agregarle un decorador @Column(), quedaria de esta manera

        // El decorador PrimaryGeneratedColumn en typeOrm se utiliza para indicar que una columna es la clave primaria de la tabla. La columna debe ser de tipo entero y debe ser autoincrementable.
        @PrimaryGeneratedColumn('uuid')
        id: string;

        @Column('text', {
            unique: true,
        })
        title: string;

        // Validar que tipo de datos admite tu BD, en este caso es float
        // Intente con number pero me arrojaba error.
        @Column('float', {
            default: 0
        })
        price: number;

        // Esta seria otra manera de definir nuestras columnas y su tipo
        @Column({
            type: 'text',
            nullable: true
        })
        description: string;

        @Column('text', {
            unique: true
        })
        slug: string;

        // Se colcoa Int para validar que no puede tener decimales
        @Column('int', {
            default: 0
        })
        stock: number;

        @Column('text', {
            array: true
        })
        sizes: string[];

        @Column('text')
        gender: string;

        @Column('text', {
            array: true,
            default: []
        })
        tags: string[];
    
    8. Una vez creada la entidad, debemos hacer una configuracion en el modulo en el cual estamos creando la entidad, en este caso seria product.module.ts
    9. y debemos importar lo siguiente TypeOrmModule.forFeature(), Aqui se registran las entidades que queremos que este modulo mapee hacia la BD, ya sea una entidad o mas pero que esten asociadad a este mismo modulo, nos quedaria algo asi.
        
        imports: [
            TypeOrmModule.forFeature([Product])
        ]
    
    10. Y de esta manera al levantar nuestra aplicacion, se va a crear en nuestra BD esta tabla con todas sus propiedades gracias a que tenemos una propiedad en el app.module -> TypeOrmModule.forRoot() -> synchronize: true
    11. Gracias a esa propiedad se sincroniza de manera automatica nuestras entidades hacia la BD cada vez que se reinicia y actualiza alguna entidad.



#   Informacion de utilidad para identificar errores en Dtos y Entidades
    1. Normalmente si el error lo obtenemos en la respuesta de la API, es porque el error esta en el DTO, pero si el error lo obtenemos en el servidor, es porque el error esta en la entidad.
    2. Para identificar el error en el DTO, debemos revisar el DTO en cuestion y ver si el error esta en el DTO o en la entidad.
    3. Para identificar el error en la entidad, debemos revisar la entidad en cuestion y ver si el error esta en el DTO o en la entidad.

    4. Un error que podriamos obtener en el Dto es que intentemos crear el producto y este no se cree, si revisamos el log del server y nio tenemos errores, entonces revisamos el DTO, a menos que hayamos configurado bien nuestro Dto y de esa forma nos arrojaria la respuesta del error del DTO en la respuesta que nos envia el servidor.

#   Transacciones
    1. Debemos importar DataSource de typeorm y colocarlo en el constructor y quedaria de esta forma
       1.  private readonly dataSource: DataSource
    2. Debemos asignarlo a una variable justo donde vayamos a utilizarlo
       1. const queryRunner = this.dataSource.createQueryRunner();
    3. Hacer la conexion del queryRunner y es importante hacerlo con el await para que las siguientes operaciones no se realicen hasta que se establezca la conexion
       1. await queryRunner.connect();
    4. Iniciar la transaccion o transacciones, todo lo que se haga despues de este bloque de codigo que tenga que ver con queryRunner, lo va agregar en las transacciones
       1. await queryRunner.startTransaction();
    5. Una operacion consecuente del queryRunner puede ser 
       1. await queryRunner.manager.delete(ProductImage, { product: { id } });
       2. y esto aun no esta afectando la base de datos ya que se esta generando con el manage, es como que si lo agregara a la transaccion
       3. await queryRunner.manager.save(product) en este punto sigue sin afectar la base de datos, sigue guardado en la transaccion
       4. Si no ha dado error hasta el punto que queremos llegar, se puede hacer commit
       5. await queryRunner.commitTransaction(); y en este punto si se ha realizado cambio en la BD
       6. Luego de esto se cierra la conexion o el queryRunner
       7. await queryRunner.release(); con esto ya se cancela la conexion
       8. Y si quisieramos iniciar otro queryRunner tenemos que conectarnos como en el punto 3.1
       9. En dado caso de que de error, podemos manejarlo en el catch, pero justo antes de la linea del throw ya que ahi se detendria el codigo y no seguiria
       10. await queryRunner.rollbackTransaction(); podemos aplicar este fragmento de codigo y cancelamos la transaccion y de igual manera debemos realizar la desconexion del punto 5.7 y quedarnos algo asi
       11. await queryRunner.rollbackTransaction();
       12. await queryRunner.release();
       13. this.handleDBException(error) --> esto es igual a 
       14. throw new InternalServerErrorException(`Unexpected error, check server logs`) o al error que estemos manejando

#   Subiendo archivos
    1. Crear un nuevo resource para subir archivos
    2. nest g res files --no-spec
    3. necesitaremos multer para manejar nuestros archivos
    4. npm i -D @types/multer
    5.  @Post('product')
        @UseInterceptors(FileInterceptor('file', {
            fileFilter: fileFilter
        }))
        uploapFiles(@UploadedFile() file: Express.Multer.File) {
            
            if (!file) {
            return new BadRequestException(`Not file upload`)
            }
        
            return { fileName: file.originalname}
        }
    6. Con el codigo anterior nos aseguramos de crear el endpoint para recibir el archivo
    7. en @UseInterceptors tenemos una configuracion para manejar el tipó de archivo que queremos recibir y eso lo hacemos mediante un helper
    8. por eso tenemos este fragmento de codigo alli, "fileFilter: fileFilter"
    9. para eso creamos un archivo llamado fileFilter.helper.ts el cual se encuentra en src/helpers/fileFilter.helper.ts y alli tenemos toda la logica para manejar los tipos de archivos permitidos
    10. export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file)
        return callback(new Error('File is empty'), false)


    const fileExtension = file.mimetype.split('/')[1]
    const allowedExtension = ['jpg', 'jpeg', 'png', 'gif']

    if (!allowedExtension.includes(fileExtension))
        return callback(new Error('File extension is not allowed'), false)


    callback(null, true)
    }
    11. otra manera de hacerlo es ir a la documentacion de nest 'https://docs.nestjs.com/techniques/file-upload' y alli encontraremos pipes que podemos utilizar para todo tipo de validaciones.
    12. Para guardar nuestros archivos debemos agregar la siguiente configuracion 
    13. storage: diskStorage({
        destination: './static/uploads'
        })
    esto va igual abajo de fileFilter
    14. Y debemos crear tambien en nuestro directorio raiz, es decir afuera de src la carpeta static y adentro otra carpeta llamada uploads o como prefiramos
    15. static/uploads
    16. Nuestras imagenes se van a guardar hasta este punto pero sin una extension, por lo tanto deberiamos crear otro helper para crear un nombre aleatorio y concatenarle la extension y de esta manera nuestro codigo en el controlador quedaria asi
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer
    })
    Aqui agregamos el filename y el fileNamer es nuestro helper el cual se encuentra en src/helpers/fileNamer.helper.ts
    17. Este helper tiene la siguiente configuracion
    18. import { v4 as uuid} from 'uuid'

    export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file)
        return callback(new Error('File is empty'), false)

    const fileExtensionn = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExtensionn}`

    callback(null, fileName)
    }
    19. debemos instalar uuid ya que lo estamos utilizando aca para generar nombres aleatorios
    20. npm i uuid

#   NOTA IMPORTANTE
    1. Podemos crear un archivo adentro de nuestras carpetas vacias llamado .gitkeep
    2. Esto lo que hara es que si ese directorio o caropetya esta vacio, entonces git igual le hara seguimiento,
    3. Esto puede ser urtil para cuando creamos un directorio para guardar imagenes, pero aun no tenemos imagenes guardadas y de igual manera esa carpeta vacia sera subida a nuestro repo...


######   Seccion de AUTH   ######
    1. Crear el modulo de auth con nest g res auth
    2. Configuramos la entidad con todas sus propiedades y decoradores
    3. Luego configuramos el auth.module.ts con la importacion de TypeOrmModule.forFeature([User]) y si lo queremos usar en otro modulo lo exportamos, exports: [TypeOrmModule],
    4. Al reiniciar nuestro servidor deberia mapearnos la entidad a nuestra BD.
    5. El siguiente paso es crear un usuario el cual sera un metodo post en donde la ruta lucira algo asi, localhost:3000/api/auth/register
    6. Tambien necesitamos un DTO ya que es la manera como vamos a recibir de forma correcta los datos, pero no usaremos los mismos dto de auth, esos se borraran y crearemos uno personalizado. Creariamos un archivo que luciria asi
    7. create-user.dto.ts y en el colocaremos la siguiente configuracion
        
        import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

        export class CreateUserDto {

            @IsString()
            @IsEmail()
            email: string;

            @IsString()
            @MinLength(6)
            @MaxLength(50)
            @Matches(
                /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
                message: 'The password must have a Uppercase, lowercase letter and a number'
            })
            password: string;

            @IsString()
            fullName: string;
        }
    
    8. Luego debemos configurar el servicio para que podamos crear nuestro usuario.
    9. Nos aseguramos de crear el constructor y debemos hacer la inyeccion de nuestra entidad repositorio, de esta forma.

        constructor(
        @InjectRepository(User)
        <!-- Aqui debemos definir la inyeccion de nuestro repositorio que usara nuestro modelo y a Repository le debemos especificar el tipo de dato que va a manejar el cual es nuestra entidad User-->
        private readonly userRepository: Repository<User>
        
        ){}
    
        De esta forma haremos uso de los metodos que nos permtie hacer el ORM sobre nuestras entidades como por ejemplo.

        async create(createUserDto: CreateUserDto) {
            try {
                const user = await this.userRepository.create(createUserDto)
                await this.userRepository.save(user)
                return  user;
            } catch (error) {
                console.log(error)
            }
        }
    
    En donde el metodo create() va a preparar la data para convertirla en una Entidad compatible para ser guardada con todos los datos que le proveemos, y la data que le proveemos debe lucir como un usuario ya que lo especificamos en el tipo de dato que usa nuestro repositorio

    Y el metodo save se encarga de guardarlo o hacer el commit en base de datos.

#   Encriptando la contraseña, continuando el modulo de auth
    1. Lo primero sera instalar una libreria llamada bcrypt.
    2. npm i bcrypt
    3. Nos daremos cuenta que al importarlo nos dira que no tiene tipado estricto de typescript, por lo tanto nos sugiere instalar una nueva libreria
    4. npm i -D @types/bcrypt
    5. Luego podemos importar la libreria donde la vayamos a usar de esta manera.
    6. import * as bcrypt from 'bcrypt'
    7. Y luego para encriptar la contraseña popdemos hacer lo siguiente+
        
        const { password, ...userData } = createUserDto
        const user = this.userRepository.create({
            ...userData,
            password: bcrypt.hashSync(password, 10) // EN ESTE PUNTO LE PASAMOS LA VARIABLE QUE QUEREMOS ENCRIPTAR Y LA CANTIDAD DE SALTOS QUE DARA PARA ENCRIPTAR
        })
        await this.userRepository.save(user)
        return user;
    
    Y de esta manera ya tendremos nuestra password encriptada, y aunque utilicemos la misma contraseña, los hash van a ser distintos


#   Tip para la entidad de User
    1. En el caso de que no querramos regresar el password en el metodo findOne() de nuestro repositorio, podemos hacer lo siguiente.

        @Column('text',{
            select: false
        })
        password: string;

    de esta forma no se va a mostrar el password en el metodo findOne()

    2. Y ahora cuando usemos el metodo findOne() de nuestro repositorio y querramos obtener el password, debemos hacer lo siguiente.

        const user = this.userRepository.findOne(
            {
                where: { email },
                select: { email: true, password: true}
            })

        Y de esta manera retornamos la contraseña unicamente cuando la necesitamos, como por ejemplo en este caso la necesitamos para comparar y saber si hace match con el password que el usuario ingreso.

        if ( !user )
            throw new UnauthorizedException('Credentials are not valid (email)')
      
        if ( !bcrypt.compareSync(password, user.password) )
            throw new UnauthorizedException('Credentials are not valid (password)')

        y de esta manera validamos si el usuario existe, y en caso de existir validamos si la contraseña que esta enviando el usuario por el body, es igual a la que obtenemos de la base de datos.

#   Auth - Passport
    1. Para poder usar passport debemos instalarlo de la siguiente manera.
        npm i @nestjs/passport passport, tambien se podria instalar passport-local pero no lo usaremos local si no que haremos uso de JWT (Json Web Token) y por eso no lo instalaremos.
    2. Luego debemos instalar la libreria de passport-jwt y sus decoradores @nestjs/jwt
        npm i @nestjs/jwt passport-jwt
    3. Luego debemos instalar la libreria de @types/passport-jwt
        npm i -D @types/passport-jwt 
    4. Luego debemos configurar passport en el auth module. y decirle que tipo de estrategias usaremos
       1. PassportModule.register({ defaultStrategy: 'jwt'})
        
    5. Luego debemos configurar el jwt strategy en el auth module.
       1. JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        })

    6. En el caso de querer hacerlo asincrono ya que posiblemente obtengamos las configuraciones desde un desde una base de datos, debemos hacer lo siguiente. 
    7.  Yo Prefiero hacerlo de esta manera.

        import { ConfigModule, ConfigService } from '@nestjs/config';

        JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            
            if(configService.get('JWT_SECRET') === undefined) {
                throw new Error('JWT_SECRET is undefined');
            }
            if(configService.get('JWT_EXPIRES_IN') === undefined) {
                throw new Error('JWT_EXPIRES_IN is undefined');
            }
            return {
                secret: configService.get('JWT_SECRET'), // hacer esto es lo mismo que trabajar con process.env.NOMBRE_DE_LA_VARIABLE
                signOptions: configService.get('JWT_EXPIRES_IN') // OJO en esta parte de la configuracion ya que aca nos arroja un error de que no existe la option 0 y es porque la forma correcta es asi:
                // signOptions: {
                //     expiresIn: configService.get('JWT_EXPIRES_IN')
                // }

                fijense que faltaba la variable expiresIn.
            }
        }
        })

#   Tip teorico: Como se construye un token JWT ?
    Toma un header que contiene el algoritmo que se va a usar, y el tipo de token que se va a usar.
    Luego toma un payload que contiene la informacion que queremos que este en el token, en este caso el email del usuario.
    Luego toma un signature que es la firma del token, que es la que se usa para verificar que el token no haya sido modificado. y la firma del token no es nada mas que el valor que obtenemos de aqui configService.get('JWT_SECRET')

#   Tip teorico: Como se verifica un token JWT ?
    Primero se verifica el header y el payload, luego se verifica la firma, si todo esta bien se devuelve el payload.

#   Lo siguiente seria condfigurar el el strategie que usaremos y para eso crearemos una carpeta llamada strategies juntos con su interface
    1. En jwt-payload.strategy.ts debemos creear una clase que extienda de PassPortStrategy

    export class JwtStrategie extends PassportStrategy(Strategy, 'jwt')

    Todos los stategies, son providers por lo tanto se les coloca el decorador @Injectable()

    Y aparte debemos ir al auth module, providers y alli lo colocamos como un provider

    controllers: [AuthController],
    providers: [AuthService, JwtStrategie]

    y si queremos usarlo en otros lugares fuera tambien debemos exportarlo junto con estas otras propiedades

    exports: [TypeOrmModule, JwtStrategie, PassportModule, JwtModule]

#   El siguiente paso es utilizar el metodo sign en el servicio que deseamos serializar el jwt
    1.  este es el metodo que usaremos jwtService.sign(payload) y lo obtenemos de la dependencia que creamos en el constructor.

        private getJwtToken(payload: jwtPayload) {
            try {
                const token = this.jwtService.sign(payload)
                return token
            
            } catch (error) {
                this.logger.error(error)
            }
        }

        y el metodo jwtService.sign lo obtenemos de la dependencia que creamos en el constructor.

        private jwtService: JwtService
    
    2.  El el metodo getJwtToken(payload: jwtPayload) debemos pasarle el payload que queremos serializar, y este payload es el que se encuentra en el jwt-payload.strategy.ts el cual utilizamos aca

        async login(loginUserDto: LoginUserDto) {
            const { password, email } = loginUserDto

            const user = await this.userRepository.findOne(
            {
                where: { email },
                select: { email: true, password: true }
            })

            if (!user)
            throw new UnauthorizedException('Credentials are not valid (email)')

            if (!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException('Credentials are not valid (password)')

            return {
            ...user,
            token: this.getJwtToken({ email: user.email })
            };
        }

        Lo mismo hacemos para register o create que es donde creamos el usuario, en el return mandamos a serializar el jwt

#   Anteriormente se estaba utilizando el metodo Jwt para serializar el payload que es de tipo jwtPayload y alli teniamos el email, pero ahora queremos serializar el payload que tenga el id y no el email, por lo tanto debemos modificar el jwt-payload.interface.ts y esto nos pedira que modifiquemos los archivos donde lo utilizamos.

    export interface jwtPayload {
        id: string
    }

#   Custom Decorators obtener informacion del usuario que esta loguado en ese momento.
    1.  Para crear un decorator personalizado debemos crear una carpeta llamada decorators y dentro de esta un archivo llamado get-user.decorator.ts
    2.  Creamos una clase que extienda de createParamDecorator y le pasamos el parametro que queremos obtener del request

        export const GetUser = createParamDecorator(
            (data, ctx: ExecutionContext) => {
                const req = ctx.switchToHttp().getRequest()
                const user = req.user

                return user
            }
        )
    3. Este decorador lo usamos en el controlador de la misma manera como usariamos cualquier otro decorador por ejemplo el Body, Param y luego se le asigna a una variable
       1. Ejemplo: @GetUser() user: User
       2. para finalmente quedarnos algo asi en el controlador

        @Get('private')
        @UseGuards(AuthGuard())
        testingPrivateRoute(
            @GetUser() user: User
        ){
            console.log(user)
            return {
                ok: true,
                message: 'This route is private',
                user
            }
        }

        y la respuesta que vamos a recibir seria esta


        {
            "ok": true,
            "message": "This route is private",
            "user": {
                "id": "55674221-1988-40c2-b7ca-7e08e1ccfeca",
                "email": "carabalapp@gmail.com",
                "password": "$2b$10$5EQbZ8TGhE7GQ1xPn4K8rOEPZQ9VsZEmc4ncnzBt8tFKNvQXztWyq",
                "fullName": "Adrian Caraballo",
                "isActive": true,
                "roles": [
                    "user"
                ]
            }
        }

        Y esto gracias a que con el decorador AuthGuard() obtenemos toda la informacion del usuario desde el bearertoken y lo guardamos en el request.user.

#   Creando un Custom Decorator para obtener los rawHeaders

    1. Si utilizamos en el controlador el decorador @Req() req: Express.Request y hacemos un console.log(req) vamos a ver muchasd propiedad propiedads que nos da el request y entre ellas esta el rawHeaders que nos da la informacion de los headers que enviamos en el request. Entonces creemos un decorador tal y como lo hicimops con el anterior
    2. Primero creamos una carpeta llamada decorators y dentro de esta un archivo llamado get-raw-headers.decorator.ts
    3. Luego creamos una clase que extienda de createParamDecorator y le pasamos el parametro que queremos obtener del request

        export const GetRawHeaders = createParamDecorator(
            (data, ctx: ExecutionContext) => {
                const req = ctx.switchToHttp().getRequest()
                const rawHeaders = req.rawHeaders

                return rawHeaders
            }
        )
    4. El siguiente paso es usar el decorador en el controlador
    5. Ejemplo: @GetRawHeaders() rawHeaders: string[]
    6. Y luego en imprimimos rawHeaders y veremos toda la informacion de los headers que enviamos en el request.
    7. El createParamDecorator() es un decorador que nos permite obtener informacion del request. y lo importamos de @nestjs/common
    8. Y ExecutionContext es un tipo de dato que nos permite obtener informacion del request. y lo importamos de @nestjs/common.
    9. Y el ctx.switchToHttp().getRequest() nos permite obtener el request. y lo importamos de @nestjs/common.
    10. Y el req.rawHeaders nos permite obtener la informacion de los headers que enviamos en el request.


#   Creando Guards personalizados para manejar el acceso de los roles

    1. Para manejar el acceso de los roles vamos a crear un guard personalizado que se encargue de manejar el acceso de los roles.
    2. Utilizando el siguiente comando nest g gu auth/guards/userRole --no-spec
    3. Esto creara un guard en la carpeta auth y luego creara la carpeta guards y luego el nombre del archivo y la clase
    4. Para que un guard sea valido debe implementar el metodo CanActivate el cual retorna tru op false y si es true lo deja pasar y si es falso no
    5. ¡¡ OJO !! @UseGuards( AuthGuard(), UserRoleGuard ) de esta manera implementamos nuestro Guard personalizado y el AuthGuard() es el guard que nos permite obtener la informacion del usuario desde el bearertoken.
    6. Y el UserRoleGuard es el guard que nos permite manejar el acceso de los roles.
    7. Sin embargo debemos tener en cuenta que los guards creados por nosotros no tienen parentesis y los que ya vienen por defecto desde nest, si llevan.
    8. A menos que creemos una instancia de nuestro guard y quedaria asi new UserRoleGuard(), pero no se recomienda crear instancia, asi que lo dejamos de esta manera @UseGuards( AuthGuard(), UserRoleGuard )
    9. Otra ventaja es que se encuentran adentro de nuestro ciclo de vida de la aplicacion por lo tanto nosotros podemos tener acceso al request y al response.
    10. Nosotros vamos a necesitar hacer uso de una inyeccion de Reflector en el constructor de nuestro guard.
    11. constructor ( private readonly reflector: Reflector ) esto me va ayudar a obtener informaciopn de los decoradores y otra informacion de la metadata
    12. Y de esta manera hacemos uso de reflector para obtener los datos de los decoradores.
    
    const validRoles: string[] = this.reflector.get(
      'roles',
      context.getHandler(),
    );

    console.log({validRoles})

    return true;

    13. Haciendo ese console.log() podemos ver que nos devuelve un arreglo de roles y si no hay roles nos devuelve un arreglo vacio.
    ['admin', 'super-user'] que son los values del key 'roles' que colocamos en el controlador

    luego con el siguiente codigo:

    const req = context.switchToHttp().getRequest()
        const user = req.user


        if(!user)
            throw new InternalServerErrorException(`User not found (request)`)
    
    el cual es muy parecido al que tenemos en nuestro decorador de obtener los datos del usuario, podemos saber que rol tiene el usuario.

    for (const role of user.roles) {
      if(validRoles.includes(role)){
        return true
      }
    }

    throw new ForbiddenException(`User ${user.fullName} need a valid role: [${ validRoles }]`)

    Y con este codigo validamos si el rol o los roles que tiene el usuario se encuentran en el array de roles validRoles que seteamos en el @SetMetadata( 'roles', ['admin', 'super-user'] )


#   Creando decoradores con nest/CLI para manejar los roles
    1. nest g d auth/decorators/roleProtected --no-spec
    2. Y con el siguiente codigo estariamos creando un decorador que nos retorna exactamente lo mismo que nosotros necesitabamos con el decorador de @SetMetadata( 'roles', ['admin', 'super-user'] ).
    
    import { SetMetadata } from '@nestjs/common';

    export const META_ROLES = 'roles'

    export const RoleProtected = (...args: string[]) => {

        return SetMetadata(META_ROLES, args)
    };
        
    3. Y ahora en nuestro controlador podemos hacer uso de este decorador para validar los roles.
    @Get( 'private2' )
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards( AuthGuard(), UserRoleGuard )

    Y de esta fotma ya habriamos reemplazado el @SetMetadata( META_ROLES, ['admin', 'super-user'] ) por el decorador RoleProtected.


#   Creando una composicion de decoradores - > Esto consiste en crear un decorador que combine varios decoradores. y los ejecutemos de manera ordenada.

    1.  Primero crearemos un nuevo decorador con el siguiente comando:
    2.  nest g d auth/decorators/auth --no-spec
    3.  Luego aplicaremos 

    Nos quedara algo asi:
    import { UseGuards, applyDecorators } from "@nestjs/common";
    import { ValidRoles } from "../interfaces";
    import { AuthGuard } from "@nestjs/passport";
    import { UserRoleGuard } from "../guards/user-role/user-role.guard";
    import { RoleProtected } from "./role-protected.decorator";

    export function Auth(...roles: ValidRoles[]) {
        return applyDecorators(
            UseGuards(AuthGuard(), UserRoleGuard ),
            RoleProtected(ValidRoles.admin, ValidRoles.superUser)
        );
    }

    Observar bien que ningun Decorador o guard tiene tiene un @.
    Para finalizar en nuestro controlador podemos hacer uso de este decorador.

    @Get( 'private3' )
    @Auth(ValidRoles.admin, ValidRoles.superUser) // Aca estamos haciendo uso de 2 decoradores en 1 solo, el Auth y el RoleProtected. Podemos hacer uso de varios decoradores en 1 solo. y si queremos tener mas informacion solo tenemos que hjacer ctrl + click sobre la funcion y veremos la manera como lo implementamos para saber que sabeer como se ejecuta y que parametros necesitamos.

#   Usando el decorador Auth personalizado por nosotros, en otros modulos

    1. Es tan facil como ir al modulo donde queremos usar el decorador y hacer uso de el.

    import { Auth } from "src/auth/decorators/auth.decorator";
    
    @Get()
    @Auth(ValidRoles.admin)
    executeSeed() {
        return this.seedService.runSeed()
    }

    Pero si solo hacemos obtendremos un error parecido a este: 
    ** [Nest] 40124  - 24/12/2023 8:34:26 p. m.   ERROR [AuthGuard] In order to use "defaultStrategy", please, ensure to import PassportModule in each place where AuthGuard() is being used. Otherwise, passport won't work correctly. **

    Y se soluciona muy facil, Solo debemos importar el aurth.module.ts en los imports de seed.module.ts

    @Module({
    controllers: [SeedController],
    providers: [SeedService],
    imports: [ ProductsModule, AuthModule ]
    })

    Y va a funcionar sin tener que importar nada mas, ya que todas las importaciones y exportaciones necesarias las realizamos en el AuthModule.


    Y si decidiera que todos los endpoints de una clase tuvieran que estar protegidos, solo tendriamos que hacer lo siguiente:

    import { Auth } from "src/auth/decorators/auth.decorator";

    @Controller('products')
    @Auth(ValidRoles.admin)
    export class ProductsController {
        constructor(private productsService: ProductsService) {}
    }

    Bastaria con tan solo colocarlo para toda la clase y hace un efecto en cadena para todos los endpoints pertenecientes a esa clase.

#   El siguiente paso es crear la relacion entre el usuario y el producto, saber que usuario creo un producto

    En la entidad de usuarios tendremos una relacion uno a muchos con productos.
    Es decir, un usuario puede estar asociado a muchos productos creados
    
    @OneToMany( () => Product, (product) => product.user )
    products: Product[];

    Y en la entidad de productos creamos una relacion de muchos a uno con usuarios.
    Es decir, un producto puede estar asociado a un solo usuario.

    @ManyToOne(
        () => User,
        user => user.product,
        { eager: true }
    )
    user: User

    Aca se coloca el eager : true, para que cada vez que solicitemos los productos nos traiga automaticamente la relacion con los usuarios sin necesidad de solicitar el relation en la peticion



#   Errores y posibles soluciones
    1. cuando tengamos este error

    {
        "message": "User not found (request)",
        "error": "Internal Server Error",
        "statusCode": 500
    }

    Posiblemente no tengamos declarado el guard @UseGuards(AuthGuard(), UserRoleGuard) en la ruta del controlador que estamos usando

    2. El error unhautorized 

    Es porque el token ( bearer token ) ya expiro y necesitamos renovarlo. En este caso es iniciando sesion o creando el nuevo usuario
    
    3. Es posible que nosotros hayamos creado una condicion de que si no pasamos propiedades a 
    4. @RoleProtected(ValidRoles.admin, ValidRoles.superUser). si no que lo dejamos de la manera como lo explicamos abajo.
    5. @RoleProtected(), es posible que igual nos de acceso a la ruta ya que si no pasamos los usuarios validos entonces es porque queremos darle acceso a cualquiera

#   NOTA: Si a una funcion se le coloca que el tipo de dato que retorna es never, entonces nunca vamos a retornar ningun valor. asi coloquemos un return lo que sea nos va marcar una linea de error
