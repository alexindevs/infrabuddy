export interface GoDockerAnswers {
  project_name: string;
  port: number;
  db_choice: 'none' | 'postgresql' | 'mysql' | 'mongodb';
  include_cache: boolean;
}

export interface GoGhActionsAnswers {
  project_name: string;
  is_dockerized: boolean;
  deploy_ssh: boolean;
}
