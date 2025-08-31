//package org.conjugateigbo.core.service.sentence;
//
//import org.apache.commons.codec.binary.Base64;
//import org.conjugateigbo.core.exception.LanguageNotFoundException;
//import org.conjugateigbo.core.exception.SentenceNotFoundException;
//import org.conjugateigbo.core.model.language.LanguageDTO;
//import org.conjugateigbo.core.model.sentence.SentenceDTO;
//import org.conjugateigbo.core.repository.language.LanguageRepository;
//import org.conjugateigbo.core.repository.sentence.SentenceRepository;
//import org.conjugateigbo.core.util.FileStorageUtil;
//import org.conjugateigbo.core.util.WordUtil;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class SentenceServiceImpl implements SentenceService {
//    private static final Logger LOGGER = LoggerFactory.getLogger(SentenceServiceImpl.class);
//
//    @Autowired
//    private SentenceRepository sentenceRepository;
//
//    @Autowired
//    private LanguageRepository languageRepository;
//
//    @Autowired
//    private FileStorageUtil fileStorageUtil;
//
//    @Autowired
//    private WordUtil wordUtil;
//
//    @Override
//    public void addSentence(SentenceDTO sentence, MultipartFile audioFile, MultipartFile imageFile) {
//        LOGGER.debug("Adding new sentence: {}", sentence);
//        if (audioFile != null && !audioFile.isEmpty()) {
//            sentence.setAudioFileId(storeAudioFile(audioFile));
//        }
//        if (imageFile != null && !imageFile.isEmpty()) {
//            sentence.setImageFileId(storeImageFile(imageFile));
//        }
//        sentenceRepository.save(sentence);
//        LOGGER.debug("Sentence added successfully: {}", sentence.getId());
//    }
//
//    @Override
//    public SentenceDTO getSentence(String sentenceId) throws IOException {
//        LOGGER.debug("Fetching sentence: {}", sentenceId);
//        Optional<SentenceDTO> sentenceOpt = sentenceRepository.findById(sentenceId);
//        if (sentenceOpt.isEmpty()) {
//            LOGGER.error("Sentence not found: {}", sentenceId);
//            throw new SentenceNotFoundException("Sentence not found.");
//        }
//        SentenceDTO foundSentence = sentenceOpt.get();
//        if (foundSentence.getAudioFileId() != null) {
//            try (InputStream audioStream = fileStorageUtil.getFileStream(foundSentence.getAudioFileId())) {
//                byte[] audioBytes = audioStream.readAllBytes();
//                foundSentence.setAudioBase64("data:audio/mpeg;base64," + Base64.encodeBase64String(audioBytes));
//            }
//        }
//        if (foundSentence.getImageFileId() != null) {
//            try (InputStream imageStream = fileStorageUtil.getFileStream(foundSentence.getImageFileId())) {
//                byte[] imageBytes = imageStream.readAllBytes();
//                foundSentence.setImageBase64("data:image/jpeg;base64," + Base64.encodeBase64String(imageBytes));
//            }
//        }
//        LOGGER.debug("Retrieved sentence: {}", foundSentence);
//        return foundSentence;
//    }
//
//    @Override
//    public List<SentenceDTO> getAllSentencesForLanguage(String languageID) {
//        LOGGER.debug("Fetching all sentences for language ID: {}", languageID);
//        LanguageDTO language = getLanguage(languageID);
//        List<SentenceDTO> sentences = sentenceRepository.findAll().stream()
//                .filter(s -> s.getLanguageId().equals(language.getId()))
//                .collect(Collectors.toList());
//        LOGGER.debug("Retrieved sentences for language ID {}: {}", languageID, sentences);
//        return sentences;
//    }
//
//    @Override
//    public void updateSentence(SentenceDTO sentence, MultipartFile audioFile, MultipartFile imageFile) throws IOException {
//        LOGGER.debug("Updating sentence: {}", sentence);
//        SentenceDTO sentenceToUpdate = getSentence(sentence.getId());
//        sentenceToUpdate.setSentence(sentence.getSentence());
//        sentenceToUpdate.setNativeScript(sentence.getNativeScript());
//        sentenceToUpdate.setTranslation(sentence.getTranslation());
//        if (sentence.getExample() != null) {
//            sentenceToUpdate.setExample(sentence.getExample());
//        }
//        if (sentence.getPronunciationTip() != null) {
//            sentenceToUpdate.setPronunciationTip(sentence.getPronunciationTip());
//        }
//        // Only check verification time restriction if the sentence is being verified and was already verified before
//        // This ensures that sentences that have never been verified before can be verified without the 4-week restriction
//        if (sentence.isVerified() && sentenceToUpdate.isVerified() && !wordUtil.canVerifyWord(sentenceToUpdate.getLastVerifiedAt())) {
//            LOGGER.error("Sentence cannot be verified again within 4 weeks.");
//            throw new IllegalArgumentException("Sentence cannot be verified again within 4 weeks.");
//        }
//
//        // If the sentence is being verified, update the lastVerifiedAt timestamp
//        if (sentence.isVerified()) {
//            sentenceToUpdate.setVerified(true);
//            sentenceToUpdate.setLastVerifiedAt(java.time.LocalDateTime.now());
//        }
//        if (audioFile != null && !audioFile.isEmpty()) {
//            sentenceToUpdate.setAudioFileId(storeAudioFile(audioFile));
//        }
//        if (imageFile != null && !imageFile.isEmpty()) {
//            sentenceToUpdate.setImageFileId(storeImageFile(imageFile));
//        }
//        sentenceRepository.save(sentenceToUpdate);
//        LOGGER.debug("Sentence updated successfully: {}", sentenceToUpdate);
//    }
//
//    @Override
//    public void deleteSentence(String sentenceId) throws IOException {
//        LOGGER.debug("Deleting sentence: {}", sentenceId);
//        sentenceRepository.deleteById(sentenceId);
//        LOGGER.debug("Sentence deleted successfully: {}", sentenceId);
//    }
//
//    private LanguageDTO getLanguage(String associatedLanguageId) {
//        LOGGER.debug("Fetching language by ID: {}", associatedLanguageId);
//        return languageRepository.findById(associatedLanguageId)
//                .orElseThrow(() -> new LanguageNotFoundException("Language not found: " + associatedLanguageId));
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
//
//    private String storeImageFile(MultipartFile imageFile) {
//        LOGGER.debug("Storing image file");
//        try {
//            return fileStorageUtil.storeFile(imageFile);
//        } catch (IOException e) {
//            LOGGER.error("Failed to store image file: {}", e.getMessage());
//            return null;
//        }
//    }
//}
