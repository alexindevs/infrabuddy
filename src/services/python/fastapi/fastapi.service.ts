import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { BuildFastAPIDockerService } from './generators/build-docker.service';
import { BuildFastAPIGhActionsService } from './generators/build-gh-actions.service';
import {
  FastAPIDockerAnswers,
  FastAPIGhActionsAnswers,
} from '../../../interfaces/python-config.interface';

export interface GenerateOptions {
  stack: 'fastapi';
  infrastructures: ('docker' | 'github-actions' | 'terraform' | 'kubernetes')[];
}

export interface FastAPIConfig {
  docker?: FastAPIDockerAnswers;
  githubActions?: FastAPIGhActionsAnswers & { project_name: string };
}

@Injectable()
export class FastapiService {
  constructor(
    private readonly dockerService: BuildFastAPIDockerService,
    private readonly githubActionsService: BuildFastAPIGhActionsService,
  ) {}

  async generateInfrastructure(
    config: FastAPIConfig,
    options: GenerateOptions,
  ): Promise<string> {
    const allFiles = new Map<string, string>();

    if (options.infrastructures.includes('docker') && config.docker) {
      const dockerFiles = await this.dockerService.generateDockerConfig(
        config.docker,
      );
      dockerFiles.forEach((content, filePath) => {
        allFiles.set(filePath, content);
      });
    }

    if (
      options.infrastructures.includes('github-actions') &&
      config.githubActions
    ) {
      const githubFiles = await this.githubActionsService.generateWorkflow(
        config.githubActions,
      );
      githubFiles.forEach((content, filePath) => {
        allFiles.set(filePath, content);
      });
    }

    const readmeContent = this.generateReadme(config, options);
    allFiles.set('README.md', readmeContent);

    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-fastapi';

    const zipFilePath = await this.createZipArchive(allFiles, projectName);

    return zipFilePath;
  }

  private generateReadme(
    config: FastAPIConfig,
    options: GenerateOptions,
  ): string {
    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-fastapi';

    let content = `# ${projectName}\n\nInfra scaffolded by [InfraBuddy](https://github.com/alexindevs/infrabuddy)\n\n`;
    content += `## Stack: FastAPI (Python)\n\n`;

    if (options.infrastructures.includes('docker') && config.docker) {
      content += `### 🐳 Docker\n\`\`\`bash\ndocker compose -f docker/compose.yml up --build -d\n\`\`\`\n`;
      if (config.docker.include_db)
        content += `Includes **${config.docker.db_choice}** database.\n\n`;
      if (config.docker.include_cache) content += `Redis caching enabled.\n\n`;
    }

    if (
      options.infrastructures.includes('github-actions') &&
      config.githubActions
    ) {
      content += `### 🚀 GitHub Actions CI/CD\nCI/CD config is located in \`.github/workflows\`\n\n`;
      if (config.githubActions.is_dockerized) {
        content += `Secrets needed:\n- \`DOCKER_USERNAME\`\n- \`DOCKER_PASSWORD\`\n- \`ENV_FILE\`\n\n`;
      }
      if (config.githubActions.deploy_ssh) {
        content += `SSH deploy secrets:\n- \`DEPLOY_HOST\`\n- \`DEPLOY_USER\`\n- \`SSH_PRIVATE_KEY\`\n- \`DEPLOY_PATH\`\n`;
        if (!config.githubActions.is_dockerized) {
          content += `- \`PM2_APP_NAME\` *(optional)*\n`;
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
    await fs.mkdir(dirPath, { recursive: true });
  }

  private async createZip(
    sourceDir: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve());
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize().catch(reject);
    });
  }
}
