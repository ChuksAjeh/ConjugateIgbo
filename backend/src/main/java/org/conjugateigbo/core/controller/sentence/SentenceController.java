//package org.conjugateigbo.core.controller.sentence;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import jakarta.annotation.PostConstruct;
//import org.conjugateigbo.core.model.sentence.SentenceDTO;
//import org.conjugateigbo.core.service.sentence.SentenceServiceImpl;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/sentences")
//public class SentenceController {
//    private static final Logger LOGGER = LoggerFactory.getLogger(SentenceController.class);
//
//    @Autowired
//    private SentenceServiceImpl sentenceServiceImpl;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @PostConstruct
//    public void init() {
//        objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
//                .configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true)
//                .configure(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
//    }
//
//    @PostMapping(value = "/add-sentence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> addSentence(
//            @RequestPart("sentence") String sentenceJson,
//            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile,
//            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
//        try {
//            SentenceDTO sentence = objectMapper.readValue(sentenceJson, SentenceDTO.class);
//            sentenceServiceImpl.addSentence(sentence, audioFile, imageFile);
//            LOGGER.info("Sentence added successfully: {}", sentence);
//            return ResponseEntity.ok("Sentence saved successfully.");
//        } catch (IllegalArgumentException e) {
//            LOGGER.error("Failed to add sentence: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            LOGGER.error("Unexpected error while adding sentence: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
//        }
//    }
//
//    @GetMapping("/get-sentence")
//    public ResponseEntity<?> getSentence(@RequestParam String sentenceId) {
//        try {
//            SentenceDTO retrievedSentence = sentenceServiceImpl.getSentence(sentenceId);
//            LOGGER.info("Successfully retrieved sentence: {}", retrievedSentence);
//            return ResponseEntity.ok(retrievedSentence);
//        } catch (IllegalArgumentException e) {
//            LOGGER.error("Sentence not found: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (IOException e) {
//            LOGGER.error("Unexpected error while retrieving sentence: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
//        }
//    }
//
//    @GetMapping("/all-sentences")
//    public ResponseEntity<?> getAllSentencesForLanguage(@RequestParam String languageID) {
//        try {
//            List<SentenceDTO> sentences = sentenceServiceImpl.getAllSentencesForLanguage(languageID);
//            LOGGER.info("Successfully retrieved all sentences for language ID: {}", languageID);
//            return ResponseEntity.ok(sentences);
//        } catch (IllegalArgumentException e) {
//            LOGGER.error("Language not found: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (Exception e) {
//            LOGGER.error("Unexpected error while retrieving sentences: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
//        }
//    }
//
//    @PutMapping(value = "/update-sentence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> updateSentence(
//            @RequestPart("sentence") String sentenceJson,
//            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile,
//            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
//        try {
//            SentenceDTO sentence = objectMapper.readValue(sentenceJson, SentenceDTO.class);
//            sentenceServiceImpl.updateSentence(sentence, audioFile, imageFile);
//            LOGGER.info("Sentence updated successfully: {}", sentence);
//            return ResponseEntity.ok("Sentence updated successfully.");
//        } catch (IllegalArgumentException e) {
//            if (e.getMessage().contains("Sentence cannot be verified again within 4 weeks")) {
//                LOGGER.warn("Sentence update conflict: {}", e.getMessage());
//                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
//            }
//            LOGGER.error("Sentence update failed: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
//        } catch (Exception e) {
//            LOGGER.error("Unexpected error while updating sentence: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
//        }
//    }
//
//    @DeleteMapping("/delete-sentence")
//    public ResponseEntity<?> deleteSentence(@RequestParam String sentenceID) {
//        try {
//            sentenceServiceImpl.deleteSentence(sentenceID);
//            LOGGER.info("Sentence deleted successfully: {}", sentenceID);
//            return ResponseEntity.ok("Sentence deleted successfully.");
//        } catch (IllegalArgumentException e) {
//            LOGGER.error("Sentence not found for deletion: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (Exception e) {
//            LOGGER.error("Unexpected error while deleting sentence: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
//        }
//    }
//}
