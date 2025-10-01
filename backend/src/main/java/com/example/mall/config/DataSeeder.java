package com.example.mall.config;

import com.example.mall.user.User;
import com.example.mall.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedDefaultUser(UserRepository users) {
        return args -> {
            users.findByEmail("admin@example.com").orElseGet(() -> {
                User u = new User();
                u.setEmail("admin@example.com");
                u.setName("Admin");
                u.setPassword("sasitha");
                u.setPhone("+94 77 000 0000");
                u.setRole("admin");
                return users.save(u);
            });
        };
    }
}
