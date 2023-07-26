import {API_URL} from '../../config';
import axios from "axios"

export default async (req, res) => {
    const { userId  } = req.query

    if (req.method === 'POST') {
        return axios.post(
        `${API_URL}/user/${userId}/cancelorder`,
        req.body,
        {headers: {'Content-Type': 'application/json', 'authorization': req.headers.authorization}}
        ).then((response) => {
        if (response.status === 200) {
            return res.status(200).json(response.data);
        }
        }).catch((err) => {
        return res.status(err.response.status).json(err.response.data);
        });
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({'error': `Method ${req.method} not allowed`})
    }
}