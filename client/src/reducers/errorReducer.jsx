import { GET_ERRORS } from '../action/types';

// step 2 reducer and manipulate state into new state ...state, user:actiion.payload mean every state remain the same except user>> have new value action.payload(which contain email,name,password&password2)

const initialState = {};
export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload;
    default:
      return state;
  }
}
