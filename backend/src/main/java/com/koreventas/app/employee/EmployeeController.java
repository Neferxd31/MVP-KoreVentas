package com.koreventas.app.employee;

import com.koreventas.app.employee.dto.CreateEmployeeRequest;
import com.koreventas.app.employee.dto.EmployeeResponse;
import com.koreventas.app.security.CurrentUser;
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
  private final CurrentUser currentUser;

  public EmployeeController(EmployeeService service, CurrentUser currentUser) {
    this.service = service;
    this.currentUser = currentUser;
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
    currentUser.requireAdmin();
    Employee e = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(EmployeeResponse.from(e));
  }

  @PatchMapping("/{id}")
  public EmployeeResponse update(@PathVariable UUID id,
                                 @Valid @RequestBody CreateEmployeeRequest req) {
    currentUser.requireAdmin();
    return EmployeeResponse.from(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    currentUser.requireAdmin();
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Empleado desactivado"));
  }
}
