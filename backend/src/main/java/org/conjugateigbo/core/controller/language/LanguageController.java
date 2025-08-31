//package org.conjugateigbo.core.controller.language;
//
//import org.conjugateigbo.core.exception.DuplicateLanguageException;
//import org.conjugateigbo.core.exception.LanguageNotFoundException;
//import org.conjugateigbo.core.model.language.LanguageDTO;
//import org.conjugateigbo.core.service.language.LanguageService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RequestMapping("/api/languages")
//@RestController
//public class LanguageController {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(LanguageController.class);
//
//    @Autowired
//    private LanguageService languageService;
//
//    @GetMapping("/all-languages")
//    public ResponseEntity<List<LanguageDTO>> getAllLanguages() {
//        try {
//            List<LanguageDTO> languages = languageService.getAllLanguages();
//            LOGGER.info("Successfully retrieved all languages.");
//            return ResponseEntity.ok(languages);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching all languages: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/get-language")
//    public ResponseEntity<LanguageDTO> getLanguage(@RequestParam String languageId) {
//        try {
//            LanguageDTO language = languageService.getLanguage(languageId);
//            LOGGER.info("Successfully retrieved language: {}", language);
//            return ResponseEntity.ok(language);
//        } catch (LanguageNotFoundException e) {
//            LOGGER.error("Language not found for id: {}", languageId, e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching language by name: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PostMapping("/add-language")
//    public ResponseEntity<String> addLanguage(@RequestBody LanguageDTO languageToBeAdded,
//                                              @RequestParam(required = false) String parentLanguage) {
//        try {
//            languageService.addLanguage(languageToBeAdded, parentLanguage);
//            LOGGER.info("Language added successfully: {}", languageToBeAdded);
//            return ResponseEntity.ok("Language saved successfully");
//        } catch (DuplicateLanguageException e) {
//            LOGGER.error("Cannot save duplicate languages: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.CONFLICT).build();
//        } catch (Exception e) {
//            LOGGER.error("Error while saving language: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PutMapping("/update-language")
//    public ResponseEntity<String> updateLanguage(@RequestBody LanguageDTO updatingLanguage) {
//        try {
//            languageService.updateLanguage(updatingLanguage);
//            LOGGER.info("Language updated successfully: {}", updatingLanguage);
//            return ResponseEntity.ok("Language updated successfully");
//        } catch (LanguageNotFoundException e) {
//            LOGGER.error("Unable to update language. Language not found for name: {}", updatingLanguage.getLanguageName(), e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            LOGGER.error("Error while updating language: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @DeleteMapping("/delete-language")
//    public ResponseEntity<String> deleteLanguage(@RequestParam String languageId) {
//        try {
//            languageService.deleteLanguage(languageId);
//            LOGGER.info("Language deleted successfully: {}", languageId);
//            return ResponseEntity.ok("Language deleted successfully");
//        } catch (LanguageNotFoundException e) {
//            LOGGER.error("Unable to delete language. Language not found for Id: {}", languageId, e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            LOGGER.error("Error while deleting language: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PutMapping("/update-visibility")
//    public ResponseEntity<String> updateLanguageVisibility(@RequestParam String languageId, @RequestParam boolean isVisible) {
//        try {
//            languageService.updateLanguageVisibility(languageId, isVisible);
//            LOGGER.info("Language visibility updated successfully for ID: {}", languageId);
//            return ResponseEntity.ok("Language visibility updated successfully");
//        } catch (LanguageNotFoundException e) {
//            LOGGER.error("Unable to update visibility. Language not found for ID: {}", languageId, e);
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//        } catch (Exception e) {
//            LOGGER.error("Error while updating language visibility: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//}