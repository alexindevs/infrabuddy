import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as Mustache from 'mustache';
import { GoGhActionsAnswers } from '../../../interfaces/golang-config.interface';

@Injectable()
export class BuildGoGhActionsService {
  private readonly templateDir = path.join(
    process.cwd(),
    'src',
    'templates',
    'golang',
    'gh-actions',
  );

  async generateWorkflow(
    answers: GoGhActionsAnswers,
  ): Promise<Map<string, string>> {
    const context = this.buildContext(answers);
    const generatedFiles = new Map<string, string>();

    const workflow = await this.renderTemplate('ci.yml.mustache', context);
    generatedFiles.set('.github/workflows/ci.yml', workflow);

    return generatedFiles;
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(this.templateDir, templateName);
    const template = await fs.readFile(templatePath, 'utf8');
    return Mustache.render(template, context);
  }

  private buildContext(answers: GoGhActionsAnswers): Record<string, any> {
    return {
      ...answers,
      is_dockerized: answers.is_dockerized,
      deploy_ssh: answers.deploy_ssh,
    };
  }
}
