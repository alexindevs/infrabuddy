import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { RustService } from './rust.service';
import { RustConfig, RustGenerateOptions } from './rust.service';

@Controller('rust')
export class RustController {
  constructor(private readonly rustService: RustService) {}

  @Post('generate')
  async generateInfra(
    @Body() body: { config: RustConfig; options: RustGenerateOptions },
  ): Promise<{ zipPath: string }> {
    if (!body?.config || !body?.options) {
      throw new BadRequestException('Missing config or options');
    }

    const zipPath = await this.rustService.generateInfrastructure(
      body.config,
      body.options,
    );

    return { zipPath };
  }
}
