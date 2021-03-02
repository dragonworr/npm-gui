import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../ui/Button/Button';
import { Search } from './Search/Search';
import type * as Dependency from '../../../../server/Dependency';

const RightSection = styled.div`
  float: right;
`;

interface Props {
  onInstallNewDependency: (dependency: Dependency.Basic, type: Dependency.Type) => void;
  onInstallAll: () => void;
  onUpdateAllToInstalled: () => void;
  onUpdateAllToWanted: () => void;
  onUpdateAllToLatest: () => void;
  onForceReInstall: () => void;
}

export function DependenciesHeader({
  onInstallNewDependency,
  onInstallAll,
  onUpdateAllToInstalled,
  onUpdateAllToWanted,
  onUpdateAllToLatest,
  onForceReInstall,
}: Props): JSX.Element {
  return (
    <header>

      <Search onInstallNewDependency={onInstallNewDependency} />

      <RightSection>
        <small>Install:</small>
        &nbsp;
        <Button
          icon="data-transfer-download"
          onClick={onInstallAll}
          scale="small"
          variant="primary"
        >
          All
        </Button>

        {/* <Button
            variant="primary"
            scale="small"
            icon="data-transfer-download"
            disabled={true}
          >Prod
          </Button>
          <Button
            variant="dark"
            scale="small"
            icon="data-transfer-download"
            disabled={true}
          >Dev
          </Button> */}
        &nbsp;
        <small>Update all to:</small>
        &nbsp;
        <Button
          icon="cloud-download"
          onClick={onUpdateAllToInstalled}
          scale="small"
          title="Reinstall all packages without changing package.json"
          variant="success"
        >
          Installed
        </Button>

        <Button
          icon="cloud-download"
          onClick={onUpdateAllToWanted}
          scale="small"
          title="Install all wanted package version"
          variant="success"
        >
          Wanted
        </Button>

        <Button
          icon="cloud-download"
          onClick={onUpdateAllToLatest}
          scale="small"
          title="Install all latest packages version"
          variant="success"
        >
          Latest
        </Button>
        &nbsp;
        &nbsp;
        <Button
          icon="loop-circular"
          onClick={onForceReInstall}
          scale="small"
          title="Remove and re-nstall all packages"
          variant="danger"
        >
          Re-Install
        </Button>
      </RightSection>
    </header>
  );
}
