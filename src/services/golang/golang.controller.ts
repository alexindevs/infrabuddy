import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { GoService, GoConfig, GoGenerateOptions } from './golang.service';

@Controller('golang')
export class GoController {
  constructor(private readonly goService: GoService) {}

  @Post('generate')
  async generateInfra(
    @Body() body: { config: GoConfig; options: GoGenerateOptions },
  ): Promise<{ zipPath: string }> {
    if (!body?.config || !body?.options) {
      throw new BadRequestException('Missing config or options');
    }

    const zipPath = await this.goService.generateInfrastructure(
      body.config,
      body.options,
    );

    return { zipPath };
  }
}
