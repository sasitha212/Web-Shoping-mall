package com.example.mall.user;

import com.example.mall.user.dto.LoginRequest;
import com.example.mall.user.dto.UserCreateRequest;
import com.example.mall.user.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @GetMapping("/users")
    public List<User> list() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public ResponseEntity<User> create(@Valid @RequestBody UserCreateRequest req) {
        User u = new User();
        u.setEmail(req.getEmail());
        u.setName(req.getName());
        u.setPassword(req.getPassword());
        u.setPhone(req.getPhone());
        u.setRole(req.getRole());
        User saved = userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> get(@PathVariable("id") String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> update(@PathVariable("id") String id, @Valid @RequestBody UserUpdateRequest req) {
        return userRepository.findById(id).map(existing -> {
            existing.setName(req.getName());
            if (req.getPhone() != null) { existing.setPhone(req.getPhone()); }
            if (req.getRole() != null) { existing.setRole(req.getRole()); }
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                existing.setPassword(req.getPassword());
            }
            return ResponseEntity.ok(userRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
