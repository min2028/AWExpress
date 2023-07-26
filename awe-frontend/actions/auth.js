import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
} from './types';
import axios from "axios";

export const login = (email, idToken, setSubmitted, setError) => async dispatch => {
    const body = {email: email};
    console.log(`inside login action now.  Calling post to signin API with request body ${JSON.stringify(body)}`);

    return axios.post(
      '/api/auth/signin',
      body,
      {headers: {'Content-Type': 'application/json', 'authorization': idToken}}
    ).then((response) => {
        if (response.status === 200) {
            dispatch({type: LOGIN_SUCCESS, payload: response.data});
            setSubmitted(true);
        } else {
            dispatch({type: LOGIN_FAIL});
            setError(true);
        }
    }).catch((err) => {
        dispatch({type: LOGIN_FAIL});
        setError(true);
    })
}

export const logout = () => async dispatch => {
    dispatch({type: LOGOUT});
}


