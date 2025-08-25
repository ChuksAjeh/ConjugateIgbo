package org.conjugateigbo.core.controller.word;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.conjugateigbo.core.model.word.WordDTO;
import org.conjugateigbo.core.service.word.WordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/words")
public class WordController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WordController.class);

    @Autowired
    private WordService wordService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void init() {
        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true)
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
    }

    // ✅ Add a new word
    @PostMapping(value = "/add-word", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addWord(
            @RequestPart("word") String wordJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "audio", required = false) MultipartFile audio
    ) {
        try {
            WordDTO wordDTO = objectMapper.readValue(wordJson, WordDTO.class);
            WordDTO saved = wordService.addWord(wordDTO, image, audio);
            LOGGER.info("Word added successfully: {}", saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            LOGGER.error("Unexpected error while adding word: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add word: " + e.getMessage());
        }
    }

    // ✅ Retrieve a word
    @GetMapping("/get-word")
    public ResponseEntity<?> getWord(
            @RequestParam String wordId) {
        try {
            WordDTO retrievedWord = wordService.getWord(wordId);
            return ResponseEntity.ok(retrievedWord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // ✅ Retrieve all words for a language
    @GetMapping("/all-words")
    public ResponseEntity<?> getAllWordsForLanguage(
            @RequestParam String languageId) {
        try {
            List<WordDTO> words = wordService.getAllWordsForLanguage(languageId);
            return ResponseEntity.ok(words);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Language not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.error("Unexpected error while retrieving words: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // ✅ Update a word
    @PutMapping(value = "/update-word", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateWord(
            @RequestPart("word") String wordJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile) {
        try {
            WordDTO wordDTO = objectMapper.readValue(wordJson, WordDTO.class);
            wordService.updateWord(wordDTO, imageFile, audioFile);
            return ResponseEntity.ok("Word updated successfully.");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Word cannot be verified again within 4 weeks")) {
                LOGGER.warn("Word update conflict: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            LOGGER.error("Word update failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.error("Unexpected error while updating word: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // ✅ Delete a word
    @DeleteMapping("/delete-word")
    public ResponseEntity<?> deleteWord(@RequestParam String wordId) {
        try {
            wordService.deleteWord(wordId);
            return ResponseEntity.ok("Word deleted successfully.");
        } catch (IllegalArgumentException e) {
            LOGGER.error("Word not found for deletion: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.error("Unexpected error while deleting word: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
}
