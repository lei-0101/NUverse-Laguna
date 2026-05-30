package com.nuverse_laguna.modules.bulldog_exchange.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import com.nuverse_laguna.shared.exception.AppException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private MerchandiseProduct product;

    @Column(name = "size", length = 20)
    private String size;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "sku", nullable = false, length = 100, unique = true)
    private String sku;

    @Column(name = "stock", nullable = false)
    private int stock;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public static ProductVariant create(MerchandiseProduct product, String size, String color,
                                         String sku, int stock, BigDecimal price) {
        ProductVariant variant = new ProductVariant();
        variant.product = product;
        variant.size = size;
        variant.color = color;
        variant.sku = sku;
        variant.stock = stock;
        variant.price = price;
        return variant;
    }

    // Decrements stock atomically — called inside a pessimistic-write transaction.
    public void reserveStock() {
        if (this.stock <= 0) {
            throw new InsufficientStockException();
        }
        this.stock--;
    }

    // Increments stock — called when a reservation expires or is cancelled.
    public void restoreStock() {
        this.stock++;
    }

    public void updateStock(int newStock) {
        if (newStock < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }
        this.stock = newStock;
    }

    public boolean isAvailable() {
        return this.stock > 0;
    }
}
