import React, { useReducer } from "react";
import AuthReducer from "./AuthReducer";

export interface AuthContextInterface {
  token: string | null;
  role: string | null;
  isLogged: boolean;
}

const getUserInLocalStorage = JSON.parse(localStorage.getItem("users") || "{}");
const isToken = getUserInLocalStorage.token;
const isRole = getUserInLocalStorage.role;

const initialState = {
  token: isToken || null,
  role: isRole || null,
  isLogged: isToken ? true : false,
};

export const AuthContext = React.createContext<{
  state: AuthContextInterface;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const AuthContextProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
