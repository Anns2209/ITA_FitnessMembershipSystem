package com.example.payment;

import org.springframework.boot.SpringApplication;

public class TestPaymentManagementApplication {

	public static void main(String[] args) {
		SpringApplication.from(PaymentManagementApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
