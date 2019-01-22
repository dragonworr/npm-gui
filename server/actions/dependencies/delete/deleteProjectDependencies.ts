import executeCommand from '../../executeCommand';
import { withCacheSplice } from '../../../cache';
import { decodePath } from '../../decodePath';
import * as express from 'express';
import { hasYarn } from '../../hasYarn';

async function deleteNpmDependency(
  projectPath: string, dependencyName:string, type: Dependency.Type):Promise<string> {
  // delete
  await executeCommand(projectPath, `npm uninstall ${dependencyName} -${type === 'regular' ? 'S' : 'D'}`, true); // tslint:disable-line:max-line-length

  return dependencyName;
}

async function deleteYarnDependency(
  projectPath: string, dependencyName:string, _: Dependency.Type):Promise<string> {
  // delete
  await executeCommand(projectPath, `yarn remove ${dependencyName}`, true);

  return dependencyName;
}

async function deleteBowerDependency(
  projectPath: string, dependencyName:string, type: Dependency.Type):Promise<string> {
  await executeCommand(projectPath, `bower uninstall ${dependencyName} -${type === 'regular' ? 'S' : 'D'}`, true); // tslint:disable-line:max-line-length

  return dependencyName;
}

export async function deleteDependency(req: express.Request, res: express.Response):Promise<void> {
  const { repoName, projectPath, type, packageName } :
  { repoName: string, projectPath: string, type: Dependency.Type, packageName:string } = req.params;
  const projectPathDecoded = decodePath(projectPath);
  const yarn = hasYarn(projectPathDecoded);

  if (repoName === 'npm') {
    await withCacheSplice(
      yarn ? deleteYarnDependency : deleteNpmDependency, `${projectPath}-npm`, 'name',
      projectPathDecoded, packageName, type,
    );
  } else if (repoName === 'bower') {
    await withCacheSplice(
      deleteBowerDependency, `${projectPath}-bower`, 'name',
      projectPathDecoded, packageName, type);
  }

  res.json({});
}
