export interface FastAPIDockerAnswers {
  project_name: string;
  port: number;
  use_poetry: boolean;
  use_gunicorn: boolean;
  use_uvicorn: boolean;
  use_pip_runner: boolean;
  app_path: string;
  db_choice: 'none' | 'postgresql' | 'mysql' | 'mongodb';
  include_db: boolean;
  include_cache: boolean;
}

export interface FastAPIGhActionsAnswers {
  project_name: string;
  python_version?: string;
  use_poetry: boolean;
  is_dockerized: boolean;
  deploy_ssh: boolean;
}

export interface FlaskDockerAnswers {
  project_name: string;
  port: number;
  use_poetry: boolean;
  use_gunicorn: boolean;
  use_uwsgi: boolean;
  use_flask_run: boolean;
  db_choice: 'none' | 'postgresql' | 'mysql' | 'mongodb';
  include_cache: boolean;
}

export interface FlaskGhActionsAnswers {
  project_name: string;
  port: number;
  use_poetry: boolean;
  is_dockerized: boolean;
  deploy_ssh: boolean;
  use_gunicorn: boolean;
  use_uwsgi: boolean;
  use_flask_run: boolean;
}
