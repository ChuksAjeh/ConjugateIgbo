//package org.conjugateigbo.core.service.admin;
//
//import org.conjugateigbo.core.model.admin.ContentStatsDTO;
//import org.conjugateigbo.core.model.admin.LanguageRequestDTO;
//import org.conjugateigbo.core.model.admin.ReportedIssueDTO;
//
//import java.util.List;
//
//public interface AdminService {
//    LanguageRequestDTO createLanguageRequest(LanguageRequestDTO languageRequest);
//
//    List<LanguageRequestDTO> getAllLanguageRequests();
//
//    void approveLanguageRequest(String requestId, String adminId);
//
//    void denyLanguageRequest(String requestId, String adminId);
//
//    List<ReportedIssueDTO> getAllReportedIssues();
//
//    void resolveIssue(String issueId, String adminId, String adminResponse);
//
//    List<ContentStatsDTO> getAllContentStats();
//
//    ContentStatsDTO getContentStatsForLanguage(String languageName);
//
//    //    ContentStatsDTO computeContentStatsForLanguage(String languageName);
//}
