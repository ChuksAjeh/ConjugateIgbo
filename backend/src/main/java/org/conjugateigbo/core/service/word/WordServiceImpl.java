package org.conjugateigbo.core.service.word;

import org.conjugateigbo.core.exception.LanguageNotFoundException;
import org.conjugateigbo.core.exception.WordNotFoundException;
import org.conjugateigbo.core.model.language.LanguageDTO;
import org.conjugateigbo.core.model.word.WordDTO;
import org.conjugateigbo.core.repository.language.LanguageRepository;
import org.conjugateigbo.core.repository.word.WordRepository;
import org.conjugateigbo.core.util.FileStorageUtil;
import org.conjugateigbo.core.util.WordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WordServiceImpl implements WordService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WordServiceImpl.class);

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private LanguageRepository languageRepository;

    @Autowired
    private FileStorageUtil fileStorageUtil;

    @Autowired
    private WordUtil wordUtil;

    @Override
    public WordDTO addWord(WordDTO word, MultipartFile imageFile, MultipartFile audioFile) {
        LOGGER.debug("Adding new word: {}", word);
        LanguageDTO language = getLanguage(word.getLanguageId());
        if (audioFile != null && !audioFile.isEmpty()) {
            word.setAudioFileId(storeAudioFile(audioFile));
        }
        if (imageFile != null && !imageFile.isEmpty()) {
            word.setImageFileId(storeImageFile(imageFile));
        }
        wordRepository.save(word);
        LOGGER.debug("Word added successfully: {}", word.getWord());
        return word;
    }

    @Override
    public WordDTO getWord(String wordId) throws IOException {
        LOGGER.debug("Fetching word: {}", wordId);
        Optional<WordDTO> wordOpt = wordRepository.findById(wordId);
        if (wordOpt.isEmpty()) {
            LOGGER.error("Word not found: {}", wordId);
            throw new WordNotFoundException("Word not found.");
        }
        WordDTO foundWord = wordOpt.get();
//        if (foundWord.getAudioFileId() != null) {
//            try (InputStream audioStream = fileStorageUtil.getFileStream(foundWord.getAudioFileId())) {
//                byte[] audioBytes = audioStream.readAllBytes();
//                foundWord.setAudioBase64("data:audio/mpeg;base64," + Base64.encodeBase64String(audioBytes));
//            }
//        }
//        if (foundWord.getImageFileId() != null) {
//            try (InputStream imageStream = fileStorageUtil.getFileStream(foundWord.getImageFileId())) {
//                byte[] imageBytes = imageStream.readAllBytes();
//                foundWord.setImageBase64("data:image/jpeg;base64," + Base64.encodeBase64String(imageBytes));
//            }
//        }
        LOGGER.debug("Retrieved word: {}", foundWord);
        return foundWord;
    }

    @Override
    public List<WordDTO> getAllWordsForLanguage(String languageId) {
        LOGGER.debug("Fetching all words for language ID: {}", languageId);
        LanguageDTO language = getLanguage(languageId);
        List<WordDTO> words = wordRepository.findAll().stream()
                .filter(w -> w.getLanguageId().equals(language.getId()))
                .collect(Collectors.toList());
        LOGGER.debug("Retrieved words for language ID {}: {}", languageId, words);
        return words;
    }

    @Override
    public void updateWord(WordDTO word, MultipartFile imageFile, MultipartFile audioFile) throws IOException {
        LOGGER.debug("Updating word: {}", word);
        WordDTO wordToUpdate = getWord(word.getId());
        wordToUpdate.setWord(word.getWord());
        wordToUpdate.setTranslation(word.getTranslation());
        wordToUpdate.setDefinition(word.getDefinition());
        if (word.getExample() != null) {
            wordToUpdate.setExample(word.getExample());
        }
        if (word.getPronunciationTip() != null) {
            wordToUpdate.setPronunciationTip(word.getPronunciationTip());
        }
        // Only check verification time restriction if the word is being verified and wasn't verified before
        // or if it was already verified and is being verified again
        if (word.isVerified() && wordToUpdate.isVerified() && !wordUtil.canVerifyWord(wordToUpdate.getLastVerifiedAt())) {
            LOGGER.error("Word cannot be verified again within 4 weeks.");
            throw new IllegalArgumentException("Word cannot be verified again within 4 weeks.");
        }

        // If the word is being verified, update the lastVerifiedAt timestamp
        if (word.isVerified()) {
            wordToUpdate.setVerified(true);
            wordToUpdate.setLastVerifiedAt(LocalDateTime.now());
        }
        if (audioFile != null && !audioFile.isEmpty()) {
            wordToUpdate.setAudioFileId(storeAudioFile(audioFile));
        }
        if (imageFile != null && !imageFile.isEmpty()) {
            wordToUpdate.setImageFileId(storeImageFile(imageFile));
        }
        wordRepository.save(wordToUpdate);
        LOGGER.debug("Word updated successfully: {}", wordToUpdate);
    }

    @Override
    public void deleteWord(String wordId) throws IOException {
        LOGGER.debug("Deleting word: {}", wordId);
        wordRepository.deleteById(wordId);
        LOGGER.debug("Word deleted successfully: {}", wordId);
    }

    @Override
    public WordDTO addWordWithFiles(WordDTO wordDTO, MultipartFile image, MultipartFile audio) {
        //            if (image != null && !image.isEmpty()) {
//                String imageBase64 = java.util.Base64.getEncoder().encodeToString(image.getBytes());
//                wordDTO.setImageBase64(imageBase64);
//            }
//            if (audio != null && !audio.isEmpty()) {
//                String audioBase64 = java.util.Base64.getEncoder().encodeToString(audio.getBytes());
//                wordDTO.setAudioBase64(audioBase64);
//            }

        wordDTO.setVerified(false);
        return wordRepository.save(wordDTO);
    }


    private LanguageDTO getLanguage(String languageId) {
        LOGGER.debug("Fetching language by ID: {}", languageId);
        return languageRepository.findById(languageId)
                .orElseThrow(() -> new LanguageNotFoundException("Language not found."));
    }

    private String storeAudioFile(MultipartFile audioFile) {
        LOGGER.debug("Storing audio file");
        try {
            return fileStorageUtil.storeFile(audioFile);
        } catch (IOException e) {
            LOGGER.error("Failed to store audio file: {}", e.getMessage());
            return null;
        }
    }

    private String storeImageFile(MultipartFile imageFile) {
        LOGGER.debug("Storing image file");
        try {
            return fileStorageUtil.storeFile(imageFile);
        } catch (IOException e) {
            LOGGER.error("Failed to store image file: {}", e.getMessage());
            return null;
        }
    }
}
