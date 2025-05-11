// #!/usr/bin/env ts-node

// import inquirer from 'inquirer';
// import axios from 'axios';
// import fs from 'fs';
// import path from 'path';

// type Stack = 'nodejs' | 'fastapi' | 'flask';

// async function main() {
//   console.log(`\n⚙️  InfraBuddy - Let's generate your infra, bestie\n`);

//   const { stack } = await inquirer.prompt([
//     {
//       type: 'list',
//       name: 'stack',
//       message: 'What stack are you using?',
//       choices: ['nodejs', 'fastapi', 'flask'],
//     },
//   ]);

//   const dockerAnswers: any = await askDockerQuestions(stack);
//   const ghActionsAnswers: any = await askGitHubActionsQuestions(
//     stack,
//     dockerAnswers.project_name,
//   );

//   const endpoint = `http://localhost:3000/${stack}/generate`;

//   const body = {
//     config: {
//       docker: dockerAnswers,
//       githubActions: ghActionsAnswers,
//     },
//     options: {
//       stack,
//       infrastructures: ['docker', 'github-actions'],
//     },
//   };

//   const res = await axios.post(endpoint, body);
//   const zipPath = res.data.zipPath;

//   console.log(`\n✅ Infra generated! Find your zip file at:\n${zipPath}\n`);
// }

// async function askDockerQuestions(stack: Stack) {
//   const commonQuestions = [
//     { type: 'input', name: 'project_name', message: 'Project name?' },
//     { type: 'number', name: 'port', message: 'App port?', default: 8000 },
//     {
//       type: 'list',
//       name: 'db_choice',
//       message: 'Database?',
//       choices: ['none', 'postgresql', 'mysql', 'mongodb'],
//     },
//     {
//       type: 'confirm',
//       name: 'include_cache',
//       message: 'Include Redis cache?',
//       default: false,
//     },
//   ];

//   if (stack === 'nodejs') {
//     const nodeQuestions = [
//       {
//         type: 'list',
//         name: 'app_type',
//         message: 'App type?',
//         choices: ['api', 'spa'],
//       },
//     ];
//     const answers = await inquirer.prompt([
//       ...commonQuestions,
//       ...nodeQuestions,
//     ]);
//     return {
//       ...answers,
//     };
//   }

//   if (stack === 'fastapi') {
//     const fastapiQs = [
//       {
//         type: 'input',
//         name: 'app_path',
//         message: 'FastAPI app path (e.g. app.main:app)?',
//         default: 'app.main:app',
//       },
//       {
//         type: 'confirm',
//         name: 'use_poetry',
//         message: 'Use Poetry for dependency management?',
//         default: true,
//       },
//       {
//         type: 'list',
//         name: 'runner',
//         message: 'Select app runner',
//         choices: ['uvicorn', 'gunicorn', 'pip runner'],
//       },
//     ];

//     const answers = await inquirer.prompt([...commonQuestions, ...fastapiQs]);

//     return {
//       ...answers,
//       include_db: answers.db_choice !== 'none',
//       use_uvicorn: answers.runner === 'uvicorn',
//       use_gunicorn: answers.runner === 'gunicorn',
//       use_pip_runner: answers.runner === 'pip runner',
//     };
//   }

//   if (stack === 'flask') {
//     const flaskQs = [
//       {
//         type: 'confirm',
//         name: 'use_poetry',
//         message: 'Use Poetry for dependency management?',
//         default: true,
//       },
//       {
//         type: 'checkbox',
//         name: 'runners',
//         message: 'Which runners should be enabled?',
//         choices: ['gunicorn', 'uwsgi', 'flask run'],
//       },
//     ];

//     const answers = await inquirer.prompt([...commonQuestions, ...flaskQs]);

//     return {
//       ...answers,
//       use_gunicorn: answers.runners.includes('gunicorn'),
//       use_uwsgi: answers.runners.includes('uwsgi'),
//       use_flask_run: answers.runners.includes('flask run'),
//     };
//   }

//   throw new Error('Unsupported stack');
// }

// async function askGitHubActionsQuestions(stack: Stack, project_name: string) {
//   const baseQuestions = [
//     {
//       type: 'confirm',
//       name: 'is_dockerized',
//       message: 'Build and push Docker image in CI?',
//       default: true,
//     },
//     {
//       type: 'confirm',
//       name: 'deploy_ssh',
//       message: 'Enable SSH deployment?',
//       default: true,
//     },
//   ];

//   if (stack === 'nodejs') {
//     const { node_version } = await inquirer.prompt([
//       {
//         type: 'input',
//         name: 'node_version',
//         message: 'Node.js version?',
//         default: '20',
//       },
//     ]);

//     const baseAnswers = await inquirer.prompt(baseQuestions);

//     return {
//       project_name,
//       node_version,
//       ...baseAnswers,
//     };
//   }

//   if (stack === 'fastapi' || stack === 'flask') {
//     const { python_version } = await inquirer.prompt([
//       {
//         type: 'input',
//         name: 'python_version',
//         message: 'Python version?',
//         default: '3.11',
//       },
//     ]);

//     const baseAnswers = await inquirer.prompt(baseQuestions);

//     return {
//       project_name,
//       python_version,
//       ...baseAnswers,
//     };
//   }

//   throw new Error('Unsupported stack');
// }

// main().catch((err) => {
//   console.error('💥 Failed to generate infrastructure:', err.message);
//   process.exit(1);
// });
