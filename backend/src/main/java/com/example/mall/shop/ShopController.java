package com.example.mall.shop;

import com.example.mall.user.UserRepository;
import com.example.mall.shop.dto.ShopCreateRequest;
import com.example.mall.shop.dto.ShopUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    public ShopController(ShopRepository shopRepository, UserRepository userRepository) {
        this.shopRepository = shopRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Shop> list(){ return shopRepository.findAll(); }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ShopCreateRequest req){
        if(!userRepository.existsById(req.getOwnerUserId())){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Owner userId not found");
        }
        Shop s = new Shop();
        s.setShopName(req.getShopName());
        s.setDescription(req.getDescription());
        s.setOwnerUserId(req.getOwnerUserId());
        s.setContactNumber(req.getContactNumber());
        s.setAddress(req.getAddress());
        return ResponseEntity.status(HttpStatus.CREATED).body(shopRepository.save(s));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> get(@PathVariable("id") String id){
        return shopRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") String id, @RequestBody ShopUpdateRequest req){
        return shopRepository.findById(id).map(existing -> {
            if(req.getOwnerUserId()!=null && !userRepository.existsById(req.getOwnerUserId())){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Owner userId not found");
            }
            if(req.getShopName()!=null) existing.setShopName(req.getShopName());
            if(req.getDescription()!=null) existing.setDescription(req.getDescription());
            if(req.getOwnerUserId()!=null) existing.setOwnerUserId(req.getOwnerUserId());
            if(req.getContactNumber()!=null) existing.setContactNumber(req.getContactNumber());
            if(req.getAddress()!=null) existing.setAddress(req.getAddress());
            return ResponseEntity.ok(shopRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id){
        if(shopRepository.existsById(id)) { shopRepository.deleteById(id); return ResponseEntity.noContent().build(); }
        return ResponseEntity.notFound().build();
    }
}
