import { Module } from '@nestjs/common';
import { BuildFastAPIDockerService } from './generators/build-docker.service';
import { BuildFastAPIGhActionsService } from './generators/build-gh-actions.service';
import { FastapiService } from './fastapi.service';
import { FastapiController } from './fastapi.controller';

@Module({
  controllers: [FastapiController],
  providers: [
    FastapiService,
    BuildFastAPIDockerService,
    BuildFastAPIGhActionsService,
  ],
})
export class FastapiModule {}
