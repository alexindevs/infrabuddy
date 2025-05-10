import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { BuildGoDockerService } from './generators/build-docker.service';
import { BuildGoGhActionsService } from './generators/build-gh-actions.service';
import {
  GoDockerAnswers,
  GoGhActionsAnswers,
} from '../../interfaces/golang-config.interface';

export interface GoGenerateOptions {
  stack: 'golang';
  infrastructures: ('docker' | 'github-actions')[];
}

export interface GoConfig {
  docker?: GoDockerAnswers;
  githubActions?: GoGhActionsAnswers;
}

@Injectable()
export class GoService {
  constructor(
    private readonly dockerService: BuildGoDockerService,
    private readonly githubActionsService: BuildGoGhActionsService,
  ) {}

  async generateInfrastructure(
    config: GoConfig,
    options: GoGenerateOptions,
  ): Promise<string> {
    const allFiles = new Map<string, string>();

    if (options.infrastructures.includes('docker') && config.docker) {
      const dockerFiles = await this.dockerService.generateDockerConfig(
        config.docker,
      );
      dockerFiles.forEach((content, filePath) =>
        allFiles.set(filePath, content),
      );
    }

    if (
      options.infrastructures.includes('github-actions') &&
      config.githubActions
    ) {
      const ghaFiles = await this.githubActionsService.generateWorkflow(
        config.githubActions,
      );
      ghaFiles.forEach((content, filePath) => allFiles.set(filePath, content));
    }

    const readme = this.generateReadme(config, options);
    allFiles.set('README.md', readme);

    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-go-app';

    const zipPath = await this.createZipArchive(allFiles, projectName);
    return zipPath;
  }

  private generateReadme(config: GoConfig, options: GoGenerateOptions): string {
    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-go-app';

    let content = `# ${projectName}\n\n`;
    content += `The infrastructure for this project was scaffolded using InfraBuddy.\n\n`;
    content += `## Stack: Golang\n\n`;

    if (options.infrastructures.includes('docker') && config.docker) {
      content += `### 🐳 Docker Setup\n\`\`\`bash\ndocker compose -f docker/compose.yml up --build -d\n\`\`\`\n\n`;
      if (config.docker.db_choice !== 'none') {
        content += `Database: **${config.docker.db_choice}** is configured.\n\n`;
      }
      if (config.docker.include_cache) {
        content += `Redis cache is included and configured.\n\n`;
      }
    }

    if (
      options.infrastructures.includes('github-actions') &&
      config.githubActions
    ) {
      content += `### 🚀 GitHub Actions\nCI/CD is configured in \`.github/workflows/go.yml\`.\n\n`;

      if (config.githubActions.is_dockerized) {
        content += `This workflow builds and pushes a Docker image.\nSecrets required:\n- DOCKER_USERNAME\n- DOCKER_PASSWORD\n\n`;
      }

      if (config.githubActions.deploy_ssh) {
        content += `This workflow deploys via SSH.\nSecrets required:\n- DEPLOY_HOST\n- DEPLOY_USER\n- SSH_PRIVATE_KEY\n- DEPLOY_PATH\n`;
        if (!config.githubActions.is_dockerized) {
          content += `\nBuilds your Go binary and restarts via PM2 (defaults to app name \`app\`).\n`;
        }
      }
    }

    return content;
  }

  private async createZipArchive(
    files: Map<string, string>,
    projectName: string,
  ): Promise<string> {
    const tempDir = path.join(
      process.cwd(),
      'temp',
      `${projectName}-${Date.now()}`,
    );
    await this.ensureDirectoryExists(tempDir);

    for (const [filePath, content] of files.entries()) {
      const fullPath = path.join(tempDir, filePath);
      await this.ensureDirectoryExists(path.dirname(fullPath));
      await fs.writeFile(fullPath, content);
    }

    const zipPath = path.join(
      process.cwd(),
      'temp',
      `${projectName}-${Date.now()}.zip`,
    );
    await this.createZip(tempDir, zipPath);

    await fs.rm(tempDir, { recursive: true, force: true });

    return zipPath;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') throw error;
    }
  }

  private async createZip(
    sourceDir: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize().catch((err: Error) => reject(err));
    });
  }
}
