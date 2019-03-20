package de.adorsys.ledgers.xs2a.test.ctk.redirect;

import de.adorsys.ledgers.middleware.api.domain.payment.TransactionStatusTO;
import de.adorsys.ledgers.middleware.api.domain.sca.ScaStatusTO;
import de.adorsys.ledgers.oba.rest.api.domain.PaymentAuthorisationResponse;
import de.adorsys.psd2.model.PaymentInitationRequestResponse201;
import de.adorsys.psd2.model.TransactionStatus;
import org.junit.Test;
import org.springframework.http.ResponseEntity;

public class SinglePaymentRedirectNoScaIT extends AbstractSinglePaymentRedirect {

    @Test
    public void test_create_payment() {
        // Initiate Payment
        PaymentInitationRequestResponse201 initiatedPayment = paymentInitService.initiatePayment();

        // Login User
        ResponseEntity<PaymentAuthorisationResponse> loginResponseWrapper = paymentInitService.login(initiatedPayment);
        paymentInitService.validateResponseStatus(loginResponseWrapper.getBody(), ScaStatusTO.EXEMPTED, TransactionStatusTO.ACSP);
        paymentInitService.checkTxStatus(initiatedPayment.getPaymentId(), TransactionStatus.ACSP);
    }
}
