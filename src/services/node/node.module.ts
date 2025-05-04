import { Module } from '@nestjs/common';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { BuildDockerService } from './generators/build-docker.service';
import { BuildGithubActionsService } from './generators/build-gh-actions.service';

@Module({
  controllers: [NodeController],
  providers: [NodeService, BuildDockerService, BuildGithubActionsService],
})
export class NodeModule {}
