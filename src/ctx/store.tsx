import { Dispatch, ReactNode, useReducer } from "react";
import { MikroState } from "./state";
import { Action } from "./action-types";
import { initialState } from "./state";
import { createContext, useContext } from "use-context-selector";
import { reducer } from "./reducer";

interface Context {
  dispatch: Dispatch<Action>;
  state: MikroState;
}

interface Props {
  children: ReactNode;
}

const Context = createContext<Context>({
  dispatch: (_) => {},
  state: initialState,
});

const Store = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
  });

  //   Thunks
  let customDispatch = (action) => {
    if (typeof action === "function") {
      action(customDispatch);
    } else {
      dispatch(action);
    }
  };

  return (
    <Context.Provider value={{ dispatch: customDispatch, state }}>
      {children}
    </Context.Provider>
  );
};

export const useDispatcher = () => {
  return useContext(Context);
};

export { Context };
export { Store };
