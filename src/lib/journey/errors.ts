export class JourneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JourneyError";
  }
}

export class JourneyForbiddenError extends JourneyError {
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "JourneyForbiddenError";
  }
}
