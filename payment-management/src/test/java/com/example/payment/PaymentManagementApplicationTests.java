package com.example.payment;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
	"spring.testcontainers.enabled=false",
	"spring.r2dbc.url=r2dbc:h2:mem:///paymentdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
	"spring.r2dbc.username=sa",
	"spring.r2dbc.password=",
	"spring.activemq.broker-url=vm://embedded?broker.persistent=false",
	"spring.activemq.user=admin",
	"spring.activemq.password=admin",
	"spring.sql.init.mode=always"
})
class PaymentManagementApplicationTests {

	@Test
	void contextLoads() {
	}

}
