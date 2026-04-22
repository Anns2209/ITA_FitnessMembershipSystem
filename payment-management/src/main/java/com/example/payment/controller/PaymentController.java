package com.example.payment.controller;

import com.example.payment.model.Payment;
import com.example.payment.service.PaymentService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping
    public Mono<Payment> createPayment(
            @RequestParam Integer memberId,
            @RequestParam BigDecimal amount
    ) {
        return service.createPayment(memberId, amount);
    }

    @GetMapping
    public Flux<Payment> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{memberId}")
    public Flux<Payment> getByMember(@PathVariable Integer memberId) {
        return service.getPaymentsByMember(memberId);
    }

    @GetMapping("/unpaid")
    public Flux<Payment> getUnpaid() {
        return service.getUnpaidPayments();
    }
}
