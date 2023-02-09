/**
 * Accept.js (Authorize.net)
 * @link https://developer.authorize.net/api/reference/features/acceptjs.html#Integrating_Accept.js_into_Your_Payment_Form
 */
/* eslint-disable @typescript-eslint/naming-convention */
declare namespace Accept {
  interface AuthData {
    clientKey: string;
    apiLoginID: string;
  }

  interface CardData {
    cardNumber: string;
    month: string;
    year: string;
    cardCode?: string;
    zip?: string;
    fullName?: string;
  }

  interface BankData {
    accountNumber: string;
    routingNumber: string;
    nameOnAccount: string;
    accountType: "checking" | "savings" | "businessChecking";
  }

  interface SecureData {
    authData: AuthData;
    /**
     * If using card information instead of banking information,
     * build a cardData object instead of a bankData object.
     */
    cardData?: CardData;
    /**
     * If using banking information instead of card information,
     * build a bankData object instead of a cardData object.
     */
    bankData?: BankData;
  }

  interface OpaqueData {
    dataDescriptor: string;
    dataValue: string;
  }

  interface EncryptedCardData {
    cardNumber: string;
    expData: string;
    bin: string;
  }

  interface CustomerInformation {
    firstName?: string;
    lastName?: string;
  }

  interface IMessage<C extends string, T extends string> {
    code: C;
    text: T;
  }

  type Message =
    | IMessage<"I_WC_01", "Successful">
    | IMessage<"E_WC_01", "Please include Accept.js library from CDN">
    | IMessage<"E_WC_02", "A HTTPS connection is required">
    | IMessage<"E_WC_03", "Accept.js is not loaded correctly">
    | IMessage<"E_WC_04", "Please provide mandatory field to library">
    | IMessage<"E_WC_05", "Please provide valid credit card number">
    | IMessage<"E_WC_06", "Please provide valid expiration month">
    | IMessage<"E_WC_07", "Please provide valid expiration year">
    | IMessage<"E_WC_08", "Expiration date must be in the future">
    | IMessage<"E_WC_10", "Please provide valid apiLoginID">
    | IMessage<"E_WC_13", "Invalid Fingerprint">
    | IMessage<"E_WC_14", "Accept.js encryption failed">
    | IMessage<"E_WC_15", "Please provide valid CVV">
    | IMessage<"E_WC_16", "Please provide valid ZIP code">
    | IMessage<"E_WC_17", "Please provide valid card holder name">
    | IMessage<"E_WC_18", "Client Key is required">
    | IMessage<"E_WC_19", "An error occurred during processing. Please try again">
    | IMessage<"E_WC_21", "User authentication failed due to invalid authentication values">
    | IMessage<"E_WC_23", "Please provide either card information or bank information">
    | IMessage<"E_WC_24", "Please provide valid account number">
    | IMessage<"E_WC_25", "Please provide valid routing number">
    | IMessage<"E_WC_26", "Please provide valid account holder name">
    | IMessage<"E_WC_27", "Please provide valid account type">;

  interface Messages {
    resultCode: "Ok" | "Error";
    message: Message[];
  }

  interface Response {
    messages: Messages;
    opaqueData?: OpaqueData;
    encryptedCardData?: EncryptedCardData;
    customerInformation?: CustomerInformation;
  }

  type ResponseHandler = (response: Response) => void;

  function dispatchData(secureData: SecureData, handler: ResponseHandler): void;
}
