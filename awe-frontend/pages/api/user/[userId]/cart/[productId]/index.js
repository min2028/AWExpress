import { API_URL } from '../../../../config';
import axios from 'axios';

export default async (req, res) => {
    const { userId, productId } = req.query;

  if (req.method === 'PATCH') {
    const userData = {
      productId: req.body.productId,
      quantity: req.body.quantity,
    }
    return axios.patch(
      `${API_URL}/user/${userId}/cart/${productId}`,
      userData,
      {headers: {'Content-Type': 'application/json', 'authorization': req.headers.authorization}}
    ).then((response) => {
      if (response.status === 200) {
        return res.status(200).json(response.data);
      }
    }).catch((err) => {
      return res.status(err.response.status).json(err.response.data);
    });
  } else if (req.method === 'DELETE') {
    const userData = {
      productId: req.body.productId,
      quantity: req.body.quantity,
    }
    console.log(`sending Post request to Gateway with body ${JSON.stringify(userData)}`)
    return axios.delete(
      `${API_URL}/user/${userId}/cart/${productId}`,
      userData,
      {headers: {'Content-Type': 'application/json', 'authorization': req.headers.authorization}}
    ).then((response) => {
      if (response.status === 200) {
        return res.status(200).json(response.data);
      }
    }).catch((err) => {
      return res.status(err.response.status).json(err.response.data);
    });
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).json({'error': `Method ${req.method} not allowed`})
  }
}


