package com.example.Backend.dto;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Email;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

public class UserUpdateDTO {

    private String name;

    @Email(message = "Please provide a valid email address")
    private String email;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Custom constraint to ensure at least one field is provided
    @Constraint(validatedBy = AtLeastOneFieldValidator.class)
    @Target({ ElementType.TYPE })
    @Retention(RetentionPolicy.RUNTIME)
    public @interface AtLeastOneField {
        String message()

        default "At least one field (name or email) must be provided";Class<?>[] groups() default {
    };

    Class<? extends Payload>[] payload()default{};
}

// Validator implementation
public static class AtLeastOneFieldValidator implements ConstraintValidator<AtLeastOneField, UserUpdateDTO> {
    @Override
    public boolean isValid(UserUpdateDTO dto, ConstraintValidatorContext context) {
        return (dto.getName() != null && !dto.getName().trim().isEmpty()) ||
                (dto.getEmail() != null && !dto.getEmail().trim().isEmpty());
    }
}}