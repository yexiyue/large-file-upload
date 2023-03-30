import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(resolve(__dirname, '../public'));
  app.enableCors();
  /* 配置请求体大小限制 */
  app.use(
    json({
      limit: '50mb',
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      limit: '50mb',
    }),
  );
  await app.listen(3000);
}
bootstrap();
