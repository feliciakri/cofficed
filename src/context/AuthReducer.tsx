export enum AuthActionKind {
  PROFILE_USER = "PROFILE_USER",
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
        profile: null,
        isLogged: true,
      };
    }
    case AuthActionKind.PROFILE_USER: {
      return {
        token: state.token,
        role: state.role,
        profile: { ...payload.profile },
        isLogged: true,
      };
    }
    case AuthActionKind.LOGIN_FAILED: {
      return {
        token: null,
        role: null,
        profile: null,
        isLogged: false,
      };
    }

    case AuthActionKind.LOGOUT: {
      return {
        token: null,
        role: null,
        profile: null,
        isLogged: false,
      };
    }

    default:
      return state;
  }
};

export default AuthReducer;
