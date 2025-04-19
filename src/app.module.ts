import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratorsModule } from './modules/generators/generators.module';

@Module({
  imports: [GeneratorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
