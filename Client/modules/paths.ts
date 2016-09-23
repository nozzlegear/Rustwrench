export const Paths = {
    home: {
        index: "/",
    },
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        forgotPassword: "/auth/forgot-password",
    },
    signup: {
        index: "/signup",
    }
}

export default Paths;

/**
 * Returns a regex for the given path. Should be passed a path from the default module export, not a user-input path.
 */
export function getPathRegex(path: string) {
    let output: RegExp;

    switch (path) {
        default: 
            throw new Error("Given path does not have a known regex.");

        case Paths.auth.login:
            output = /\/auth\/login\/?$/i;
        break;
        
        case Paths.auth.logout:
            output = /\/auth\/logout\/?$/i;
        break;

        case Paths.auth.forgotPassword:
            output = /\/auth\/forgot-password\/?$/i;
        break;

        case Paths.home.index:
            output = /\/?$/i;
        break;

        case Paths.signup.index:
            output = /\/signup\/?$/i;
    }

    return output;
}