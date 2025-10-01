package com.example.mall.user.dto;

import jakarta.validation.constraints.NotBlank;

public class UserUpdateRequest {
    @NotBlank
    private String name;

    private String password;

    private String phone;

    private String role;


    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

