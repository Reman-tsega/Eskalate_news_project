export const responseUtil = {
  success: <T>(data: T, message = "OK") => ({ success: true, message, data }),
  error: (message: string) => ({ success: false, message }),
};
