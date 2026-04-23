package com.koreventas.app.catalog;

import com.koreventas.app.catalog.dto.CreateServiceRequest;
import com.koreventas.app.catalog.dto.ServiceResponse;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/services")
public class ServiceController {

  private final ServiceService service;

  public ServiceController(ServiceService service) {
    this.service = service;
  }

  @GetMapping
  public List<ServiceResponse> list() {
    return service.findAll().stream().map(ServiceResponse::from).toList();
  }

  @GetMapping("/{id}")
  public ServiceResponse byId(@PathVariable UUID id) {
    return ServiceResponse.from(service.findById(id));
  }

  @PostMapping
  public ResponseEntity<ServiceResponse> create(@Valid @RequestBody CreateServiceRequest req) {
    Service s = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(ServiceResponse.from(s));
  }

  @PatchMapping("/{id}")
  public ServiceResponse update(@PathVariable UUID id,
                                @Valid @RequestBody CreateServiceRequest req) {
    return ServiceResponse.from(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Servicio desactivado"));
  }
}
