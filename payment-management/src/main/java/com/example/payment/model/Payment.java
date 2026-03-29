package com.example.payment.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table("payments")
public class Payment {

    @Id
    private Long id;
    private Integer memberId;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;

    public Payment() {}

    public Payment(Integer memberId, BigDecimal amount, String status) {
        this.memberId = memberId;
        this.amount = amount;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    // getters & setters
    public Long getId() { return id; }
    public Integer getMemberId() { return memberId; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setMemberId(Integer memberId) { this.memberId = memberId; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}