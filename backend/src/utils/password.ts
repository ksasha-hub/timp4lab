export const isStrongPassword = (password: string) => {
  return password.length >= 8
    && password.length <= 20
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
};
