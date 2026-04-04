import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('EBANX Banking Core API')
    .setDescription(
      'API para gerenciamento de contas e eventos financeiros (depósitos, saques e transferências). ' +
        'Focado em consistência de estado e atomicidade de operações conforme o Case Técnico Software Engineer.',
    )
    .setVersion('1.0.0')
    .addTag('balance', 'Consulta de saldo de contas existentes')
    .addTag(
      'event',
      'Execução de operações financeiras (Deposit, Withdraw, Transfer)',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
