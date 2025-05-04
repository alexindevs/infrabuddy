import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { BuildDockerService } from './generators/build-docker.service';
import { BuildGithubActionsService } from './generators/build-gh-actions.service';
import {
  DockerAnswers,
  GhActionsAnswers,
} from './../../interfaces/node-config.interface';
export interface GenerateOptions {
  stack: 'nodejs';
  infrastructures: ('docker' | 'github-actions' | 'terraform' | 'kubernetes')[];
}

export interface NodeJSConfig {
  docker?: DockerAnswers;
  githubActions?: GhActionsAnswers & { project_name: string };
}

@Injectable()
export class NodeService {
  constructor(
    private readonly dockerService: BuildDockerService,
    private readonly githubActionsService: BuildGithubActionsService,
  ) {}

  async generateInfrastructure(
    config: NodeJSConfig,
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
      const githubFiles = await this.githubActionsService.generateGithubActions(
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
      'infrabuddy-project';

    const zipFilePath = await this.createZipArchive(allFiles, projectName);

    return zipFilePath;
  }

  private generateReadme(
    config: NodeJSConfig,
    options: GenerateOptions,
  ): string {
    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-project';

    let content = `# ${projectName}\n\n`;
    content += `The infrastructure for this project was scaffolded using InfraBuddy.\n\n`;
    content += `## Stack: Node.JS\n\n`;

    if (options.infrastructures.includes('docker') && config.docker) {
      content += `### 🐳 Docker Setup\n\n`;
      content += `To run this project with Docker:\n\n`;
      content += `\`\`\`bash\n`;
      content += `# Build and start containers\n`;
      content += `docker compose -f docker/compose.yml up --build -d\n`;
      content += `\`\`\`\n\n`;

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
      content += `### 🚀 CI/CD Setup\n\n`;
      content += `GitHub Actions workflows are configured in the \`.github/workflows\` directory.\n\n`;

      if (config.githubActions.is_dockerized) {
        content += `The workflow will build and publish a Docker image.\n\n`;
        content += `You'll need to add the following Docker-related secrets to your GitHub repository:\n\n`;
        content += `- \`DOCKER_USERNAME\` - Your Docker Hub username\n`;
        content += `- \`DOCKER_PASSWORD\` - Your Docker Hub password or access token\n\n`;
      }

      if (config.githubActions.deploy_ssh) {
        content += `Deployment via SSH is configured. You'll need to add the following SSH deployment secrets to your GitHub repository:\n\n`;
        content += `- \`DEPLOY_HOST\` - The deployment server hostname or IP address\n`;
        content += `- \`DEPLOY_USER\` - The SSH username to connect as\n`;
        content += `- \`SSH_PRIVATE_KEY\` - The private SSH key (ensure it's in PEM format)\n`;
        content += `- \`DEPLOY_PATH\` - The absolute path on the server where the project should live\n`;

        if (config.githubActions.is_dockerized) {
          content += `\nDocker-based deployment is enabled, so make sure Docker is installed and accessible on your remote server.\n`;
        } else {
          content += `\nThis will run git pull, build your project, and restart it using PM2. You can also set:\n`;
          content += `- \`PM2_APP_NAME\` - (Optional) The PM2 process name to restart. Defaults to \`app\`\n`;
        }
      }
    }
    // Add Terraform setup instructions
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

  /**
   * Create a ZIP archive from a directory
   */
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
