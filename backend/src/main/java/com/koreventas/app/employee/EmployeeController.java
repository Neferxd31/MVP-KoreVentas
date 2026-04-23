package com.koreventas.app.employee;

import com.koreventas.app.employee.dto.CreateEmployeeRequest;
import com.koreventas.app.employee.dto.EmployeeResponse;
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
@RequestMapping("/employees")
public class EmployeeController {

  private final EmployeeService service;

  public EmployeeController(EmployeeService service) {
    this.service = service;
  }

  @GetMapping
  public List<EmployeeResponse> list() {
    return service.findAll().stream().map(EmployeeResponse::from).toList();
  }

  @GetMapping("/{id}")
  public EmployeeResponse byId(@PathVariable UUID id) {
    return EmployeeResponse.from(service.findById(id));
  }

  @PostMapping
  public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest req) {
    Employee e = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(EmployeeResponse.from(e));
  }

  @PatchMapping("/{id}")
  public EmployeeResponse update(@PathVariable UUID id,
                                 @Valid @RequestBody CreateEmployeeRequest req) {
    return EmployeeResponse.from(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Empleado desactivado"));
  }
}
