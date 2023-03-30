import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname, resolve } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /* 使用formData上传单文件 */
  @Post('/upload_single')
  @UseInterceptors(FileInterceptor('file'))
  async single(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    await this.appService.delay(1000);
    return {
      code: 0,
      message: 'ok',
      originFilename: body.filename,
      servicePath: `http://localhost:3000/image/${file.filename}`,
      file,
    };
  }

  /* 使用formData上传单文件,手动处理文件名 */
  @Post('/upload_single_name')
  @UseInterceptors(
    FileInterceptor('file', {
      /* 可以配置storage选项为false就不会自动保存了 */
      storage: false,
    }),
  )
  async singleName(
    @UploadedFile() file: Express.Multer.File,
    @Body('filename') filename: string,
  ) {
    await this.appService.delay(1000);
    const path = resolve(__dirname, '../public', filename);
    /* 判断文件是否已经存在 */
    if (await this.appService.exists(path)) {
      return {
        code: 1,
        message: '文件已经存在',
        originFilename: filename,
        servicePath: `http://localhost:3000/${filename}`,
      };
    }
    try {
      await this.appService.writeFileByBuffer(file.buffer, path);
      return {
        code: 0,
        message: 'ok',
        originFilename: filename,
        servicePath: `http://localhost:3000/${filename}`,
        file,
      };
    } catch (error) {
      throw error;
    }
  }

  /* 使用base64和application/x-www-form-urlencoded方式上传图片 */
  @Post('/upload_single_base64')
  async singleBase64(@Body() body: { filename: string; file: string }) {
    await this.appService.delay(2000);

    /* 1.将base64进行url转义，然后截取，最后转buffer */
    const buffer = this.appService.base64ToFile(body.file);
    /* 2.使用spark-MD5模块，对文件进行加密返回唯一的hash值 */
    const hashName = this.appService.getHashName(buffer);
    /* 3.获取源文件的扩展名 */
    const extension = extname(body.filename);
    /* 4.拼接路径，返回将要保存文件的地址 */
    const path = this.appService.getFileSavePath(hashName, extension);
    /* 5.判断文件是否已经存在 */
    if (await this.appService.exists(path)) {
      return {
        code: 1,
        message: '文件已经存在',
        originFilename: body.filename,
        servicePath: `http://localhost:3000/${hashName}${extension}`,
      };
    }

    /* 6.将buffer写入文件中 */
    try {
      const res = await this.appService.writeFileByBuffer(buffer, path);
      if (res) {
        return {
          code: 0,
          message: 'ok',
          originFilename: body.filename,
          servicePath: `http://localhost:3000/${hashName}${extension}`,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        code: 1,
        message: JSON.stringify(error),
      };
    }
  }

  /* 多文件上传 */
  @Post('upload_multipart')
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: false,
    }),
  )
  async multiple(@UploadedFiles() files: Express.Multer.File[]) {
    const saveFiles = files.map((item) => {
      return {
        buffer: item.buffer,
        path: this.appService.getFileSavePath(
          this.appService.getHashName(item.buffer),
          extname(item.originalname),
        ),
      };
    });
    const res = await Promise.all(
      saveFiles.map(
        async (item) =>
          (await this.appService.exists(item.path)) ||
          this.appService.writeFileByBuffer(item.buffer, item.path),
      ),
    );
    return {
      code: 0,
      message: 'ok',
      originFilename: files.map((item) => item.originalname),
      servicePath: res,
    };
  }

  /* 获取切片上传中已经上传的切片 */
  @Get('/upload_already')
  async getAlready(@Query('hash') hash: string) {
    try {
      const res = await this.appService
        .getAlreadyFiles(hash)
        .then((res) => this.appService.softFile(res));
      return {
        code: 0,
        fileList: res,
        codeText: 'ok',
      };
    } catch (error) {
      return {
        code: 0,
        fileList: [],
        codeText: 'ok',
      };
    }
  }

  /* 对前端上传的切片进行接收 */
  @Post('/upload_chunk')
  @UseInterceptors(FileInterceptor('file', { storage: false }))
  async chunk(
    @UploadedFile() file: Express.Multer.File,
    @Body('filename') filename: string,
  ) {
    try {
      const res = await this.appService.writeChunkFile(filename, file.buffer);
      return {
        code: 0,
        filename: res,
        codeText: 'ok',
      };
    } catch (error) {
      throw new HttpException(
        'write_chunk_failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /* 对上传文件进行合并 */
  @Get('/upload_merge')
  async merge(
    @Query('hash') hash: string,
    @Query('count', ParseIntPipe) count: number,
  ) {
    await this.appService.delay(2000);
    const path = await this.appService.mergeChunks(hash, count);
    return {
      hash,
      code: 0,
      path,
    };
  }
}
