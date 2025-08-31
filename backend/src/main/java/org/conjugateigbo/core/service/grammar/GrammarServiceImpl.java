//package org.conjugateigbo.core.service.grammar;
//
//import org.conjugateigbo.core.exception.LanguageNotFoundException;
//import org.conjugateigbo.core.model.grammar.GrammarDTO;
//import org.conjugateigbo.core.model.grammar.GrammarExampleDTO;
//import org.conjugateigbo.core.model.language.LanguageDTO;
//import org.conjugateigbo.core.repository.grammar.GrammarRepository;
//import org.conjugateigbo.core.repository.language.LanguageRepository;
//import org.conjugateigbo.core.util.FileStorageUtil;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class GrammarServiceImpl implements GrammarService {
//    private static final Logger LOGGER = LoggerFactory.getLogger(GrammarServiceImpl.class);
//
//    @Autowired
//    private GrammarRepository grammarRepository;
//
//    @Autowired
//    private LanguageRepository languageRepository;
//
//    @Autowired
//    private FileStorageUtil fileStorageUtil;
//
//    @Override
//    public void addNewGrammar(GrammarDTO grammar) {
//        LOGGER.debug("Adding new grammar: {}", grammar);
//        grammarRepository.save(grammar);
//        LOGGER.debug("Grammar added successfully: {}", grammar);
//    }
//
//    @Override
//    public Optional<GrammarDTO> getGrammarByTitle(String title) {
//        LOGGER.debug("Fetching grammar by title: {}", title);
//        Optional<GrammarDTO> grammar = grammarRepository.findAll().stream()
//                .filter(g -> g.getTitle().equalsIgnoreCase(title))
//                .findFirst();
//        LOGGER.debug("Retrieved grammar by title {}: {}", title, grammar);
//        return grammar;
//    }
//
//    @Override
//    public GrammarDTO getGrammarById(String grammarId) {
//        LOGGER.debug("Fetching grammar by ID: {}", grammarId);
//        Optional<GrammarDTO> grammar = grammarRepository.findById(grammarId);
//        if (grammar.isPresent()) {
//            LOGGER.debug("Retrieved grammar by ID {}: {}", grammarId, grammar.get());
//            return grammar.get();
//        } else {
//            LOGGER.error("Grammar not found with ID: {}", grammarId);
//            return null;
//        }
//    }
//
//    @Override
//    public List<GrammarDTO> getAllGrammarsForLanguage(String languageID) {
//        LOGGER.debug("Fetching all grammars");
//        LanguageDTO language = getLanguage(languageID);
//
//        List<GrammarDTO> grammars = grammarRepository.findAll().stream()
//                .filter(s -> s.getLanguageId().equals(language.getId()))
//                .collect(Collectors.toList());
//        LOGGER.debug("Retrieved sentences for language ID {}: {}", languageID, grammars);
//
//        return grammars;
//    }
//
//    @Override
//    public void updateGrammar(GrammarDTO grammarDTO) {
//        LOGGER.debug("Updating grammar: {}", grammarDTO);
//        Optional<GrammarDTO> existingGrammar = grammarRepository.findById(grammarDTO.getId());
//        existingGrammar.ifPresent(grammar -> {
//            grammar.setTitle(grammarDTO.getTitle());
//            grammar.setNativeScript(grammarDTO.getNativeScript());
//            grammar.setDescription(grammarDTO.getDescription());
//            grammar.setRule(grammarDTO.getRule());
//            grammar.setExamples(grammarDTO.getExamples());
//            grammar.setLanguageId(grammarDTO.getLanguageId());
//            grammar.setAudioFileId(grammarDTO.getAudioFileId());
//            grammar.setAudioBase64(grammarDTO.getAudioBase64());
//            grammar.setVerified(grammarDTO.isVerified());
//            grammar.setCreatedAt(grammarDTO.getCreatedAt());
//            grammar.setLastVerifiedAt(grammarDTO.getLastVerifiedAt());
//            grammarRepository.save(grammar);
//            LOGGER.debug("Grammar updated successfully: {}", grammar);
//        });
//    }
//
//    @Override
//    public GrammarDTO updateGrammarWithAudio(GrammarDTO grammarDTO, MultipartFile audio) throws IOException {
//        LOGGER.debug("Updating grammar with audio: {}", grammarDTO);
//        Optional<GrammarDTO> existingGrammarOpt = grammarRepository.findById(grammarDTO.getId());
//        if (existingGrammarOpt.isEmpty()) {
//            LOGGER.error("Grammar not found with ID: {}", grammarDTO.getId());
//            throw new IllegalArgumentException("Grammar not found with ID: " + grammarDTO.getId());
//        }
//
//        GrammarDTO existingGrammar = existingGrammarOpt.get();
//        existingGrammar.setTitle(grammarDTO.getTitle());
//        existingGrammar.setNativeScript(grammarDTO.getNativeScript());
//        existingGrammar.setDescription(grammarDTO.getDescription());
//        existingGrammar.setRule(grammarDTO.getRule());
//        existingGrammar.setExamples(grammarDTO.getExamples());
//        existingGrammar.setLanguageId(grammarDTO.getLanguageId());
//        existingGrammar.setVerified(grammarDTO.isVerified());
//        existingGrammar.setCreatedAt(grammarDTO.getCreatedAt());
//        existingGrammar.setLastVerifiedAt(grammarDTO.getLastVerifiedAt());
//
//        if (audio != null && !audio.isEmpty()) {
//            existingGrammar.setAudioFileId(storeAudioFile(audio));
//        }
//
//        grammarRepository.save(existingGrammar);
//        LOGGER.debug("Grammar updated successfully with audio: {}", existingGrammar);
//        return existingGrammar;
//    }
//
//    @Override
//    public void deleteGrammar(String grammarId) {
//        LOGGER.debug("Deleting grammar with ID: {}", grammarId);
//        grammarRepository.deleteById(grammarId);
//        LOGGER.debug("Grammar deleted successfully with ID: {}", grammarId);
//    }
//
//    @Override
//    public void addGrammarExample(String grammarId, GrammarExampleDTO grammarExampleDTO) {
//        LOGGER.debug("Adding grammar example to grammar ID: {}", grammarId);
//        Optional<GrammarDTO> grammar = grammarRepository.findById(grammarId);
//        grammar.ifPresent(g -> {
//            g.getExamples().add(grammarExampleDTO);
//            grammarRepository.save(g);
//            LOGGER.debug("Grammar example added successfully: {}", grammarExampleDTO);
//        });
//    }
//
//    @Override
//    public List<GrammarExampleDTO> getAllGrammarExamples(String grammarId) {
//        LOGGER.debug("Fetching all grammar examples for grammar ID: {}", grammarId);
//        Optional<GrammarDTO> grammar = grammarRepository.findById(grammarId);
//        List<GrammarExampleDTO> examples = grammar.map(GrammarDTO::getExamples).orElse(Collections.emptyList());
//        LOGGER.debug("Retrieved grammar examples for grammar ID {}: {}", grammarId, examples);
//        return examples;
//    }
//
//    @Override
//    public void updateGrammarExample(String grammarId, GrammarExampleDTO grammarExampleDTO) {
//        LOGGER.debug("Updating grammar example for grammar ID: {}", grammarId);
//        Optional<GrammarDTO> grammar = grammarRepository.findById(grammarId);
//        grammar.ifPresent(g -> {
//            g.getExamples().removeIf(example -> example.getId().equals(grammarExampleDTO.getId()));
//            g.getExamples().add(grammarExampleDTO);
//            grammarRepository.save(g);
//            LOGGER.debug("Grammar example updated successfully: {}", grammarExampleDTO);
//        });
//    }
//
//    @Override
//    public void deleteGrammarExample(String grammarId, String exampleId) {
//        LOGGER.debug("Deleting grammar example with ID: {} for grammar ID: {}", exampleId, grammarId);
//        Optional<GrammarDTO> grammar = grammarRepository.findById(grammarId);
//        grammar.ifPresent(g -> {
//            g.getExamples().removeIf(example -> example.getId().equals(exampleId));
//            grammarRepository.save(g);
//            LOGGER.debug("Grammar example deleted successfully with ID: {}", exampleId);
//        });
//    }
//
//    private LanguageDTO getLanguage(String associatedLanguageId) {
//        LOGGER.debug("Fetching language by ID: {}", associatedLanguageId);
//        return languageRepository.findById(associatedLanguageId)
//                .orElseThrow(() -> new LanguageNotFoundException("Language not found: " + associatedLanguageId));
//    }
//
//    @Override
//    public GrammarDTO addGrammarWithAudio(GrammarDTO grammar, MultipartFile audio) throws IOException {
//        LOGGER.debug("Adding new grammar with audio: {}", grammar);
//        LanguageDTO language = getLanguage(grammar.getLanguageId());
//        if (audio != null && !audio.isEmpty()) {
//            grammar.setAudioFileId(storeAudioFile(audio));
//        }
//        grammarRepository.save(grammar);
//        LOGGER.debug("Grammar added successfully: {}", grammar);
//        return grammar;
//    }
//
//    private String storeAudioFile(MultipartFile audioFile) {
//        LOGGER.debug("Storing audio file");
//        try {
//            return fileStorageUtil.storeFile(audioFile);
//        } catch (IOException e) {
//            LOGGER.error("Failed to store audio file: {}", e.getMessage());
//            return null;
//        }
//    }
//}
