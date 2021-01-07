const checkInput = (username, password) => {
  if (username && username.length >= 3) {
    return (password && password.length >= 3) ? '' : 'password';
  }
  return 'username';
};

module.exports = {
  checkInput,
};
