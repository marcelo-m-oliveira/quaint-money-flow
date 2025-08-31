export class PlanInUseError extends Error {
  constructor(message: string = 'Plano em uso') {
    super(message)
    this.name = 'PlanInUseError'
  }
}
