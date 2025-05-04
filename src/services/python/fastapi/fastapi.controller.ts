import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { FastapiService } from './fastapi.service';
import { FastAPIConfig, GenerateOptions } from './fastapi.service';

@Controller('fastapi')
export class FastapiController {
  constructor(private readonly fastapiService: FastapiService) {}

  @Post('generate')
  async generateInfra(
    @Body() body: { config: FastAPIConfig; options: GenerateOptions },
  ): Promise<{ zipPath: string }> {
    if (!body?.config || !body?.options) {
      throw new BadRequestException('Missing config or options');
    }

    const zipPath = await this.fastapiService.generateInfrastructure(
      body.config,
      body.options,
    );

    return { zipPath };
  }
}
