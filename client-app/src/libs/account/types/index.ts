export type SignMeUp = {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
};

export type SignMeIn = {
  userName: string;
  password: string;
  rememberMe?: boolean;
};
