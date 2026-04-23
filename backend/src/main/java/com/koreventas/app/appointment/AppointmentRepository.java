package com.koreventas.app.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

  @Query("SELECT a FROM Appointment a "
      + "WHERE a.startAt >= :from AND a.startAt < :to "
      + "ORDER BY a.startAt ASC")
  List<Appointment> findInRange(@Param("from") OffsetDateTime from,
                                @Param("to") OffsetDateTime to);

  @Query("SELECT a FROM Appointment a "
      + "WHERE a.employeeId = :employeeId AND a.startAt >= :from AND a.startAt < :to "
      + "ORDER BY a.startAt ASC")
  List<Appointment> findByEmployeeInRange(@Param("employeeId") UUID employeeId,
                                          @Param("from") OffsetDateTime from,
                                          @Param("to") OffsetDateTime to);

  @Query("SELECT COUNT(a) FROM Appointment a "
      + "WHERE a.status = com.koreventas.app.appointment.AppointmentStatus.AGENDADA "
      + "AND a.startAt >= :from AND a.startAt < :to")
  long countUpcoming(@Param("from") OffsetDateTime from,
                     @Param("to") OffsetDateTime to);
}
