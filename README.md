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

    
