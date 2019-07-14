import { combineReducers } from "redux";
import alert from "./alert";
import auth from './auth'
import profile from './Profile'
import post from './post'
export default combineReducers({
  alert,
  auth,
  profile,
  post
});
