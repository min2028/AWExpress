import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
} from '../actions/types';

const initialState = {
    user: null,
};

const authReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch(type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                user: payload
            }
        case LOGIN_FAIL:
            return {
                ...state,
            }
        case LOGOUT:
            return {
                ...state,
                user: null
            }
        default:
            return state;
    }
};

export default authReducer