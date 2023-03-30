import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: resolve(__dirname, '../public/image'),
        filename: (req, file, cb) => {
          console.log(req.file);
          return cb(null, `${Date.now() + extname(file.originalname)}`);
        },
      }),
      limits: {
        /* 上传文件大小 */
        fieldSize: 2 * 1024 * 1024,
      },
      preservePath: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
