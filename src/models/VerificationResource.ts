export enum StepIdTypes {
  AlterationDetection = 'mexican-curp-validation',
  Curp = 'alteration-detection',
  DocumentReading = 'document-reading',
  Facematch = 'facematch',
  Ine = 'mexican-ine-validation',
  Liveness = 'liveness',
  Selfie = 'selfie',
  TemplateMatching = 'template-matching',
  Watchlists = 'watchlists',
}

export enum StepStatusTypes {
  Pending = 0,
  Running = 100,
  Complete = 200,
}

export interface Step {
  id: StepIdTypes;
  status: StepStatusTypes;
  data?: any; // TODO: TBD
  error?: any; // TODO: TBD
}

export interface VerificationDocument {
  type: string;
  country: string;
  region?: string;
  steps: Step[];
  photos: string[];
}

export default interface VerificationResource {
  id: string;
  documents: VerificationDocument[];
  expired?: boolean;
  identity: {}; // TODO: TBD
  steps: Step[];
}
