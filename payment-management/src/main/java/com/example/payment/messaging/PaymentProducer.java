package com.example.payment.messaging;

import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

@Component
public class PaymentProducer {

    private final JmsTemplate jmsTemplate;

    public PaymentProducer(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void sendPaymentMessage(String message) {
        jmsTemplate.convertAndSend("payment.queue", message);
        System.out.println("Sent message: " + message);
    }
}