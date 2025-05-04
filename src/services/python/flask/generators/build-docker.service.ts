import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Mustache from 'mustache';
import { FlaskDockerAnswers } from '../../../../interfaces/python-config.interface';

@Injectable()
export class BuildFlaskDockerService {
  private readonly templateDir = path.join(
    process.cwd(),
    'src',
    'templates',
    'python',
    'flask',
    'docker',
  );

  async generateDockerConfig(
    answers: FlaskDockerAnswers,
  ): Promise<Map<string, string>> {
    const context = this.buildContext(answers);
    const generatedFiles = new Map<string, string>();

    const dockerfile = await this.renderTemplate(
      'Dockerfile.mustache',
      context,
    );
    generatedFiles.set('docker/Dockerfile', dockerfile);

    const compose = await this.renderTemplate('compose.yml.mustache', context);
    generatedFiles.set('docker/compose.yml', compose);

    const nginx = await this.renderTemplate('nginx.conf.mustache', context);
    generatedFiles.set('docker/nginx.conf', nginx);

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

  private buildContext(answers: FlaskDockerAnswers): Record<string, any> {
    const context: Record<string, any> = {
      ...answers,
      use_gunicorn: answers.use_gunicorn,
      use_uwsgi: answers.use_uwsgi,
      use_flask_run: answers.use_flask_run,
      use_poetry: answers.use_poetry,
      include_db: answers.db_choice !== 'none',
      db_postgresql: answers.db_choice === 'postgresql',
      db_mysql: answers.db_choice === 'mysql',
      db_mongodb: answers.db_choice === 'mongodb',
      include_cache: answers.include_cache,
    };

    if (context.include_db) {
      switch (answers.db_choice) {
        case 'postgresql':
          context.db_image = 'postgres:17';
          context.db_port = 5432;
          context.db_volume_folder = '/var/lib/postgresql/data';
          context.db_env_vars = [
            { key: 'POSTGRES_USER', value: 'user' },
            { key: 'POSTGRES_PASSWORD', value: 'pass' },
            { key: 'POSTGRES_DB', value: 'app_db' },
          ];
          break;

        case 'mysql':
          context.db_image = 'mysql:8.0';
          context.db_port = 3306;
          context.db_volume_folder = '/var/lib/mysql';
          context.db_env_vars = [
            { key: 'MYSQL_USER', value: 'user' },
            { key: 'MYSQL_PASSWORD', value: 'pass' },
            { key: 'MYSQL_DATABASE', value: 'app_db' },
            { key: 'MYSQL_ROOT_PASSWORD', value: 'rootpass' },
          ];
          break;

        case 'mongodb':
          context.db_image = 'mongo:8.0';
          context.db_port = 27017;
          context.db_volume_folder = '/data/db';
          context.db_env_vars = [
            { key: 'MONGO_INITDB_ROOT_USERNAME', value: 'user' },
            { key: 'MONGO_INITDB_ROOT_PASSWORD', value: 'pass' },
          ];
          break;
      }
    }

    return context;
  }
}
