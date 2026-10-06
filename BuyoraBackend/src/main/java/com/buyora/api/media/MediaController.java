package com.buyora.api.media;

import com.buyora.api.common.config.BuyoraProperties;
import jakarta.validation.constraints.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
public class MediaController {
  private final JdbcTemplate jdbc;
  private final BuyoraProperties properties;

  @PostMapping("/api/v1/admin/uploads/image")
  public Map<String, Object> upload(@RequestParam MultipartFile file) throws java.io.IOException {
    if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024)
      throw new IllegalArgumentException("Choose an image under 5 MB");
    byte[] bytes = file.getBytes();
    String type = detect(bytes);
    if (type == null) throw new IllegalArgumentException("Use a PNG, JPEG, or WebP image");
    UUID id = UUID.randomUUID();
    jdbc.update(
        "INSERT INTO media_assets(id,content_type,content) VALUES (?,?,?)", id, type, bytes);
    return Map.of("url", "/media/" + id, "publicId", id);
  }

  public static String detect(byte[] b) {
    if (b.length >= 12
        && b[0] == (byte) 0x89
        && b[1] == 'P'
        && b[2] == 'N'
        && b[3] == 'G'
        && b[4] == 13
        && b[5] == 10
        && b[6] == 26
        && b[7] == 10) return "image/png";
    if (b.length >= 3 && b[0] == (byte) 0xff && b[1] == (byte) 0xd8 && b[2] == (byte) 0xff)
      return "image/jpeg";
    if (b.length >= 12
        && b[0] == 'R'
        && b[1] == 'I'
        && b[2] == 'F'
        && b[3] == 'F'
        && b[8] == 'W'
        && b[9] == 'E'
        && b[10] == 'B'
        && b[11] == 'P') return "image/webp";
    return null;
  }

  @PostMapping("/api/v1/admin/uploads/video")
  public Map<String, Object> video(@RequestParam MultipartFile file) throws java.io.IOException {
    if (file.isEmpty() || file.getSize() > 20 * 1024 * 1024)
      throw new IllegalArgumentException("Choose an MP4 under 20 MB");
    byte[] b = file.getBytes();
    if (b.length < 12
        || b[4] != 'f'
        || b[5] != 't'
        || b[6] != 'y'
        || b[7] != 'p'
        || !"video/mp4".equals(file.getContentType()))
      throw new IllegalArgumentException("Choose an MP4 video");
    UUID id = UUID.randomUUID();
    jdbc.update(
        "INSERT INTO media_assets(id,content_type,content) VALUES (?,'video/mp4',?)", id, b);
    return Map.of("url", "/media/" + id);
  }

  @GetMapping("/api/v1/media/{id}")
  public ResponseEntity<byte[]> get(@PathVariable UUID id) {
    var rows =
        jdbc.queryForList(
            "SELECT content_type,content,public_asset FROM media_assets m WHERE id=? AND"
                + " (public_asset OR EXISTS(SELECT 1 FROM review_photos rp JOIN reviews r ON"
                + " r.id=rp.review_id WHERE rp.asset_id=m.id AND r.status='APPROVED') OR (SELECT"
                + " COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles rr ON"
                + " rr.id=ur.role_id WHERE u.email=? AND rr.name='ROLE_ADMIN')>0)",
            id,
            com.buyora.api.auth.security.SecurityUtils.getCurrentUserEmailOptional().orElse(""));
    if (rows.isEmpty()) return ResponseEntity.notFound().build();
    var row = rows.getFirst();
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType((String) row.get("content_type")))
        .header("X-Content-Type-Options", "nosniff")
        .cacheControl(
            Boolean.TRUE.equals(row.get("public_asset"))
                ? CacheControl.maxAge(java.time.Duration.ofDays(365)).cachePublic().immutable()
                : CacheControl.noStore().cachePrivate())
        .body((byte[]) row.get("content"));
  }
}
