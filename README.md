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
