/* tslint:disable */

/**
 * Account Reference
 */
export interface AccountReference {
  aspspAccountId?: string;

  /**
   * BBAN: This data elements is used for payment accounts which have no IBAN
   */
  bban?: string;

  /**
   * Codes following ISO 4217
   */
  currency?: string;

  /**
   * IBAN: This data element can be used in the body of the CreateConsentReq Request Message for retrieving account access consent from this payment account
   */
  iban?: string;

  /**
   * MASKEDPAN: Primary Account Number (PAN) of a card in a masked form.
   */
  maskedPan?: string;

  /**
   * MSISDN: An alias to access a payment account via a registered mobile phone number. This alias might be needed e.g. in the payment initiation service, cp. Section 5.3.1. The support of this alias must be explicitly documented by the ASPSP for the corresponding API calls.
   */
  msisdn?: string;

  /**
   * PAN: Primary Account Number (PAN) of a card, can be tokenized by the ASPSP due to PCI DSS requirements.
   */
  pan?: string;

  /**
   * RESOURCE-ID: This identification is denoting the addressed account.
   */
  resourceId?: string;
}
