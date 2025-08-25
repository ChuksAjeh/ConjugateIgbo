package org.conjugateigbo.core.repository.admin;

import org.conjugateigbo.core.model.admin.ReportedIssueDTO;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReportedIssueRepository extends MongoRepository<ReportedIssueDTO, String> {
}
