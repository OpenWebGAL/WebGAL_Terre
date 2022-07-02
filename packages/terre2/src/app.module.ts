import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './Modules/hello/hello.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    HelloModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets', 'templates', 'WebGAL_Template'),
      serveRoot: '/Games/:gamename/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
