/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import { useIsFetching } from '@tanstack/react-query';
import type { VFC } from 'react';
import styled, { css } from 'styled-components';

import type {
  Basic,
  DependencyInstalledExtras,
  Type,
} from '../../../../server/types/dependency.types';
import type { CSSType } from '../../../Styled';
import { Button } from '../../../ui/Button/Button';
import { ConfirmButton } from '../../../ui/ConfirmButton/ConfirmButton';
import { getNormalizedRequiredVersion } from '../../../utils';
import { Loader } from '../../Loader';
import { useProjectPath } from '../../use-project-path';

interface Props {
  dependency: DependencyInstalledExtras;
  isProcessing: boolean;
  hasTypesBelow: boolean;
  isGlobal: boolean;
  onDeleteDependency: (dependency: DependencyInstalledExtras) => void;
  onInstallDependencyVersion: (dependency: Basic, type: Type) => void;
}

interface TrStyledProps {
  isProcessing: boolean;
  hasTypesBelow: boolean;
}

const ONE_KB = 1024;
const DIGITS = 2;

const TrStyled = styled.tr<TrStyledProps>`
  @keyframes Gradient {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  ${({ isProcessing }): CSSType =>
    isProcessing &&
    css`
      background: linear-gradient(-45deg, #dfd7ca, #fff);
      background-size: 200% 200%;
      animation: Gradient 2s ease infinite;
    `}

  ${({ hasTypesBelow }): CSSType =>
    hasTypesBelow &&
    css`
      td {
        border-bottom: 0px;
      }
    `}
`;

const ColumnName = styled.td<{ prod: boolean }>`
  text-align: left;
  padding-left: 5px;

  font-weight: ${(props): CSSType => (props.prod ? 'bold' : '')};
`;

const ColumnVersion = styled.td`
  width: 10%;
  min-width: 80px;
`;

const ColumnSize = styled.td`
  width: 10%;
  min-width: 80px;
`;

const ColumnScore = styled.td`
  width: 10%;
  min-width: 80px;
`;

const ColumnAction = styled.td`
  width: 30px;
`;

const RepoName = styled.a`
  border-radius: 2px;
  color: #fff;
  float: right;
  font-size: 0.8em;
  font-weight: bold;
  padding: 0.2em 0.4em;
  background: #ef5c0e;
  text-decoration: none;
`;

const Missing = styled.span`
  color: #d9534f;
`;

const ScoreBadge = styled.a<{ score?: number }>`
  color: white;
  text-decoration: none;
  font-weight: 100;
  padding: 3px 5px;
  border-radius: 2px;

  ${({ score }): CSSType => score && score >= 85 && 'color: #4c1;'}
  ${({ score }): CSSType => score && score < 85 && 'background: #dbab09;'}
  ${({ score }): CSSType => score && score < 70 && 'background: #e05d44;'}
`;

const BundleSizeLink = styled.a`
  text-decoration: none;
  color: black;
`;

interface VersionProps {
  dependency: DependencyInstalledExtras;
  isProcessing: boolean;
  onInstall: (version: string) => void;
}

const InstalledVersion: VFC<VersionProps> = ({
  dependency,
  isProcessing,
  onInstall,
}) => {
  const dependencyInstalled = dependency.installed;

  if (dependencyInstalled === undefined) {
    return <Loader />;
  }

  if (dependencyInstalled === null) {
    return <Missing>missing</Missing>;
  }

  if (
    dependency.type === 'global' ||
    getNormalizedRequiredVersion(dependency.required) === dependencyInstalled
  ) {
    return <span>{dependencyInstalled}</span>;
  }

  return (
    <Button
      disabled={isProcessing}
      icon="cloud-download"
      onClick={(): void => {
        onInstall(dependencyInstalled);
      }}
      scale="small"
      title={`Install ${dependencyInstalled} version of ${dependency.name}`}
      variant="success"
    >
      {dependencyInstalled}
    </Button>
  );
};

const WantedVersion: VFC<VersionProps> = ({
  dependency,
  isProcessing,
  onInstall,
}) => {
  const dependencyWanted = dependency.wanted;

  if (dependencyWanted === null) {
    return <>-</>;
  }

  if (typeof dependencyWanted === 'string') {
    return (
      <Button
        disabled={isProcessing}
        icon="cloud-download"
        onClick={(): void => {
          onInstall(dependencyWanted);
        }}
        scale="small"
        title={`Install ${dependencyWanted} version of ${dependency.name}`}
        variant="success"
      >
        {dependencyWanted}
      </Button>
    );
  }

  return null;
};

const LatestVersion: VFC<VersionProps> = ({
  dependency,
  isProcessing,
  onInstall,
}) => {
  const dependencyLatest = dependency.latest;

  if (dependencyLatest === null) {
    return <>-</>;
  }

  if (typeof dependencyLatest === 'string') {
    return (
      <Button
        disabled={isProcessing}
        icon="cloud-download"
        onClick={(): void => {
          onInstall(dependencyLatest);
        }}
        scale="small"
        title={`Install ${dependencyLatest} version of ${dependency.name}`}
        variant="success"
      >
        {dependencyLatest}
      </Button>
    );
  }

  return null;
};

export const DependencyRow: VFC<Props> = ({
  dependency,
  hasTypesBelow,
  onDeleteDependency,
  onInstallDependencyVersion,
  isGlobal,
}) => {
  const projectPath = useProjectPath();

  const isFetching =
    useIsFetching(['get-project-dependencies-full', projectPath]) > 0;

  return (
    <TrStyled
      hasTypesBelow={hasTypesBelow}
      isProcessing={isFetching}
      key={`${dependency.name}${dependency.manager}`}
    >
      {!isGlobal && <td>{dependency.type !== 'prod' && dependency.type}</td>}

      <ColumnName prod={dependency.type === 'prod'}>
        {dependency.name}

        <RepoName
          href={`https://www.npmjs.com/package/${dependency.name}`}
          target="_blank"
        >
          {dependency.manager}
        </RepoName>
      </ColumnName>

      <ColumnScore>
        {typeof dependency.score === 'number' && (
          <ScoreBadge
            href={`https://snyk.io/advisor/npm-package/${dependency.name}`}
            score={dependency.score}
            target="_blank"
          >
            {dependency.score}%
          </ScoreBadge>
        )}
      </ColumnScore>

      <ColumnSize>
        {typeof dependency.size === 'number' && (
          <BundleSizeLink
            href={`https://bundlephobia.com/package/${dependency.name}@${dependency.installed}`}
            target="_blank"
          >
            {`${Number.parseFloat(`${dependency.size / ONE_KB}`).toFixed(
              DIGITS,
            )}kB`}
          </BundleSizeLink>
        )}
      </ColumnSize>

      {/* <td className={style.columnNsp}> ? </td> */}

      {!isGlobal && (
        <ColumnVersion>
          {dependency.required}

          {typeof dependency.required !== 'string' && (
            <Missing>extraneous</Missing>
          )}
        </ColumnVersion>
      )}

      <ColumnVersion>
        <InstalledVersion
          dependency={dependency}
          isProcessing={isFetching}
          onInstall={(version): void => {
            onInstallDependencyVersion(
              { name: dependency.name, version },
              dependency.type,
            );
          }}
        />
      </ColumnVersion>

      <ColumnVersion>
        <WantedVersion
          dependency={dependency}
          isProcessing={isFetching}
          onInstall={(version): void => {
            onInstallDependencyVersion(
              { name: dependency.name, version },
              dependency.type,
            );
          }}
        />
      </ColumnVersion>

      <ColumnVersion>
        <LatestVersion
          dependency={dependency}
          isProcessing={isFetching}
          onInstall={(version): void => {
            onInstallDependencyVersion(
              { name: dependency.name, version },
              dependency.type,
            );
          }}
        />
      </ColumnVersion>

      <ColumnAction>
        <ConfirmButton
          disabled={isFetching}
          icon="trash"
          onClick={(): void => {
            onDeleteDependency(dependency);
          }}
          scale="small"
          variant="danger"
        />
      </ColumnAction>
    </TrStyled>
  );
};