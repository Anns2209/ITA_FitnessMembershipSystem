package com.example.payment.repository;

import com.example.payment.model.Payment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface PaymentRepository extends ReactiveCrudRepository<Payment, Long> {

    Flux<Payment> findByMemberId(Integer memberId);

    Flux<Payment> findByStatus(String status);
}