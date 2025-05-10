import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { JavaService } from './java.service';
import { JavaConfig, JavaGenerateOptions } from './java.service';

@Controller('java')
export class JavaController {
  constructor(private readonly javaService: JavaService) {}

  @Post('generate')
  async generateInfra(
    @Body() body: { config: JavaConfig; options: JavaGenerateOptions },
  ): Promise<{ zipPath: string }> {
    if (!body?.config || !body?.options) {
      throw new BadRequestException('Missing config or options');
    }

    const zipPath = await this.javaService.generateInfrastructure(
      body.config,
      body.options,
    );

    return { zipPath };
  }
}
