export type FieldValidationErrorType = {
  /** Path of the input field in the mutation command, e.g. `lastName` or `addresses[0].firstName`. */
  field: string;
  /** The rule that failed, e.g. `InvalidCharacters`. */
  errorCode?: string;
};
