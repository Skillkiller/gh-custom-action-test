import * as core from '@actions/core'
import crypto from 'crypto'
import * as tmp from 'tmp'
import * as fs from 'fs'
import * as YAML from 'yaml'
import { DefaultArtifactClient } from '@actions/artifact'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const jobName = core.getInput('job-name')

    core.info('Job Name: ' + jobName)

    const matrixKeyInput = core.getInput('matrix-key') // Optionaler Input

    // Prüfen ob matrix-key gesetzt wurde (nicht leer)
    const matrixKey =
      matrixKeyInput && matrixKeyInput.trim() !== ''
        ? matrixKeyInput
        : generateRandomKey(4) // 8 Hex-Zeichen als Zufall

    core.info(`matrix-key: ${matrixKey}`)

    var artifactName: string = 'MO-' + jobName + '-' + matrixKey + '.json'

    core.info('artifactName: ' + artifactName)

    core.debug(`ENV: ${JSON.stringify(process.env, null, 2)}`)

    const payload = {
      '_mo-job-name': jobName,
      '_mo-matrix-key': matrixKey,
      data: core.getInput('data') as unknown
    }

    core.info('PAYLOAD')
    core.info(YAML.stringify(payload))

    const tmpFile = tmp.fileSync({ postfix: '.yaml' })
    fs.writeFileSync(tmpFile.name, YAML.stringify(payload), {
      encoding: 'utf-8'
    })

    const artifactClient = new DefaultArtifactClient()
    artifactClient.uploadArtifact(artifactName, [tmpFile.name], '.', {
      retentionDays: 1
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function generateRandomKey(length = 8): string {
  return crypto.randomBytes(length).toString('hex')
}
