package org.conjugateigbo.core.repository.language;

import org.conjugateigbo.core.model.language.LanguageDTO;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface LanguageRepository extends MongoRepository<LanguageDTO, String> {

    Optional<LanguageDTO> findByLanguageNameAndIsDialect(String upperCase, boolean b);

    Optional<Object> findByLanguageNameAndCountryAndContinent(String languageName, String country, String continent);
}