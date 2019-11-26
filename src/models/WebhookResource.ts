import IdentityMetadata from './IdentityMetadata';

export enum EventNameTypes {
  StepCompleted = 'step_completed',
  VerificationCompleted = 'verification_completed',
  VerificationExpired = 'verification_expired',
  VerificationInputsCompleted = 'verification_inputs_completed',
  VerificationStarted = 'verification_started',
  VerificationUpdated = 'verification_updated',
}

export default interface WebhookResource {
  eventName: EventNameTypes;
  metadata: IdentityMetadata;
  resource: string;
}
