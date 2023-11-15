// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address

const validEmailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const splitPattern = /[,;]\s?|\r|\r\n|\n/g;

export type EmailType = {
  value: string;
  isValid: boolean;
};

export function parseEmails(value?: string): EmailType[] {
  if (!value) {
    return [];
  }
  return prepareEmailsString(value)
    .split(splitPattern)
    .filter((el) => !!el)
    .map((el) => ({
      value: el,
      isValid: validEmailPattern.test(el),
    }));
}

function prepareEmailsString(value?: string): string {
  let result = value?.trim() ?? "";
  if (result.at(-1)?.match(/[,;]/)) {
    result = result.slice(0, -1);
  }
  return result;
}
