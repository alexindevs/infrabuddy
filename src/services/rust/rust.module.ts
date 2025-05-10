import { Module } from '@nestjs/common';
import { RustController } from './rust.controller';
import { RustService } from './rust.service';
import { BuildRustDockerService } from './generators/build-docker.service';
import { BuildRustGhActionsService } from './generators/build-gh-actions.service';

@Module({
  controllers: [RustController],
  providers: [RustService, BuildRustDockerService, BuildRustGhActionsService],
})
export class RustModule {}
