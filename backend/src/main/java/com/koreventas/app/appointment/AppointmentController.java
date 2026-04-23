package com.koreventas.app.appointment;

import com.koreventas.app.appointment.dto.AppointmentResponse;
import com.koreventas.app.appointment.dto.CreateAppointmentRequest;
import com.koreventas.app.appointment.dto.UpdateAppointmentStatusRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

  private final AppointmentService service;

  public AppointmentController(AppointmentService service) {
    this.service = service;
  }

  /** Lista citas en un rango (ideal para vista semanal). */
  @GetMapping
  public List<AppointmentResponse> listInRange(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
    return service.findInRange(from, to).stream()
        .map(AppointmentResponse::from)
        .toList();
  }

  @GetMapping("/{id}")
  public AppointmentResponse byId(@PathVariable UUID id) {
    return AppointmentResponse.from(service.findById(id));
  }

  @PostMapping
  public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody CreateAppointmentRequest req) {
    Appointment a = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(AppointmentResponse.from(a));
  }

  @PatchMapping("/{id}/status")
  public AppointmentResponse updateStatus(@PathVariable UUID id,
                                          @Valid @RequestBody UpdateAppointmentStatusRequest req) {
    return AppointmentResponse.from(service.updateStatus(id, req));
  }

  @PatchMapping("/{id}/reschedule")
  public AppointmentResponse reschedule(
      @PathVariable UUID id,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startAt) {
    return AppointmentResponse.from(service.reschedule(id, startAt));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
    service.delete(id);
    return ResponseEntity.ok(Map.of("message", "Cita cancelada"));
  }
}
