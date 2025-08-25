package org.conjugateigbo.core.service.grammar;

import org.conjugateigbo.core.model.grammar.GrammarDTO;
import org.conjugateigbo.core.model.grammar.GrammarExampleDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface GrammarService {
    void addNewGrammar(GrammarDTO grammar);

    GrammarDTO addGrammarWithAudio(GrammarDTO grammar, MultipartFile audio) throws IOException;

    Optional<GrammarDTO> getGrammarByTitle(String title);

    GrammarDTO getGrammarById(String grammarId);

    List<GrammarDTO> getAllGrammarsForLanguage(String languageID);

    void updateGrammar(GrammarDTO grammarDTO);

    GrammarDTO updateGrammarWithAudio(GrammarDTO grammarDTO, MultipartFile audio) throws IOException;

    void deleteGrammar(String grammarId);

    void addGrammarExample(String grammarId, GrammarExampleDTO grammarExampleDTO);

    List<GrammarExampleDTO> getAllGrammarExamples(String grammarId);

    void updateGrammarExample(String grammarId, GrammarExampleDTO grammarExampleDTO);

    void deleteGrammarExample(String grammarId, String exampleId);
}
