export default interface CourseType {
  id: number;
  courseTitle: string;
  courseOverview: string;
  qualification?: {
    qualificationType: string;
  };
  withFoundation: boolean;
  startDate: string;
  courseDuration: string;
  studyMode: string;
  campuses: unknown;
  tuitionFee: string;
  whyStudy: string;
  modules: string;
  careerProspects: string;
  entryRequirements: string;
  englishRequirements: string;
  courseProspectus: string;
  teachingAndAssessment: string;
  additionalInfo?: string;
  feesRegulationInfo: string;
  sandwichYear?: string;
}