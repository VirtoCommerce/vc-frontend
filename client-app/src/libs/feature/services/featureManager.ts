import { features } from 'core/constants';

export function isActive(featureName: string) {
  if (features == null) {
    throw new Error("Couldn't obtain features.");
  }

  const featureState = (features as any)[featureName];
  if (featureState == null) {
    throw new Error(`Couldn't obtain the feature by name "${featureName}"`);
  }

  return featureState;
}


