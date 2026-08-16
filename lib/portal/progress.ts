export interface ProgressResource {
  id: string;
  required: boolean;
  completed: boolean;
}

export function calculateProgress(resources: ProgressResource[]) {
  const required = resources.filter((resource) => resource.required);
  if (!required.length) return 0;
  const completed = required.filter((resource) => resource.completed).length;
  return Math.round((completed / required.length) * 100);
}

export function isVideoComplete(percentComplete: number) {
  return percentComplete >= 90;
}
