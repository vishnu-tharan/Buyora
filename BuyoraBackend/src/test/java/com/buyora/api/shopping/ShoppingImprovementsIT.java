package com.buyora.api.shopping;

import static org.assertj.core.api.Assertions.*;

import com.buyora.api.common.AbstractIntegrationTest;
import com.buyora.api.product.controller.FacetController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class ShoppingImprovementsIT extends AbstractIntegrationTest {
  @Autowired JdbcTemplate jdbc;
  @Autowired FacetController facets;

  @Test
  void migrationsCreateTheNewOperationalTables() {
    for (String table :
        java.util.List.of(
            "email_outbox",
            "product_alerts",
            "return_items",
            "analytics_daily",
            "media_assets",
            "review_photos",
            "store_settings",
            "payment_reconciliation",
            "product_complements"))
      assertThat(
              jdbc.queryForObject(
                  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND"
                      + " table_name=?",
                  Integer.class,
                  table))
          .isEqualTo(1);
  }

  @Test
  void globalFacetsAcceptAnUnspecifiedCategory() {
    assertThat(facets.facets(null)).isNotNull();
  }

  @Test
  void analyticsAggregateEventsWithoutKeepingSearchOrContactData() {
    jdbc.update(
        "INSERT INTO analytics_daily(day,event,count) VALUES (CURRENT_DATE,'search',1) ON"
            + " CONFLICT(day,event) DO UPDATE SET count=analytics_daily.count+1");
    assertThat(
            jdbc.queryForObject(
                "SELECT count FROM analytics_daily WHERE day=CURRENT_DATE AND event='search'",
                Long.class))
        .isPositive();
  }
}
