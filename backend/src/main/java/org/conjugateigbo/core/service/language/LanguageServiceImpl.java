//package org.conjugateigbo.core.service.language;
//
//import org.conjugateigbo.core.exception.DuplicateLanguageException;
//import org.conjugateigbo.core.exception.LanguageNotFoundException;
//import org.conjugateigbo.core.model.language.LanguageDTO;
//import org.conjugateigbo.core.repository.language.LanguageRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class LanguageServiceImpl implements LanguageService {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(LanguageServiceImpl.class);
//
//    @Autowired
//    private LanguageRepository languageRepository;
//
//    @Override
//    public void addLanguage(LanguageDTO language, String parentLanguage) {
//        LOGGER.debug("Adding language: {} with parent language: {}", language, parentLanguage);
//        LanguageDTO languageToBeAdded = uppercaseLanguageDTO(language);
//
//        validateLanguageName(languageToBeAdded);
//
//        if (languageToBeAdded.isDialect()) {
//            handleDialectLanguage(languageToBeAdded, parentLanguage);
//        }
//
//        checkForDuplicateLanguage(languageToBeAdded);
//
//        saveLanguage(languageToBeAdded);
//        LOGGER.debug("Language added successfully: {}", languageToBeAdded);
//    }
//
//    private void validateLanguageName(LanguageDTO language) {
//        LOGGER.debug("Validating language name: {}", language.getLanguageName());
//        if (language.getLanguageName() == null || language.getLanguageName().isEmpty()) {
//            LOGGER.error("Language name is null or empty, cannot save.");
//            throw new IllegalArgumentException("Language name is null or empty, cannot save.");
//        }
//    }
//
//    private void handleDialectLanguage(LanguageDTO dialectLanguage, String parentLanguage) {
//        LOGGER.debug("Handling dialect language: {} with parent language: {}", dialectLanguage, parentLanguage);
//
//        if (dialectLanguage == null) {
//            LOGGER.error("Dialect language is null");
//            throw new IllegalArgumentException("Dialect language cannot be null");
//        }
//
//        if (parentLanguage == null || parentLanguage.isEmpty()) {
//            LOGGER.error("Parent language name is null or empty for dialect, cannot save.");
//            throw new IllegalArgumentException("Parent language name is null or empty for dialect, cannot save.");
//        }
//
//        String upperCaseParentLanguage = parentLanguage.toUpperCase();
//
//        try {
//            LanguageDTO parentLanguageDTO = languageRepository.findByLanguageNameAndIsDialect(upperCaseParentLanguage, false)
//                    .orElseGet(() -> createAndSaveParentLanguage(dialectLanguage));
//
//            if (isSameLanguage(parentLanguageDTO, dialectLanguage)) {
//                LOGGER.error("A language cannot be a dialect of itself.");
//                throw new DuplicateLanguageException("A language cannot be a dialect of itself.");
//            }
//
//            dialectLanguage.setParentLanguageId(parentLanguageDTO.getId());
//            dialectLanguage.setParentLanguageName(parentLanguageDTO.getLanguageName());
//            LOGGER.debug("Dialect language handled successfully: {}", dialectLanguage);
//
//        } catch (Exception e) {
//            LOGGER.error("Error while handling dialect language: {}", e.getMessage(), e);
//            throw new RuntimeException("Failed to handle dialect language", e);
//        }
//    }
//
//    private boolean isSameLanguage(LanguageDTO lang1, LanguageDTO lang2) {
//        return lang1.getLanguageName().equals(lang2.getLanguageName()) &&
//                lang1.getCountry().equals(lang2.getCountry()) &&
//                lang1.getContinent().equals(lang2.getContinent());
//    }
//
//    private LanguageDTO createAndSaveParentLanguage(LanguageDTO language) {
//        LOGGER.debug("Creating and saving parent language for: {}", language);
//        LanguageDTO newParentLanguage = new LanguageDTO(
//                "parent-" + language.getLanguageName(),
//                "parent-" + language.getCountry(),
//                "parent-" + language.getContinent(),
//                false
//        );
//        languageRepository.insert(newParentLanguage);
//        LOGGER.info("Created and saved new parent language: {}", newParentLanguage);
//        return newParentLanguage;
//    }
//
//    private void checkForDuplicateLanguage(LanguageDTO language) {
//        LOGGER.debug("Checking for duplicate language: {}", language);
//        languageRepository.findByLanguageNameAndCountryAndContinent(
//                language.getLanguageName(),
//                language.getCountry(),
//                language.getContinent()
//        ).ifPresent(existingLanguage -> {
//            LOGGER.error("Language already exists: {}", existingLanguage);
//            throw new DuplicateLanguageException(String.format(
//                    "Language already exists for name: %s, country: %s, continent: %s",
//                    language.getLanguageName(),
//                    language.getCountry(),
//                    language.getContinent()
//            ));
//        });
//    }
//
//    private void saveLanguage(LanguageDTO language) {
//        LOGGER.debug("Saving language: {}", language);
//        languageRepository.insert(language);
//        LOGGER.info("Successfully saved language: {}", language);
//    }
//
//    @Override
//    public List<LanguageDTO> getAllLanguages() {
//        LOGGER.debug("Fetching all languages");
//        List<LanguageDTO> languages = languageRepository.findAll();
//        LOGGER.debug("Retrieved all languages: {}", languages);
//        return languages;
//    }
//
//    @Override
//    public LanguageDTO getLanguage(String languageId) {
//        LOGGER.debug("Fetching language by ID: {}", languageId);
//        LanguageDTO retrievedLanguage = languageRepository.findById(languageId).orElseThrow(() -> {
//            LOGGER.error("Language not found for ID: {}", languageId);
//            return new LanguageNotFoundException("Language not found for ID: " + languageId);
//        });
//        LOGGER.debug("Retrieved language: {}", retrievedLanguage);
//        return retrievedLanguage;
//    }
//
//    @Override
//    public void updateLanguage(LanguageDTO language) {
//        LOGGER.debug("Updating language: {}", language);
//        Optional<LanguageDTO> optionalLanguageDTO = languageRepository.findById(language.getId());
//        if (optionalLanguageDTO.isPresent()) {
//            LanguageDTO existingLanguage = optionalLanguageDTO.get();
//            existingLanguage.setLanguageName(language.getLanguageName());
//            existingLanguage.setCountry(language.getCountry());
//            existingLanguage.setContinent(language.getContinent());
//            existingLanguage.setDialect(language.isDialect());
//            languageRepository.save(existingLanguage);
//            LOGGER.debug("Language updated successfully: {}", existingLanguage);
//        } else {
//            LOGGER.error("Language not found for ID: {}", language.getId());
//            throw new LanguageNotFoundException("Language not found for ID: " + language.getId());
//        }
//    }
//
//    @Override
//    public void deleteLanguage(String languageId) {
//        LOGGER.debug("Deleting language with ID: {}", languageId);
//        languageRepository.deleteById(languageId);
//        LOGGER.debug("Language deleted successfully with ID: {}", languageId);
//    }
//
//    @Override
//    public void updateLanguageVisibility(String languageId, boolean isVisible) {
//        LOGGER.debug("Updating visibility for language ID: {}", languageId);
//        Optional<LanguageDTO> retrievedLanguageDetailsOptional = languageRepository.findById(languageId);
//        if (retrievedLanguageDetailsOptional.isPresent()) {
//            LanguageDTO retrievedLanguageDetails = retrievedLanguageDetailsOptional.get();
//            retrievedLanguageDetails.setVisible(isVisible);
//            languageRepository.save(retrievedLanguageDetails);
//            LOGGER.debug("Language visibility updated successfully: {}", retrievedLanguageDetails);
//        }
//    }
//
//    private LanguageDTO uppercaseLanguageDTO(LanguageDTO language) {
//        LOGGER.debug("Converting language fields to uppercase: {}", language);
//        return new LanguageDTO(
//                language.getLanguageName().toUpperCase().trim(),
//                language.getCountry().toUpperCase().trim(),
//                language.getContinent().toUpperCase().trim(),
//                language.isDialect()
//        );
//    }
//}