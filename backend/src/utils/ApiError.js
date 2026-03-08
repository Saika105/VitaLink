class ApiError extends Error{
    constructor(
        status,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message);
        this.status = status;
        this.data = null; 
        this.message = message; 
        this.success = false; 
        this.errors = errors;

        // track  which line of code is causing the error in which  file
        // ***remove when deploy it to production
        if (stack) {
            this.stack = stack 
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}