const { exec, execSync, spawn } = require('child_process');
const { promisify } = require('util');
const promisifySpawn = promisify(spawn)
const promisifyExec = promisify(exec);
const postTemplateGeneration = (prefix) => async (ctx) => {
  const root = `${ctx.targetRoot}/${prefix}`;
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
  ctx.logger.warning(`Finished Installing all dependencies.\nStarting App...\n`);
  execSync('npm start', { cwd: root, stdio: "inherit" })

};

module.exports = {
  functions: {
    dotenvIgnore: () => '.dotenv',
  },
  templatesOptions: {
    'oauth-app': {
      hooks: {
        postTemplateGeneration: postTemplateGeneration('wix-oauth-app-example')
      },
    },
    "oauth-app-stores": {
      hooks: {
        postTemplateGeneration: postTemplateGeneration('wix-oauth-app-stores-example')
      }
    }
  },
};
