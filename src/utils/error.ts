

export class CustomError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number){
        super(message)
        this.name = this.constructor.name;
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, CustomError.prototype)
    }
}

export class BadRequestError extends CustomError{
    field?: string;

    constructor(message: string, field?: string){
        super(message, 400);
        this.name = "BadRequestError";
        this.field = field;

        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string) {
      super(message, 404);
      this.name = "NotFoundError";
      Object.setPrototypeOf(this, NotFoundError.prototype);
    }
  }
  
  export class AuthenticationError extends CustomError {
    constructor(message: string) {
      super(message, 401);
      this.name = "AuthenticationError";
      Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
  }
  
  export class InternalServerError extends CustomError {
    constructor(message: string = "Internal Server Error") {
      super(message, 500);
      this.name = "InternalServerError";
      Object.setPrototypeOf(this, InternalServerError.prototype);
    }
  }
  