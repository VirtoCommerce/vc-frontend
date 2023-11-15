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
    .map((el) => {
      const email = el.trim();
      return {
        value: email,
        isValid: validEmailPattern.test(email),
      };
    });
}

function prepareEmailsString(value?: string): string {
  let result = value?.trim() ?? "";
  if (result.at(-1)?.match(/[,;]/)) {
    result = result.slice(0, -1);
  }
  return result;
}

export function getInvalidEmails(emails: EmailType[] = []): string {
  return emails
    .filter((el) => !el.isValid)
    .map((el) => el.value)
    .join(", ");
}

export function normalizeEmails(emails: EmailType[] = []): string[] {
  return [...new Set(emails.filter((el) => el.isValid).map((email) => email.value.toLowerCase()))];
}
