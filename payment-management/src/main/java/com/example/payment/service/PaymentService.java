package com.example.payment.service;

import com.example.payment.model.Payment;
import com.example.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import com.example.payment.messaging.PaymentProducer;

@Service
public class PaymentService {

    private final PaymentRepository repository;
    private final PaymentProducer producer;

    public PaymentService(PaymentRepository repository, PaymentProducer producer) {
        this.repository = repository;
        this.producer = producer;
    }

    // ustvarjanje plačila
    public Mono<Payment> createPayment(Integer memberId, BigDecimal amount) {
    Payment payment = new Payment(memberId, amount, "PAID");

    return repository.save(payment)
            .doOnSuccess(p -> {
                producer.sendPaymentMessage("Payment created for member " + memberId);
            });
}

    // vsa plačila
    public Flux<Payment> getAllPayments() {
        return repository.findAll();
    }

    // plačila za člana
    public Flux<Payment> getPaymentsByMember(Integer memberId) {
        return repository.findByMemberId(memberId);
    }

    // neporavnana plačila
    public Flux<Payment> getUnpaidPayments() {
        return repository.findByStatus("UNPAID");
    }
}