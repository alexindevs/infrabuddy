import { Module } from '@nestjs/common';
import { JavaController } from './java.controller';
import { JavaService } from './java.service';
import { BuildJavaDockerService } from './generators/build-docker.service';
import { BuildJavaGhActionsService } from './generators/build-gh-actions.service';

@Module({
  controllers: [JavaController],
  providers: [JavaService, BuildJavaDockerService, BuildJavaGhActionsService],
})
export class JavaModule {}
