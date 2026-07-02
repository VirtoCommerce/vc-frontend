import backendPackages from "../../../backend-packages.json";

type ManifestModuleType = { Id: string; Version: string };
type BackendModuleType = { moduleId?: string | null; version?: string | null };

export type OutdatedBackendModuleType = {
  moduleId: string;
  backendVersion: string;
  expectedVersion: string;
};

function parseVersion(version: string): number[] {
  return version.split(".").map((part) => Number.parseInt(part, 10) || 0);
}

export function compareVersions(a: string, b: string): number {
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function getManifestModules(): ManifestModuleType[] {
  return backendPackages.Sources.flatMap((source) => (source.Modules ?? []) as ManifestModuleType[]);
}

export function getOutdatedModules(
  backendModules: readonly BackendModuleType[] | null | undefined,
): OutdatedBackendModuleType[] {
  if (!backendModules?.length) {
    return [];
  }

  const manifestByModuleId = new Map(getManifestModules().map((module) => [module.Id, module.Version]));
  const outdated: OutdatedBackendModuleType[] = [];

  for (const backendModule of backendModules) {
    if (!backendModule.moduleId || !backendModule.version) {
      continue;
    }

    const expectedVersion = manifestByModuleId.get(backendModule.moduleId);
    if (!expectedVersion) {
      continue;
    }

    if (compareVersions(backendModule.version, expectedVersion) < 0) {
      outdated.push({
        moduleId: backendModule.moduleId,
        backendVersion: backendModule.version,
        expectedVersion,
      });
    }
  }

  return outdated;
}
