import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Mustache from 'mustache';
import { FastAPIGhActionsAnswers } from '../../../../interfaces/python-config.interface';

@Injectable()
export class BuildFastAPIGhActionsService {
  private readonly templatePath = path.join(
    process.cwd(),
    'src',
    'templates',
    'python',
    'fastapi',
    'gh-actions',
    'deploy.yml.mustache',
  );

  async generateWorkflow(
    answers: FastAPIGhActionsAnswers,
  ): Promise<Map<string, string>> {
    const context = this.buildContext(answers);
    const template = await fs.readFile(this.templatePath, 'utf8');
    const rendered = Mustache.render(template, context);

    return new Map([['.github/workflows/deploy.yml', rendered]]);
  }

  private buildContext(answers: FastAPIGhActionsAnswers): Record<string, any> {
    return {
      ...answers,
      use_poetry: answers.use_poetry,
      use_pip_runner: !answers.use_poetry,
      is_dockerized: answers.is_dockerized,
      deploy_ssh: answers.deploy_ssh,
    };
  }
}
