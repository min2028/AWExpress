import {API_URL} from '../../config';
import axios from "axios"

export default async (req, res) => {
  const {userId} = req.query

  if (req.method === 'GET') {
    return axios.get(
      `${API_URL}/user/${userId}/deposit`,
      {headers: {'Content-Type': 'application/json', 'authorization': req.headers.authorization}}
    ).then((response) => {
      if (response.status === 200) {
        return res.status(200).json(response.data);
      }
    }).catch((err) => {
      return res.status(err.response.status).json(err.response.data);
    });
  } else if (req.method === 'PATCH') {
    const depositData = {
      deposit: {
        institutionNumber: req.body.institutionNumber,
        transitNumber: req.body.transitNumber,
        accountNumber:req.body.accountNumber
      }
    }
    return axios.patch(
      `${API_URL}/user/${userId}/deposit`,
      depositData,
      {headers: {'Content-Type': 'application/json', 'authorization': req.headers.authorization}}
    ).then((response) => {
      if (response.status === 200) {
        return res.status(200).json(response.data);
      }
    }).catch((err) => {
      return res.status(err.response.status).json(err.response.data);
    });
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({'error': `Method ${req.method} not allowed`})
  }
}