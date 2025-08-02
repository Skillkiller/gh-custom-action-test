import * as core from '@actions/core'
import { wait } from './wait.js'
import crypto from 'crypto'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    core.info('Job Name: ' + core.getInput('job-name'))

    const matrixKeyInput = core.getInput('matrix-key') // Optionaler Input

    // Prüfen ob matrix-key gesetzt wurde (nicht leer)
    const matrixKey =
      matrixKeyInput && matrixKeyInput.trim() !== ''
        ? matrixKeyInput
        : generateRandomKey(4) // 8 Hex-Zeichen als Zufall

    core.info(`matrix-key: ${matrixKey}`)

    var artifactName: string = 'mo-' + process.env.GITHUB_JOB + ''

    core.debug('artifactName: ' + artifactName)

    core.debug(`ENV: ${JSON.stringify(process.env, null, 2)}`)

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function generateRandomKey(length = 8): string {
  return crypto.randomBytes(length).toString('hex')
}
