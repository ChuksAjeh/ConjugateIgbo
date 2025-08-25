package org.conjugateigbo.core.service.sentence;

import org.conjugateigbo.core.model.sentence.SentenceDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface SentenceService {
    void addSentence(SentenceDTO sentence, MultipartFile audioFile, MultipartFile imageFile);

    SentenceDTO getSentence(String sentenceId) throws IOException;

    List<SentenceDTO> getAllSentencesForLanguage(String languageID) throws IOException;

    void updateSentence(SentenceDTO sentence, MultipartFile audioFile, MultipartFile imageFile) throws IOException;

    void deleteSentence(String sentenceId) throws IOException;
}
