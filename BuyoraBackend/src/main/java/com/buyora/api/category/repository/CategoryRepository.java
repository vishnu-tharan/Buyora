package com.buyora.api.category.repository;

import com.buyora.api.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByPublicId(UUID publicId);
    List<Category> findAllByParentIsNullAndActiveTrueOrderBySortOrderAsc();
    List<Category> findAllByParentAndActiveTrueOrderBySortOrderAsc(Category parent);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    
    @Query("SELECT c FROM Category c WHERE c.active = true ORDER BY c.level ASC, c.sortOrder ASC")
    List<Category> findAllActiveOrderedByLevelAndSort();
    
    // Check for potential cyclic relationships
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.id = :childId AND c.path LIKE %:parentPath%")
    boolean wouldCreateCycle(Long childId, String parentPath);
}
