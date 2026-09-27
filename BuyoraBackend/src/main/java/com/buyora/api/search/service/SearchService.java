package com.buyora.api.search.service;

import com.buyora.api.search.dto.SearchSuggestionResponse;

public interface SearchService {
    SearchSuggestionResponse getSuggestions(String query);
}
