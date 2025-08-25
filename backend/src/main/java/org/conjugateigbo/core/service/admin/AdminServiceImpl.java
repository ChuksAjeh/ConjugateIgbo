package org.conjugateigbo.core.service.admin;

import org.conjugateigbo.core.model.admin.ContentStatsDTO;
import org.conjugateigbo.core.model.admin.LanguageRequestDTO;
import org.conjugateigbo.core.model.admin.ReportedIssueDTO;
import org.conjugateigbo.core.model.enums.LanguageRequestStatusEnum;
import org.conjugateigbo.core.model.language.LanguageDTO;
import org.conjugateigbo.core.repository.admin.ContentStatsRepository;
import org.conjugateigbo.core.repository.admin.LanguageRequestRepository;
import org.conjugateigbo.core.repository.admin.ReportedIssueRepository;
import org.conjugateigbo.core.repository.language.LanguageRepository;
import org.conjugateigbo.core.repository.sentence.SentenceRepository;
import org.conjugateigbo.core.repository.word.WordRepository;
import org.conjugateigbo.core.service.language.LanguageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminServiceImpl.class);

    @Autowired
    private LanguageRequestRepository languageRequestRepo;
    @Autowired
    private ReportedIssueRepository issueRepo;
    @Autowired
    private ContentStatsRepository statsRepo;
    @Autowired
    private WordRepository wordRepo;
    @Autowired
    private SentenceRepository sentenceRepo;

    @Autowired
    private LanguageService languageService;

    @Autowired
    private LanguageRepository languageRepository;

    @Override
    public LanguageRequestDTO createLanguageRequest(LanguageRequestDTO languageRequest) {
        LOGGER.debug("Creating language request: {}", languageRequest);
        languageRequest.setRequestedAt(Instant.now());
        LanguageRequestDTO savedRequest = languageRequestRepo.save(languageRequest);
        LOGGER.debug("Language request created successfully: {}", savedRequest);
        return savedRequest;
    }

    @Override
    public List<LanguageRequestDTO> getAllLanguageRequests() {
        LOGGER.debug("Fetching all language requests");
        List<LanguageRequestDTO> requests = languageRequestRepo.findAll();
        LOGGER.debug("Retrieved language requests: {}", requests);
        return requests;
    }

    @Override
    public void approveLanguageRequest(String requestId, String adminId) {
        LOGGER.debug("Approving language request with ID: {} by admin: {}", requestId, adminId);
        LanguageRequestDTO req = languageRequestRepo.findById(requestId).orElseThrow();
        req.setStatus(LanguageRequestStatusEnum.APPROVED);
        req.setReviewedAt(Instant.now());
        req.setReviewedByUserId(adminId);
        languageRequestRepo.save(req);
        LOGGER.debug("Language request approved: {}", req);

        LanguageDTO languageDTO = new LanguageDTO(req.getLanguageName(), req.getCountry(), req.getContinent(), req.isDialect(), null, req.getParentLanguageName());
        languageService.addLanguage(languageDTO, req.getParentLanguageName());
        LOGGER.debug("Language created for approved request: {}", languageDTO);

        languageRequestRepo.delete(req);
        LOGGER.debug("Deleted approved language request with ID: {}", requestId);
    }

    @Override
    public void denyLanguageRequest(String requestId, String adminId) {
        LOGGER.debug("Denying language request with ID: {} by admin: {}", requestId, adminId);
        LanguageRequestDTO req = languageRequestRepo.findById(requestId).orElseThrow();
        languageRequestRepo.delete(req);
        LOGGER.debug("Language request denied and deleted: {}", req);
    }

    @Override
    public List<ReportedIssueDTO> getAllReportedIssues() {
        LOGGER.debug("Fetching all reported issues");
        List<ReportedIssueDTO> issues = issueRepo.findAll();
        LOGGER.debug("Retrieved reported issues: {}", issues);
        return issues;
    }

    @Override
    public void resolveIssue(String issueId, String adminId, String adminResponse) {
        LOGGER.debug("Resolving issue with ID: {} by admin: {}", issueId, adminId);
        ReportedIssueDTO issue = issueRepo.findById(issueId).orElseThrow();
        issue.setStatus("RESOLVED");
        issue.setResolvedByUserId(adminId);
        issue.setAdminResponse(adminResponse);
        issue.setResolvedAt(Instant.now());
        issueRepo.save(issue);
        LOGGER.debug("Issue resolved: {}", issue);
    }

    @Override
    public List<ContentStatsDTO> getAllContentStats() {
        LOGGER.debug("Fetching all content stats");
        List<ContentStatsDTO> stats = statsRepo.findAll();
        LOGGER.debug("Retrieved content stats: {}", stats);
        return stats;
    }

    @Override
    public ContentStatsDTO getContentStatsForLanguage(String languageId) {
        LOGGER.debug("Fetching content stats for language ID: {}", languageId);
        ContentStatsDTO stats = statsRepo.findById(languageId).orElseThrow();
        LOGGER.debug("Retrieved content stats for language ID {}: {}", languageId, stats);
        return stats;
    }
}