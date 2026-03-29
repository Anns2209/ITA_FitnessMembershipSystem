package com.example.payment;

import com.example.payment.messaging.PaymentProducer;
import com.example.payment.model.Payment;
import com.example.payment.repository.PaymentRepository;
import com.example.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.math.BigDecimal;

public class PaymentServiceTest {

    @Test
    void testCreatePayment() {
        PaymentRepository repository = Mockito.mock(PaymentRepository.class);
        PaymentProducer producer = Mockito.mock(PaymentProducer.class);

        Payment payment = new Payment(1, new BigDecimal("50"), "PAID");

        Mockito.when(repository.save(Mockito.any()))
                .thenReturn(Mono.just(payment));

        PaymentService service = new PaymentService(repository, producer);

        Mono<Payment> result = service.createPayment(1, new BigDecimal("50"));

        StepVerifier.create(result)
                .expectNextMatches(p -> p.getAmount().equals(new BigDecimal("50")))
                .verifyComplete();
    }
}