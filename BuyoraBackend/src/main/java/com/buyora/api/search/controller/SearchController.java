package com.buyora.api.search.controller;

import com.buyora.api.search.dto.SearchSuggestionResponse;
import com.buyora.api.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/suggestions")
    public ResponseEntity<SearchSuggestionResponse> getSuggestions(@RequestParam(name = "q", defaultValue = "") String query) {
        return ResponseEntity.ok(searchService.getSuggestions(query));
    }
}
