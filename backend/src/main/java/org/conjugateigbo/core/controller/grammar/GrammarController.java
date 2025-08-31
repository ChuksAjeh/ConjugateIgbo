//package org.conjugateigbo.core.controller.grammar;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import jakarta.annotation.PostConstruct;
//import org.conjugateigbo.core.model.grammar.GrammarDTO;
//import org.conjugateigbo.core.model.grammar.GrammarExampleDTO;
//import org.conjugateigbo.core.service.grammar.GrammarService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.List;
//
//@RequestMapping("/api/grammar")
//@RestController
//public class GrammarController {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(GrammarController.class);
//
//    @Autowired
//    private GrammarService grammarService;
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
//    @PostMapping(value = "/add-grammar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> addGrammar(
//            @RequestPart("grammar") String grammarJson,
//            @RequestPart(value = "audio", required = false) MultipartFile audio
//    ) {
//        try {
//            GrammarDTO grammarDTO = objectMapper.readValue(grammarJson, GrammarDTO.class);
//            GrammarDTO saved = grammarService.addGrammarWithAudio(grammarDTO, audio);
//            LOGGER.info("Grammar saved successfully: {}", saved);
//            return ResponseEntity.ok(saved);
//        } catch (Exception e) {
//            LOGGER.error("Error while saving grammar: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Failed to add grammar: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/all-grammar")
//    public ResponseEntity<List<GrammarDTO>> getAllGrammars(@RequestParam String languageID) {
//        try {
//            List<GrammarDTO> grammars = grammarService.getAllGrammarsForLanguage(languageID);
//            LOGGER.info("Successfully retrieved all grammar entries.");
//            return ResponseEntity.ok(grammars);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching all grammar entries: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/get-grammar")
//    public ResponseEntity<GrammarDTO> getGrammar(@RequestParam String grammarID) {
//        try {
//            GrammarDTO grammar = grammarService.getGrammarById(grammarID);
//            LOGGER.info("Successfully retrieved grammar: {}", grammar);
//            return ResponseEntity.ok(grammar);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching grammar: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PutMapping(value = "/update-grammar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> updateGrammar(
//            @RequestPart("grammar") String grammarJson,
//            @RequestPart(value = "audio", required = false) MultipartFile audio
//    ) {
//        try {
//            GrammarDTO grammarDTO = objectMapper.readValue(grammarJson, GrammarDTO.class);
//            GrammarDTO updated = grammarService.updateGrammarWithAudio(grammarDTO, audio);
//            LOGGER.info("Grammar updated successfully: {}", updated);
//            return ResponseEntity.ok(updated);
//        } catch (Exception e) {
//            LOGGER.error("Error while updating grammar: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Failed to update grammar: " + e.getMessage());
//        }
//    }
//
//    @DeleteMapping("/delete-grammar")
//    public ResponseEntity<String> deleteGrammar(@RequestParam String grammarID) {
//        try {
//            grammarService.deleteGrammar(grammarID);
//            LOGGER.info("Grammar deleted successfully with ID: {}", grammarID);
//            return ResponseEntity.ok("Grammar deleted successfully");
//        } catch (Exception e) {
//            LOGGER.error("Error while deleting grammar: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PostMapping("/add-grammar-example/{grammarId}")
//    public ResponseEntity<String> addGrammarExample(@PathVariable String grammarId, @RequestBody GrammarExampleDTO grammarExampleDTO) {
//        try {
//            grammarService.addGrammarExample(grammarId, grammarExampleDTO);
//            LOGGER.info("Grammar example added successfully for grammar ID: {}", grammarId);
//            return ResponseEntity.ok("Grammar example added successfully");
//        } catch (Exception e) {
//            LOGGER.error("Error while adding grammar example: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PutMapping("/update-grammar-example/{grammarId}")
//    public ResponseEntity<String> updateGrammarExample(@PathVariable String grammarId, @RequestBody GrammarExampleDTO grammarExampleDTO) {
//        try {
//            grammarService.updateGrammarExample(grammarId, grammarExampleDTO);
//            LOGGER.info("Grammar example updated successfully for grammar ID: {}", grammarId);
//            return ResponseEntity.ok("Grammar example updated successfully");
//        } catch (Exception e) {
//            LOGGER.error("Error while updating grammar example: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @DeleteMapping("/delete-grammar-example/{grammarId}")
//    public ResponseEntity<String> deleteGrammarExample(@PathVariable String grammarId, @RequestParam String exampleId) {
//        try {
//            grammarService.deleteGrammarExample(grammarId, exampleId);
//            LOGGER.info("Grammar example deleted successfully for grammar ID: {} and example ID: {}", grammarId, exampleId);
//            return ResponseEntity.ok("Grammar example deleted successfully");
//        } catch (Exception e) {
//            LOGGER.error("Error while deleting grammar example: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//}
