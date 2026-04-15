package com.koreventas.app.customer;

import com.koreventas.app.customer.dto.CreateCustomerRequest;
import com.koreventas.app.customer.dto.CustomerResponse;
import com.koreventas.app.customer.dto.UpdateCustomerRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/customers")
public class CustomerController {

  private final CustomerService service;

  public CustomerController(CustomerService service) {
    this.service = service;
  }

  @GetMapping
  public List<CustomerResponse> list() {
    return service.findAll().stream().map(CustomerResponse::from).toList();
  }

  @GetMapping("/search")
  public List<CustomerResponse> search(@RequestParam String q) {
    return service.search(q).stream().map(CustomerResponse::from).toList();
  }

  @GetMapping("/phone/{phone}")
  public ResponseEntity<CustomerResponse> byPhone(@PathVariable String phone) {
    return service.findByPhone(phone)
        .map(c -> ResponseEntity.ok(CustomerResponse.from(c)))
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @GetMapping("/tag/{tag}")
  public List<CustomerResponse> byTag(@PathVariable String tag) {
    CustomerTag ct = CustomerTag.valueOf(tag.toUpperCase());
    return service.findByTag(ct).stream().map(CustomerResponse::from).toList();
  }

  @GetMapping("/inactive")
  public List<CustomerResponse> inactive() {
    return service.findInactive().stream().map(CustomerResponse::from).toList();
  }

  @GetMapping("/{id}")
  public CustomerResponse byId(@PathVariable UUID id) {
    return CustomerResponse.from(service.findById(id));
  }

  @PostMapping
  public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest req) {
    Customer customer = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(CustomerResponse.from(customer));
  }

  @PatchMapping("/{id}")
  public CustomerResponse update(@PathVariable UUID id,
                                 @Valid @RequestBody UpdateCustomerRequest req) {
    return CustomerResponse.from(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Cliente eliminado"));
  }

  @PostMapping("/recalculate-tags")
  public Map<String, Object> recalculateTags() {
    int count = service.recalculateAllTags();
    return Map.of("message", "Etiquetas recalculadas", "customersUpdated", count);
  }
}
