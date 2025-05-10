import { Module } from '@nestjs/common';
import { GoController } from './golang.controller';
import { GoService } from './golang.service';
import { BuildGoDockerService } from './generators/build-docker.service';
import { BuildGoGhActionsService } from './generators/build-gh-actions.service';

@Module({
  controllers: [GoController],
  providers: [GoService, BuildGoDockerService, BuildGoGhActionsService],
})
export class GoModule {}
