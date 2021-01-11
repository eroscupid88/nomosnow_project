import isEmpty from '../validation/isempty';
import { SET_CURRENT_USER } from '../action/types';

// step 2 reducer and manipulate state into new state ...state, user:actiion.payload mean every state remain the same except user>> have new value action.payload(which contain email,name,password&password2)

const initialState = {
  isAuthenticated: false,
  user: {}
};
export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    default:
      return state;
  }
}
