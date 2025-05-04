import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { FlaskService } from './flask.service';
import { FlaskConfig, GenerateOptions } from './flask.service';

@Controller('flask')
export class FlaskController {
  constructor(private readonly flaskService: FlaskService) {}

  @Post('generate')
  async generateInfra(
    @Body() body: { config: FlaskConfig; options: GenerateOptions },
  ): Promise<{ zipPath: string }> {
    if (!body?.config || !body?.options) {
      throw new BadRequestException('Missing config or options');
    }

    const zipPath = await this.flaskService.generateInfrastructure(
      body.config,
      body.options,
    );

    return { zipPath };
  }
}
