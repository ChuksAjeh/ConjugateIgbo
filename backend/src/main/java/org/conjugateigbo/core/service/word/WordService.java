package org.conjugateigbo.core.service.word;

import org.conjugateigbo.core.model.word.WordDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface WordService {
    WordDTO addWord(WordDTO word, MultipartFile audioFile, MultipartFile imageFile);

    WordDTO getWord(String wordId) throws IOException;

    List<WordDTO> getAllWordsForLanguage(String languageId) throws IOException;

    void updateWord(WordDTO word, MultipartFile audioFile, MultipartFile imageFile) throws IOException;

    void deleteWord(String wordId) throws IOException;

    WordDTO addWordWithFiles(WordDTO wordDTO, MultipartFile image, MultipartFile audio);

}
