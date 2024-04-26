const Opts = {
  SECRETS_SOURCE: 'env',
  ACCESS_TOKEN_EXPIRY: '120m',
  REFRESH_TOKEN_EXPIRY: '14d',
  FORGOT_PASSWORD_OTP_EXPIRY: '10m',
  // day * hrs * minutes * seconds  * ms
  FORGOT_PASSWORD_OTP_EXPIRY_SCHEMA: 1000 * 60 * 10,
};

export default Opts;
