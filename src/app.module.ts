import { Module } from '@nestjs/common';
import { NodeModule } from './services/node/node.module';

@Module({
  imports: [NodeModule],
})
export class AppModule {}
