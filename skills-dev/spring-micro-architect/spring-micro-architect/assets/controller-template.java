package app.${SERVICE_NAME}.controller;

import app.${SERVICE_NAME}.dto.${ENTITY_NAME}Request;
import app.${SERVICE_NAME}.dto.${ENTITY_NAME}Response;
import app.${SERVICE_NAME}.entity.${ENTITY_NAME};
import app.${SERVICE_NAME}.mapper.${ENTITY_NAME}Mapper;
import app.${SERVICE_NAME}.service.interfaces.I${ENTITY_NAME}Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/${ENDPOINT}")
@RequiredArgsConstructor
public class ${ENTITY_NAME}Controller {

    private final I${ENTITY_NAME}Service ${SERVICE_VAR}Service;
    private final ${ENTITY_NAME}Mapper ${SERVICE_VAR}Mapper;

    @PostMapping
    public ResponseEntity<${ENTITY_NAME}Response> create(@RequestBody ${ENTITY_NAME}Request request) {
        ${ENTITY_NAME} entity = ${SERVICE_VAR}Service.create(request);
        return new ResponseEntity<>(${SERVICE_VAR}Mapper.toResponse(entity), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<${ENTITY_NAME}Response> getById(@PathVariable UUID id) {
        ${ENTITY_NAME} entity = ${SERVICE_VAR}Service.getById(id);
        return ResponseEntity.ok(${SERVICE_VAR}Mapper.toResponse(entity));
    }
}
