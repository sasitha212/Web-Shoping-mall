package com.example.mall.product;

import com.example.mall.product.dto.ProductCreateRequest;
import com.example.mall.product.dto.ProductUpdateRequest;
import com.example.mall.shop.ShopRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;

    public ProductController(ProductRepository productRepository, ShopRepository shopRepository) {
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
    }

    @GetMapping
    public List<Product> list(@RequestParam(value = "shopId", required = false) String shopId){
        if(shopId != null){ return productRepository.findByShopId(shopId); }
        return productRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProductCreateRequest req){
        if(!shopRepository.existsById(req.getShopId())){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("shopId not found");
        }
        Product p = new Product();
        p.setProductName(req.getProductName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setQuantity(req.getQuantity());
        p.setCategory(req.getCategory());
        p.setShopId(req.getShopId());
        return ResponseEntity.status(HttpStatus.CREATED).body(productRepository.save(p));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable("id") String id){
        return productRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") String id, @RequestBody ProductUpdateRequest req){
        return productRepository.findById(id).map(existing -> {
            if(req.getShopId()!=null && !shopRepository.existsById(req.getShopId())){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("shopId not found");
            }
            if(req.getProductName()!=null) existing.setProductName(req.getProductName());
            if(req.getDescription()!=null) existing.setDescription(req.getDescription());
            if(req.getPrice()!=null) existing.setPrice(req.getPrice());
            if(req.getQuantity()!=null) existing.setQuantity(req.getQuantity());
            if(req.getCategory()!=null) existing.setCategory(req.getCategory());
            if(req.getShopId()!=null) existing.setShopId(req.getShopId());
            return ResponseEntity.ok(productRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id){
        if(productRepository.existsById(id)) { productRepository.deleteById(id); return ResponseEntity.noContent().build(); }
        return ResponseEntity.notFound().build();
    }
}
