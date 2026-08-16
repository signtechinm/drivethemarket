export interface TemplateClassInput {
  title: string;
  description: string | null;
  learningOutcomes: string[];
  expectedMinutes: number | null;
  position: number;
}

export interface TemplateModuleInput {
  title: string;
  description: string | null;
  position: number;
  classes: TemplateClassInput[];
}

export function buildBatchModuleCopies(modules: TemplateModuleInput[]) {
  return [...modules]
    .sort((left, right) => left.position - right.position)
    .map((module) => ({
      title: module.title,
      description: module.description,
      position: module.position,
      classes: {
        create: [...module.classes]
          .sort((left, right) => left.position - right.position)
          .map((classTemplate) => ({
            title: classTemplate.title,
            description: classTemplate.description,
            learningOutcomes: classTemplate.learningOutcomes,
            expectedMinutes: classTemplate.expectedMinutes,
            position: classTemplate.position,
          })),
      },
    }));
}
