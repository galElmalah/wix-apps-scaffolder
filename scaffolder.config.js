const { exec } = require('child_process');
const { promisify } = require('util');

const promisifyExec = promisify(exec);

module.export = {
  functions: {
    dotenvIgnore: () => '.dotenv'
  },
  templatesOptions: {
    'oauth-app': {
      postTemplateGeneration: async (ctx) => {
        const root = `${ctx.targetRoot}/wix-oauth-app-example`;
        const appServerPath = `${root}/server`;
        const appClientPath = `${root}/client`;
        ctx.logger.info('Installing all deps in root, server and client')
        await Promise.all([
          promisifyExec('npm i', { cwd: root }),
          promisifyExec('npm i', { cwd: appClientPath }),
          promisifyExec('npm i', { cwd: appServerPath })]
        );

        ctx.logger.info('Starting server and client apps')

      },
    },
  },
};
