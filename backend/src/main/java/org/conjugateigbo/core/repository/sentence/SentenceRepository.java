package org.conjugateigbo.core.repository.sentence;

import org.conjugateigbo.core.model.sentence.SentenceDTO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SentenceRepository extends MongoRepository<SentenceDTO, String> {

}
