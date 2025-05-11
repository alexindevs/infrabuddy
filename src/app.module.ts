import { Module } from '@nestjs/common';
import { NodeModule } from './services/node/node.module';
import { FastapiModule } from './services/python/fastapi/fastapi.module';
import { FlaskModule } from './services/python/flask/flask.module';
import { JavaModule } from './services/java/java.module';
import { GoModule } from './services/golang/golang.module';
import { RustModule } from './services/rust/rust.module';

@Module({
  imports: [NodeModule, FastapiModule, FlaskModule, JavaModule, GoModule, RustModule],
})
export class AppModule {}
