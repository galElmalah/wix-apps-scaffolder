const { exec } = require('child_process');
const { promisify } = require('util')

const promisifyExec = promisify(exec)

module.export = {
  templatesOptions: {
    "oauth-app": {
      postTemplateGeneration: async () => {
        const appPath = `${ctx.targetRoot}/${ctx.parametersValues.moduleName}`

        await Promise.all(promisifyExec(''))
      }
    }
  }
}