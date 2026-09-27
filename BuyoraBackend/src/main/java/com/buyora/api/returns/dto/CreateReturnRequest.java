package com.buyora.api.returns.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReturnRequest {
    @jakarta.validation.constraints.Size(max = 2000)
    @NotBlank
    private String reason;
    @jakarta.validation.constraints.NotEmpty
    private java.util.List<@jakarta.validation.constraints.Positive Long> itemIds;
    @jakarta.validation.constraints.Size(max=1000)
    private String notes;
}
