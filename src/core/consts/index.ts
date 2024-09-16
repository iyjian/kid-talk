export enum UserContainerStatus {
  Created = 1,
  Running = 2,
  Failed = 3,
}

export enum DockerContainerStatus {
  'created' = 'created',
  'running' = 'running',
  'exited' = 'exited',
  'paused' = 'paused',
  'restarting' = 'restarting',
  'removing' = 'removing',
  'dead' = 'dead',
  'notpresent' = 'notpresent',
}

export const BAD_QUESTION_SCORE_LOWWER_BOUND = 0.3;
