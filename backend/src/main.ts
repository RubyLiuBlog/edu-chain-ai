import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 允许跨域
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 明确允许方法
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // 按需配置允许的请求头
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  })
  .catch((error) => {
    console.error('Error during bootstrap:', error);
    process.exit(1);
  });
