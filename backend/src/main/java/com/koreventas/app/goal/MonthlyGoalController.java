package com.koreventas.app.goal;

import com.koreventas.app.goal.dto.GoalProgressResponse;
import com.koreventas.app.goal.dto.UpsertGoalRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/goals")
public class MonthlyGoalController {

  private final MonthlyGoalService service;

  public MonthlyGoalController(MonthlyGoalService service) {
    this.service = service;
  }

  @GetMapping("/current")
  public GoalProgressResponse current() {
    return service.currentProgress();
  }

  @PutMapping
  public GoalProgressResponse upsert(@Valid @RequestBody UpsertGoalRequest req) {
    service.upsert(req);
    return service.currentProgress();
  }
}
