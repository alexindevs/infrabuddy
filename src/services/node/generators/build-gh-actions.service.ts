import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Mustache from 'mustache';
import { GhActionsAnswers } from '../../../interfaces/node-config.interface';

@Injectable()
export class BuildGithubActionsService {
  private readonly templateDir = path.join(
    process.cwd(),
    'src',
    'templates',
    'nodejs',
    'gh-actions',
  );

  async generateGithubActions(
    answers: GhActionsAnswers,
  ): Promise<Map<string, string>> {
    const generatedFiles = new Map<string, string>();

    const templateData = {
      ...answers,
      node_version: answers.node_version || '20',
    };

    const deployYml = await this.renderDeployWorkflow(templateData);
    generatedFiles.set('.github/workflows/ci.yml', deployYml);

    return generatedFiles;
  }

  private async renderDeployWorkflow(
    answers: GhActionsAnswers & { project_name: string },
  ): Promise<string> {
    const templatePath = path.join(this.templateDir, 'ci.yml.mustache');
    const template = await fs.readFile(templatePath, 'utf8');

    return Mustache.render(template, answers);
  }
}
