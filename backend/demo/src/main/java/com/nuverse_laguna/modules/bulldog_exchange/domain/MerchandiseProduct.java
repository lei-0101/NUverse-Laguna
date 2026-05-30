package com.nuverse_laguna.modules.bulldog_exchange.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "merchandise_products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MerchandiseProduct extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", nullable = false, length = 5000)
    private String description;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private MerchandiseCategory category;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductVariant> variants = new ArrayList<>();

    public static MerchandiseProduct create(String name, String description, String imageUrl,
                                             MerchandiseCategory category) {
        MerchandiseProduct product = new MerchandiseProduct();
        product.name = name;
        product.description = description;
        product.imageUrl = imageUrl;
        product.category = category;
        product.active = true;
        return product;
    }

    public void update(String name, String description, String imageUrl, MerchandiseCategory category) {
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    public void deactivate() {
        this.active = false;
    }

    public void activate() {
        this.active = true;
    }
}
