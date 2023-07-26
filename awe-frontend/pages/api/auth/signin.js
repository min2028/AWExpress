import axios from "axios";
import { API_URL } from '../config';
import { useDispatch } from "react-redux";
import { login } from "../../../actions/auth";


// req.body = {"email": <char>}
// response.data = {"userId": <int>, "email": <char>}
export default async (req, res) => {
  if (req.method === 'POST') {
      return axios.post(
        `${API_URL}/user/login`,
        req.body,
        {headers: {'Content-Type': 'application/json', 'authorization': req.headers.authorization}})
        .then((response) => {
        if (response.status === 200) {
          return res.status(200).json(response.data)
        } else {
          return res.status(response.status).json("Login failed")
        }
      }).catch((err) => {
          console.log(`AWS Gateway failed, error object is: ${JSON.stringify(err.response.data)}`)
          return res.status(500).json("Login failed")
      })
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json(`Method ${req.method} not allowed`)
  }

};