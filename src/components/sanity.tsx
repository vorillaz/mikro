import { getSanityCount } from "src/ctx/selectors";
import { useDispatcher } from "src/ctx/store";
import { ActionTypes } from "src/ctx/action-types";

export const Sanity = () => {
  const { dispatch } = useDispatcher();
  const count = getSanityCount();
  const onAdd = () => {
    dispatch({
      type: ActionTypes.SANITY_ADD_COUNTER,
      payload: { count: count + 1 },
    });
  };
  return (
    <div>
      <b>{count}</b>
      <button onClick={onAdd}>Add</button>
    </div>
  );
};
