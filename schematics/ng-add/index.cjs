'use strict'

const STYLESHEET = 'ailabs-design-system/styles.css'

function hasStylesheet(styles) {
  return styles.some((style) =>
    typeof style === 'string' ? style === STYLESHEET : style && style.input === STYLESHEET,
  )
}

function ngAdd(options = {}) {
  return (tree, context) => {
    const workspacePath = '/angular.json'
    const workspaceBuffer = tree.read(workspacePath)

    if (!workspaceBuffer) {
      throw new Error('Could not find angular.json. Run ng add from an Angular workspace.')
    }

    const workspace = JSON.parse(workspaceBuffer.toString().replace(/^\uFEFF/, ''))
    const projects = Object.entries(workspace.projects || {}).filter(([name, project]) => {
      if (options.project && name !== options.project) return false
      return project && project.projectType === 'application'
    })

    if (options.project && projects.length === 0) {
      throw new Error(`Angular application project "${options.project}" was not found.`)
    }

    if (projects.length === 0) {
      throw new Error('No Angular application projects were found in angular.json.')
    }

    let changed = false

    for (const [name, project] of projects) {
      const buildTarget = (project.architect && project.architect.build) ||
        (project.targets && project.targets.build)
      const buildOptions = buildTarget && buildTarget.options

      if (!buildOptions) {
        context.logger.warn(`Skipped "${name}" because it has no build options.`)
        continue
      }

      const styles = Array.isArray(buildOptions.styles) ? buildOptions.styles : []
      buildOptions.styles = styles

      if (hasStylesheet(styles)) {
        context.logger.info(`AI Labs Design System styles are already configured for "${name}".`)
        continue
      }

      styles.unshift(STYLESHEET)
      changed = true
      context.logger.info(`Added AI Labs Design System styles to "${name}".`)
    }

    if (changed) {
      tree.overwrite(workspacePath, `${JSON.stringify(workspace, null, 2)}\n`)
    }

    return tree
  }
}

module.exports = { ngAdd }
