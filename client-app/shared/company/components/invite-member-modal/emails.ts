// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const validEmailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const splitPattern = /[,;]\s?|\r|\r\n|\n|\s/g;

export type EmailType = {
  value: string;
  isValid: boolean;
};

export function parseEmails(value?: string): EmailType[] {
  if (!value) {
    return [];
  }

  return value
    .trim()
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

export function getInvalidEmails(emails: EmailType[] = []): string {
  return emails
    .filter((el) => !el.isValid)
    .map((el) => el.value)
    .join(", ");
}

export function normalizeEmails(emails: EmailType[] = []): string[] {
  return [...new Set(emails.filter((el) => el.isValid).map((email) => email.value.toLowerCase()))];
}
