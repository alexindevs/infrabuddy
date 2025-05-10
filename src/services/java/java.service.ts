import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as archiver from 'archiver';
import { createWriteStream } from 'fs';
import { BuildJavaDockerService } from './generators/build-docker.service';
import { BuildJavaGhActionsService } from './generators/build-gh-actions.service';
import {
  JavaDockerAnswers,
  JavaGhActionsAnswers,
} from '../../interfaces/java-config.interface';

export interface JavaGenerateOptions {
  stack: 'java';
  infrastructures: ('docker' | 'github-actions')[];
}

export interface JavaConfig {
  docker?: JavaDockerAnswers;
  githubActions?: JavaGhActionsAnswers;
}

@Injectable()
export class JavaService {
  constructor(
    private readonly dockerService: BuildJavaDockerService,
    private readonly githubActionsService: BuildJavaGhActionsService,
  ) {}

  async generateInfrastructure(
    config: JavaConfig,
    options: JavaGenerateOptions,
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
      'infrabuddy-java-app';

    const zipPath = await this.createZipArchive(allFiles, projectName);
    return zipPath;
  }

  private generateReadme(
    config: JavaConfig,
    options: JavaGenerateOptions,
  ): string {
    const projectName =
      config.docker?.project_name ||
      config.githubActions?.project_name ||
      'infrabuddy-java-app';

    let content = `# ${projectName}\n\n`;
    content += `This infrastructure was scaffolded using InfraBuddy.\n\n`;
    content += `## Stack: Java (Maven/Gradle)\n\n`;

    if (options.infrastructures.includes('docker') && config.docker) {
      content += `### 🐳 Docker\n\`\`\`bash\ndocker compose -f docker/compose.yml up --build -d\n\`\`\`\n\n`;
      content += `Using ${config.docker.build_tool.toUpperCase()} + ${
        config.docker.use_distroless ? 'Distroless' : 'Alpine'
      }\n\n`;

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
      content += `### 🚀 GitHub Actions\nWorkflow is in \`.github/workflows/java.yml\`\n\n`;

      if (config.githubActions.is_dockerized) {
        content += `This builds and pushes a Docker image. You’ll need:\n- DOCKER_USERNAME\n- DOCKER_PASSWORD\n\n`;
      }

      if (config.githubActions.deploy_ssh) {
        content += `SSH deploy enabled. Required secrets:\n- DEPLOY_HOST\n- DEPLOY_USER\n- SSH_PRIVATE_KEY\n- DEPLOY_PATH\n\n`;

        if (!config.githubActions.is_dockerized) {
          content += `Uses PM2 to restart the app after pulling and building the JAR.\n`;
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
      archive.finalize().catch((err) => reject(err));
    });
  }
}
