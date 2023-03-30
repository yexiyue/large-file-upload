import { Injectable } from '@nestjs/common';
import {
  createWriteStream,
  access,
  constants,
  readdir,
  statSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  appendFileSync,
  readFileSync,
  rmSync,
} from 'fs';
import { readFile, appendFile, rm, unlink } from 'fs/promises';
import path, { resolve, extname, join } from 'path';
import { nextTick } from 'process';
import { ArrayBuffer } from 'spark-md5';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async delay(time: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

  /* 检查文件是否存在，即访问文件读写权限 */
  exists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      access(path, constants.F_OK, (err) => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  /* 将base64解码 */
  base64ToFile(file: string) {
    let res = decodeURIComponent(file);
    res = res.replace(/data:image\/\w+;base64,/, '');
    //使用buffer将base64转成buffer 二进制数据
    return Buffer.from(res, 'base64');
  }

  /* 获取唯一的hash name */
  getHashName(buffer: Buffer) {
    const spark = new ArrayBuffer();
    spark.append(buffer);
    return spark.end();
  }

  /* 文件保存路径 */
  getFileSavePath(hashName: string, extension?: string) {
    return resolve(
      __dirname,
      '../public',
      `${hashName}${extension ? extension : ''}`,
    );
  }

  /* 写入文件到指定路径 */
  writeFileByBuffer(file: Buffer, path: string): Promise<string> {
    return new Promise((res, reject) => {
      const writeStream = createWriteStream(path);
      writeStream.write(file, (err) => {
        if (err) {
          reject(err);
        }
        res(
          path.replace(
            resolve(__dirname, '../public') + '\\',
            'http://localhost:3000/',
          ),
        );
      });
    });
  }

  /* 读取目录获得已经上传的切片 */
  getAlreadyFiles(hash: string): Promise<string[]> {
    /* 通过文件hash值获取目录 */
    const path = this.getFileSavePath(hash);
    return new Promise((resolve) => {
      readdir(path, (err, files) => {
        if (err) {
          resolve([]);
        } else {
          resolve(files);
        }
      });
    });
  }

  /* 对文件进行排序 */
  softFile(files: string[]) {
    const regExp = /_(\d+)/;
    return files.sort((a, b) => {
      return +regExp.exec(a)[1] - +regExp.exec(b)[1];
    });
  }

  /* 根据切片文件名保存文件 */
  async writeChunkFile(hashName: string, file: Buffer) {
    const hash = hashName.split('_')[0];
    const dir = this.getFileSavePath(hash);
    /* 判断文件夹是否存在，不存在就创建 */
    try {
      statSync(dir);
    } catch (error) {
      mkdirSync(dir);
    }
    return await this.writeFileByBuffer(file, resolve(dir, hashName));
  }

  /* 进行合并操作 */
  async mergeChunks(hash: string, count: number) {
    //1.根据hash获取到存放的路径
    const dirPath = resolve(__dirname, '../public', hash);
    //2.验证文件夹是否存在
    const state = statSync(dirPath, {
      throwIfNoEntry: false,
    });
    if (!state) return 'hash is not exist';

    //3.读取文件夹下所有文件
    const files = readdirSync(dirPath);
    if (files.length < count) {
      return 'Incomplete slice';
    }

    //4.获取文件后缀
    const extension = extname(files[0]);

    //5.读取文件
    const executionQueue = this.softFile(files).map((file) => {
      return (): Promise<string> => {
        const path = resolve(dirPath, file);
        return new Promise((r) => {
          readFile(path).then((res) => {
            appendFile(this.getFileSavePath(hash, extension), res);
            r(path);
          });
        });
      };
    });

    executionQueue[Symbol.asyncIterator] = this.generateAsync;

    //6.写入文件(异步迭代生成器)
    try {
      for await (const fileBuffer of executionQueue) {
        console.log(`${fileBuffer}=====文件写入成功`);
      }
    } catch (error) {
      console.log(error);
    }
    //为啥不能删除文件，因为我读取文件时，程序占用了

    //7.返回最后的预览路径
    return `http://localhost:3000/${hash}${extension}`;
  }

  /* 批量按顺序读取文件 */
  async *generateAsync(this: (() => Promise<any>)[] | any) {
    for (const i of this) {
      yield i();
    }
  }

  /* 删除文件夹 */
  async removeDir(hash: string) {
    const files = await this.getAlreadyFiles(hash);
    const path = this.getFileSavePath(hash);

    files.forEach((item) => {
      console.log(join(path, item));
      unlinkSync(join(path, item));
    });
  }
}
