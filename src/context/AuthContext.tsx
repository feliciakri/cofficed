import axios from "axios";
import React, { useEffect, useReducer } from "react";
import { useQuery } from "react-query";
import AuthReducer, { AuthActionKind } from "./AuthReducer";

export interface AuthContextInterface {
  token: string | null;
  role: string | null;
  isLogged: boolean;
  profile: any;
}

const getUserInLocalStorage = JSON.parse(localStorage.getItem("users") || "{}");
const isToken = getUserInLocalStorage.token;
const isRole = getUserInLocalStorage.role;

const initialState = {
  token: isToken || null,
  role: isRole || null,
  profile: null,
  isLogged: isToken ? true : false,
};

export const AuthContext = React.createContext<{
  state: AuthContextInterface;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null,
});
const fetchProfile = async (token: any) => {
  if (token) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_URL}/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
};
export const AuthContextProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);
  const { data, refetch } = useQuery("getProfile", () =>
    fetchProfile(state.token)
  );

  useEffect(() => {
    if (state.token) {
      refetch();
    }

    if (data) {
      dispatch({
        type: AuthActionKind.PROFILE_USER,
        payload: {
          profile: data,
        },
      });
    }
  }, [state.token, refetch, data]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
