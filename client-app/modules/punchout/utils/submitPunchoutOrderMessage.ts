import type { PunchoutCheckoutType } from "../api/graphql/types";

/**
 * Sends the cXML over to the procurement system as a form POST.
 * The response replaces the storefront page, so nothing here runs after the submit.
 */
export function submitPunchoutOrderMessage({
  url,
  formField,
  cxml,
}: Required<Pick<PunchoutCheckoutType, "url" | "formField" | "cxml">>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.hidden = true;

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = formField;
  input.value = cxml;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
}
