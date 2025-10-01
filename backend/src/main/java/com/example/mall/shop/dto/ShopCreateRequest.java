package com.example.mall.shop.dto;

import jakarta.validation.constraints.NotBlank;

public class ShopCreateRequest {
    @NotBlank
    private String shopName;
    private String description;
    @NotBlank
    private String ownerUserId;
    private String contactNumber;
    private String address;

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
