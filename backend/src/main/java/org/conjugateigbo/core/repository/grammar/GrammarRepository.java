//package org.conjugateigbo.core.repository.grammar;
//
//import org.conjugateigbo.core.model.grammar.GrammarDTO;
//import org.springframework.data.mongodb.repository.MongoRepository;
//
//import java.util.List;
//
//public interface GrammarRepository extends MongoRepository<GrammarDTO, String> {
//    void deleteByTitleAndLanguageId(String title, String languageId);
//
//    List<GrammarDTO> findByLanguageId(String id);
//}