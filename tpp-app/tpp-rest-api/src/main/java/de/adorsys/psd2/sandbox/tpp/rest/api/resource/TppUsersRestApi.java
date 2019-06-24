package de.adorsys.psd2.sandbox.tpp.rest.api.resource;

import de.adorsys.ledgers.middleware.api.domain.um.UserTO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.Authorization;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Api(tags = "TPP Users management")
public interface TppUsersRestApi {
    String BASE_PATH = "/tpp/users";

    @ApiOperation(value = "Create users for a given TPP",
        notes = "Endpoint to create a user for a given TPP",
        authorizations = @Authorization(value = "apiKey"))
    @PostMapping
    ResponseEntity<Void> createUser(@RequestBody UserTO account);
}