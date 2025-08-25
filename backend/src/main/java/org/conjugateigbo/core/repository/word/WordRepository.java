package org.conjugateigbo.core.repository.word;

import org.conjugateigbo.core.model.word.WordDTO;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WordRepository extends MongoRepository<WordDTO, String> {
}
