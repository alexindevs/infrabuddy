import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { NodeService } from './node.service';
import { GenerateOptions, NodeJSConfig } from './node.service';

@Controller('node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post('generate')
  async generateInfra(
    @Body() body: { config: NodeJSConfig; options: GenerateOptions },
  ): Promise<{ zipPath: string }> {
    if (!body?.config || !body?.options) {
      throw new BadRequestException('Missing config or options');
    }

    const zipPath = await this.nodeService.generateInfrastructure(
      body.config,
      body.options,
    );

    return { zipPath };
  }
}
