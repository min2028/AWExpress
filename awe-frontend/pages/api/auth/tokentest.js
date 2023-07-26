import { getToken } from 'next-auth/jwt'
import axios from "axios";

export default async (req, res) => {
  const token = await getToken({ req, raw: true });
  return res.status(200).json({ token });

}