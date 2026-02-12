export type CreationPhase =
  | "idle"
  | "creating"
  | "provisioning"
  | "complete"
  | "error"

export type StepStatus = "done" | "in-progress" | "pending" | "error"
