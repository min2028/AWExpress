import { combineReducers } from 'redux';
import authReducer from './auth';
import amountsReducer from './amounts';

// So can call by 'auth' instead of 'authReducer'
export default combineReducers({
    auth: authReducer,
    amounts: amountsReducer
    // Add more here
});