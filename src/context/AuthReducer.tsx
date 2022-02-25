export enum AuthActionKind {
  LOGIN_START = "LOGIN_START",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
}

interface ActionProps {
  type: AuthActionKind;
  payload: any;
}
const AuthReducer = (state: any, action: ActionProps) => {
  const { type, payload } = action;

  switch (type) {
    case AuthActionKind.LOGIN_SUCCESS: {
      return {
        token: payload.token,
        role: payload.role,
        isLogged: true,
      };
    }

    case AuthActionKind.LOGIN_FAILED: {
      return {
        token: null,
        role: null,
        isLogged: false,
      };
    }

    case AuthActionKind.LOGOUT: {
      return {
        token: null,
        role: null,
        isLogged: false,
      };
    }

    default:
      return state;
  }
};

export default AuthReducer;
