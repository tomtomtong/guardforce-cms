import auth from '../../libs/auth';

export default function handler(req, res) {
  const {username, password} = req.body;

  const token = auth.authenticate(username, password);
  if (!token) {
    res.status(200).json({success: false});
    return;
  }
  res.status(200).json({success: true, token});
}
