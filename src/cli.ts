import program from 'commander'
import { convertFile } from './index.js'
import inquirer from 'inquirer'
import { writeFileInfo } from './file'

function camelize (str: string) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCmdOptions (cmd: any) {
  const args: { [key: string]: boolean | string } = {}
  cmd.options.forEach((o: { long: string }) => {
    const key = camelize(o.long.replace(/^--/, ''))

    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

program
  .version(require('../../package.json').version)
  .usage('<command> [options]')

program
  .command('single <filePath>')
  .description('convert vue component file from class to composition api')
  .option('-v, --view', 'Output file content on stdout, and no write file.')
  .option('-o, --output', 'Output result file path.')
  .option('-r, --root <root>', 'Set root path for calc file absolute path. Default:`process.cwd()`')
  .option('-c, --config <config>', 'Set vc2c config file path. Default: `\'.vc2c.js\'`')
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .action(async (filePath: string, cmd) => {
    const cmdOptions = getCmdOptions(cmd)
    if (!cmdOptions.output && !cmdOptions.view) {
      const result = await inquirer.prompt({
        name: 'ok',
        type: 'confirm',
        message: 'You aren\'t using -o option to set output file path, It will replace original file content.'
      })
      if (!result.ok) {
        return
      }
    }

    const { file, result } = convertFile(filePath, cmdOptions.root as string, cmdOptions.config as string)
    if (cmdOptions.view) {
      // eslint-disable-next-line no-console
      console.log(result)
      return
    }

    writeFileInfo(file, result)
    console.log('Please check the TODO comments on result.')
  })

program.parse(process.argv)
