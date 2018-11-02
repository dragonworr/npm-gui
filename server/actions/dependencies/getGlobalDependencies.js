import executeCommand from '../executeCommand';
import UtilsService from '../../service/utils/utils.service';
import { mapNpmDependency } from '../mapDependencies';
import { getFromCache, putToCache } from '../../cache';

export async function getGlobalNpmDependencies() {
  const commandResult = await executeCommand(null, 'npm ls -g --depth=0 --json');
  const { dependencies } = UtilsService.parseJSON(commandResult.stdout);

  const commandOutdatedResult = await executeCommand(null, 'npm outdated -g --json');
  const versions = UtilsService.parseJSON(commandOutdatedResult.stdout);

  return Object.keys(dependencies)
    .map(name => mapNpmDependency(
      name,
      dependencies[name],
      versions && versions[name],
      dependencies[name].version,
    ));
}

export async function getGlobalDependencies(_, res) {
  const npmCacheName = 'global-npmGlobal';
  let npmDependencies = [];

  try {
    npmDependencies = getFromCache(npmCacheName) || await getGlobalNpmDependencies();
  } catch (e) { console.error(e); }

  putToCache(npmCacheName, npmDependencies);

  res.json([...npmDependencies]);
}

export async function getGlobalDependenciesSimple(_, res) {
  const npmCacheName = 'global-simple-npmGlobal';
  let npmDependencies = [];

  try {
    const commandResult = await executeCommand(null, 'npm ls -g --depth=0 --json');
    const { dependencies } = UtilsService.parseJSON(commandResult.stdout);

    npmDependencies = getFromCache(npmCacheName) || Object.keys(dependencies)
      .map(name => mapNpmDependency(
        name,
        dependencies[name],
        undefined,
        dependencies[name].version,
      ));
  } catch (e) { console.error(e); }

  putToCache(npmCacheName, npmDependencies);

  res.json([...npmDependencies]);
}
