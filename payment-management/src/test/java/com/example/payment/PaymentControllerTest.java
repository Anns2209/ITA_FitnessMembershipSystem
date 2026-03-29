package com.example.payment;

import com.example.payment.controller.PaymentController;
import com.example.payment.model.Payment;
import com.example.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class PaymentControllerTest {

    @Test
    void testGetAllPayments() {
        PaymentService service = Mockito.mock(PaymentService.class);

        Mockito.when(service.getAllPayments())
                .thenReturn(Flux.just(new Payment(1, new BigDecimal("50"), "PAID")));

        PaymentController controller = new PaymentController(service);

        assertNotNull(controller.getAllPayments());
    }
}