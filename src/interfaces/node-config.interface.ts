export interface DockerAnswers {
  project_name: string; // Used for container naming
  port: number; // The port the app listens on
  app_type: 'api' | 'spa'; // Determines nginx config block
  db_choice: 'none' | 'postgresql' | 'mysql' | 'mongodb'; // Optional DB service
  include_cache: boolean; // Whether to include Redis
}

export interface GhActionsAnswers {
  project_name: string; // Used for container naming
  node_version?: string; // Default: '20'
  is_dockerized: boolean; // Whether to build/push Docker image
  deploy_ssh: boolean; // Whether to deploy via SSH
}
