import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Mustache from 'mustache';
import { JavaGhActionsAnswers } from '../../../interfaces/java-config.interface';

@Injectable()
export class BuildJavaGhActionsService {
  private readonly templateDir = path.join(
    process.cwd(),
    'src',
    'templates',
    'java',
    'gh-actions',
  );

  async generateWorkflow(
    answers: JavaGhActionsAnswers,
  ): Promise<Map<string, string>> {
    const context = this.buildContext(answers);
    const generatedFiles = new Map<string, string>();

    const workflow = await this.renderTemplate('ci.yml.mustache', context);
    generatedFiles.set('.github/workflows/java.yml', workflow);

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

  private buildContext(answers: JavaGhActionsAnswers): Record<string, any> {
    return {
      ...answers,
      is_maven: answers.build_tool === 'maven',
      is_gradle: answers.build_tool === 'gradle',
      is_dockerized: answers.is_dockerized,
      deploy_ssh: answers.deploy_ssh,
    };
  }
}
