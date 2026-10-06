package com.buyora.api.search.service;

import java.util.*;

public final class SearchTerms {
  private SearchTerms() {}

  public static List<String> expand(String query) {
    String normalized = query.toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " ");
    var result = new LinkedHashSet<String>();
    result.add(normalized);
    for (var group :
        List.of(
            List.of("phone", "smartphone", "mobile"),
            List.of("headphones", "headset", "earphones"),
            List.of("sofa", "couch"),
            List.of("television", "tv"),
            List.of("trainers", "sneakers"),
            List.of("notebook", "laptop"))) if (group.contains(normalized)) result.addAll(group);
    return List.copyOf(result);
  }
}
