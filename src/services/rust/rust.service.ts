import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { BuildRustDockerService } from './generators/build-docker.service';
import { BuildRustGhActionsService } from './generators/build-gh-actions.service';
import {
  RustDockerAnswers,
  RustGhActionsAnswers,
} from './../../interfaces/rust-config.interface';

export interface RustGenerateOptions {
  stack: 'rust';
  infrastructures: ('docker' | 'github-actions' | 'terraform' | 'kubernetes')[];
}

export interface RustConfig {
  docker?: RustDockerAnswers;
  githubActions?: RustGhActionsAnswers;
}

@Injectable()
export class RustService {
  constructor(
    private readonly dockerService: BuildRustDockerService,
    private readonly githubActionsService: BuildRustGhActionsService,
  ) {}

  async generateInfrastructure(
    config: RustConfig,
    options: RustGenerateOptions,
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
      const ghaFiles = await this.githubActionsService.generateWorkflow(
        config.githubActions,
      );
      ghaFiles.forEach((content, filePath) => {
        allFiles.set(filePath, content);
      });
    }

    const readme = this.generateReadme(config, options);
    allFiles.set('README.md', readme);

    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-rust-app';

    const zipFilePath = await this.createZipArchive(allFiles, projectName);

    return zipFilePath;
  }

  private generateReadme(
    config: RustConfig,
    options: RustGenerateOptions,
  ): string {
    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-rust-app';

    let content = `# ${projectName}\n\n`;
    content += `The infrastructure for this project was scaffolded using InfraBuddy.\n\n`;
    content += `## Stack: Rust\n\n`;

    if (options.infrastructures.includes('docker') && config.docker) {
      content += `### 🐳 Docker Setup\n\n`;
      content += `To run this project with Docker:\n\n`;
      content += '```bash\n';
      content += 'docker compose -f docker/compose.yml up --build -d\n';
      content += '```\n\n';

      if (config.docker.db_choice !== 'none') {
        content += `Database: **${config.docker.db_choice}** is configured in the Docker Compose file.\n\n`;
      }

      if (config.docker.include_cache) {
        content += `Redis cache is included and configured.\n\n`;
      }
    }

    if (
      options.infrastructures.includes('github-actions') &&
      config.githubActions
    ) {
      content += `### 🚀 GitHub Actions\n\n`;
      content += `Workflows for CI/CD are configured in \`.github/workflows\`.\n\n`;

      if (config.githubActions.is_dockerized) {
        content += `The workflow builds and pushes a Docker image.\n\n`;
        content += `You need these GitHub secrets:\n\n`;
        content += '- `DOCKER_USERNAME`\n';
        content += '- `DOCKER_PASSWORD`\n\n';
      }

      if (config.githubActions.deploy_ssh) {
        content += `SSH deployment is configured. Add these secrets:\n\n`;
        content += '- `DEPLOY_HOST`\n';
        content += '- `DEPLOY_USER`\n';
        content += '- `SSH_PRIVATE_KEY`\n';
        content += '- `DEPLOY_PATH`\n';

        if (config.githubActions.is_dockerized) {
          content += `\nYour server should support Docker Compose.\n`;
        } else {
          content += `\nThe server should support cargo + PM2. You may also set \`PM2_APP_NAME\` if needed.\n`;
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
      if (error.code !== 'EEXIST') {
        throw error;
      }
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
      archive
        .finalize()
        .then(() => resolve())
        .catch((err) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        );
    });
  }
}
