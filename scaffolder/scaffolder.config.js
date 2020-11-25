const { exec, spawnSync } = require('child_process');
const { promisify } = require('util');

const promisifyExec = promisify(exec);
const postTemplateGeneration = async (ctx) => {
  const root = `${ctx.targetRoot}/wix-oauth-app-example`;
  const appServerPath = `${root}/server`;
  const appClientPath = `${root}/client`;
  ctx.logger.info(`Installing all deps in root, server and client.\nThis may take a few seconds...`);
  try {
    await Promise.all([
      promisifyExec('npm i', { cwd: root }),
      promisifyExec('npm i', { cwd: appClientPath }),
      promisifyExec('npm i', { cwd: appServerPath }),
    ]);
  } catch (e) {
    ctx.logger.error(e)
  }
  ctx.logger.warning(`Finished Installing all dependencies.\nTo start your app go to "${root}" and run "npm start".\n`);
};

module.exports = {
  functions: {
    dotenvIgnore: () => '.dotenv',
  },
  templatesOptions: {
    'oauth-app': {
      hooks: {
        postTemplateGeneration
      },
    },
    "oauth-app-stores": {
      hooks: {
        postTemplateGeneration
      }
    }
  },
};
