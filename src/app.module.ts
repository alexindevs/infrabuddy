import { Module } from '@nestjs/common';
import { NodeModule } from './services/node/node.module';
import { FastapiModule } from './services/python/fastapi/fastapi.module';
import { FlaskModule } from './services/python/flask/flask.module';

@Module({
  imports: [NodeModule, FastapiModule, FlaskModule],
})
export class AppModule {}
