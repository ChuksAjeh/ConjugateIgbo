//package org.conjugateigbo.core.controller.admin;
//
//import org.conjugateigbo.core.model.admin.ContentStatsDTO;
//import org.conjugateigbo.core.model.admin.LanguageRequestDTO;
//import org.conjugateigbo.core.model.admin.ReportedIssueDTO;
//import org.conjugateigbo.core.service.admin.AdminService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/admin")
//public class AdminController {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(AdminController.class);
//
//    @Autowired
//    private AdminService adminService;
//
//    @PostMapping("/create-language-requests")
//    public ResponseEntity<LanguageRequestDTO> createLanguageRequest(
//            @RequestBody LanguageRequestDTO languageRequest) {
//        try {
//            LanguageRequestDTO createdRequest = adminService.createLanguageRequest(languageRequest);
//            LOGGER.info("Language request created successfully: {}", createdRequest);
//            return ResponseEntity.ok(createdRequest);
//        } catch (Exception e) {
//            LOGGER.error("Error while creating language request: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/language-requests")
//    public ResponseEntity<List<LanguageRequestDTO>> getAllLanguageRequests() {
//        try {
//            List<LanguageRequestDTO> requests = adminService.getAllLanguageRequests();
//            LOGGER.info("Successfully retrieved all language requests.");
//            return ResponseEntity.ok(requests);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching language requests: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PostMapping("/language-requests/{id}/approve")
//    public ResponseEntity<String> approveLanguageRequest(
//            @PathVariable String id,
//            @RequestParam String adminId) {
//        try {
//            adminService.approveLanguageRequest(id, adminId);
//            LOGGER.info("Language request approved successfully for ID: {}", id);
//            return ResponseEntity.ok("Request approved.");
//        } catch (Exception e) {
//            LOGGER.error("Error while approving language request: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PostMapping("/language-requests/{id}/deny")
//    public ResponseEntity<String> denyLanguageRequest(
//            @PathVariable String id,
//            @RequestParam String adminId) {
//        try {
//            adminService.denyLanguageRequest(id, adminId);
//            LOGGER.info("Language request denied successfully for ID: {}", id);
//            return ResponseEntity.ok("Request denied.");
//        } catch (Exception e) {
//            LOGGER.error("Error while denying language request: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/issues")
//    public ResponseEntity<List<ReportedIssueDTO>> getAllIssues() {
//        try {
//            List<ReportedIssueDTO> issues = adminService.getAllReportedIssues();
//            LOGGER.info("Successfully retrieved all reported issues.");
//            return ResponseEntity.ok(issues);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching reported issues: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PostMapping("/issues/{id}/resolve")
//    public ResponseEntity<String> resolveIssue(
//            @PathVariable String id,
//            @RequestParam String adminId,
//            @RequestParam(required = false) String response) {
//        try {
//            adminService.resolveIssue(id, adminId, response);
//            LOGGER.info("Issue resolved successfully for ID: {}", id);
//            return ResponseEntity.ok("Issue resolved.");
//        } catch (Exception e) {
//            LOGGER.error("Error while resolving issue: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/content-stats")
//    public ResponseEntity<List<ContentStatsDTO>> getAllContentStats() {
//        try {
//            List<ContentStatsDTO> stats = adminService.getAllContentStats();
//            LOGGER.info("Successfully retrieved all content stats.");
//            return ResponseEntity.ok(stats);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching content stats: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/content-stats-by language")
//    public ResponseEntity<ContentStatsDTO> getStatsByLanguage(
//            @RequestParam String languageId) {
//        try {
//            ContentStatsDTO stats = adminService.getContentStatsForLanguage(languageId);
//            LOGGER.info("Successfully retrieved content stats for language ID: {}", languageId);
//            return ResponseEntity.ok(stats);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching content stats for language ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//}