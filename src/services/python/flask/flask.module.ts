import { Module } from '@nestjs/common';
import { BuildFlaskDockerService } from './generators/build-docker.service';
import { BuildFlaskGhActionsService } from './generators/build-gh-actions.service';
import { FlaskService } from './flask.service';
import { FlaskController } from './flask.controller';

@Module({
  controllers: [FlaskController],
  providers: [
    FlaskService,
    BuildFlaskDockerService,
    BuildFlaskGhActionsService,
  ],
})
export class FlaskModule {}
