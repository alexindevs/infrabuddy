export interface DockerAnswers {
  project_name: string;
  port: number;
  app_type: 'api' | 'spa';
  db_choice: 'none' | 'postgresql' | 'mysql' | 'mongodb';
  include_cache: boolean;
}

export interface GhActionsAnswers {
  project_name: string;
  node_version?: string;
  is_dockerized: boolean;
  deploy_ssh: boolean;
}
