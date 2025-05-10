export interface JavaDockerAnswers {
  project_name: string;
  port: number;
  build_tool: 'maven' | 'gradle';
  use_distroless: boolean;
  db_choice: 'none' | 'postgresql' | 'mysql' | 'mongodb';
  include_cache: boolean;
}

export interface JavaGhActionsAnswers {
  project_name: string;
  build_tool: 'maven' | 'gradle';
  is_dockerized: boolean;
  deploy_ssh: boolean;
}
