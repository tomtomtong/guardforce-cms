const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
const usersString = process.env.USERS;

const users = [];
usersString.split("|").forEach((userString) => {
  const [username, password] = userString.split(",");
  users.push({username, password});
});

const authenticate = (username, password) => {
  const user = users.find((u) => u.username === username);
  if (!user) return null;

  if (user.password !== password) {
    return null;
  }

  const payload = {
    username
  };

  const token = jwt.sign(payload, JWT_SECRET, {})

  return token;
}

const verify = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export default {
  authenticate,
  verify
}
