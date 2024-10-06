import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
// import { SpelunkerModule } from 'nestjs-spelunker';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // console.log(SpelunkerModule.explore(app)); used for verify circular dependency by providing the dependency tree
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // ensuring smoother integration between class-validator and Nest.js.
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks(); // This is important for ensuring that all resources are properly released and the application shuts down cleanly.
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}

void bootstrap();
