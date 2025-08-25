//package org.languagecurationplatform.lcpcore.service.word;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.languagecurationplatform.lcpcore.exception.LanguageNotFoundException;
//import org.languagecurationplatform.lcpcore.exception.WordNotFoundException;
//import org.languagecurationplatform.lcpcore.model.enums.WordTypeEnum;
//import org.languagecurationplatform.lcpcore.model.language.LanguageDTO;
//import org.languagecurationplatform.lcpcore.model.word.WordDTO;
//import org.languagecurationplatform.lcpcore.repository.language.LanguageRepository;
//import org.languagecurationplatform.lcpcore.repository.word.WordRepository;
//import org.languagecurationplatform.lcpcore.util.FileStorageUtil;
//import org.languagecurationplatform.lcpcore.util.WordUtil;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.*;
//
//class WordServiceTest {
//
//    @Mock
//    private WordRepository wordRepository;
//
//    @Mock
//    private LanguageRepository languageRepository;
//
//    @Mock
//    private FileStorageUtil fileStorageUtil;
//
//    @Mock
//    private WordUtil wordUtil;
//
//    @InjectMocks
//    private WordServiceImpl wordService;
//
//    private WordDTO mockWord;
//    private LanguageDTO mockLanguage;
//    private MockMultipartFile mockImageFile;
//    private MockMultipartFile mockAudioFile;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        // Create a mock language
//        mockLanguage = new LanguageDTO();
//        mockLanguage.setId("lang123");
//        mockLanguage.setLanguageName("English");
//        mockLanguage.setCountry("USA");
//        mockLanguage.setContinent("North America");
//
//        // Create a mock word
//        mockWord = new WordDTO();
//        mockWord.setId("word123");
//        mockWord.setWord("test");
//        mockWord.setTranslation("test_translation");
//        mockWord.setPartOfSpeech(WordTypeEnum.NOUN);
//        mockWord.setDefinition("A sample word for testing");
//        mockWord.setLanguageId(mockLanguage.getId());
//        mockWord.setCreatedAt(LocalDateTime.now());
//
//        // Create mock files
//        mockImageFile = new MockMultipartFile(
//                "image",
//                "test-image.png",
//                "image/png",
//                "test image content".getBytes()
//        );
//
//        mockAudioFile = new MockMultipartFile(
//                "audio",
//                "test-audio.mp3",
//                "audio/mpeg",
//                "test audio content".getBytes()
//        );
//    }
//
//    @Test
//    void testAddWord_Success() throws IOException {
//        // Mock the languageRepository to return our mockLanguage when finding by ID
//        when(languageRepository.findById(anyString())).thenReturn(Optional.of(mockLanguage));
//
//        // Mock the fileStorageUtil to return a file ID when storing a file
//        when(fileStorageUtil.storeFile(any(MultipartFile.class))).thenReturn("file123");
//
//        // Mock the wordRepository to return our mockWord when saving a word
//        when(wordRepository.save(any(WordDTO.class))).thenReturn(mockWord);
//
//        // Call the service method
//        WordDTO result = wordService.addWord(mockWord, mockAudioFile, mockImageFile);
//
//        // Verify the result
//        assertNotNull(result);
//        assertEquals("test", result.getWord());
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(languageRepository, times(1)).findById(mockLanguage.getId());
//        verify(fileStorageUtil, times(1)).storeFile(mockAudioFile);
//        verify(fileStorageUtil, times(1)).storeFile(mockImageFile);
//        verify(wordRepository, times(1)).save(mockWord);
//    }
//
//    @Test
//    void testAddWord_LanguageNotFound() throws IOException {
//        // Mock the languageRepository to return empty when finding by ID
//        when(languageRepository.findById(anyString())).thenReturn(Optional.empty());
//
//        // Call the service method and verify that it throws the expected exception
//        assertThrows(LanguageNotFoundException.class, () -> {
//            wordService.addWord(mockWord, mockAudioFile, mockImageFile);
//        });
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(languageRepository, times(1)).findById(mockLanguage.getId());
//        verify(fileStorageUtil, never()).storeFile(any(MultipartFile.class));
//        verify(wordRepository, never()).save(any(WordDTO.class));
//    }
//
//    @Test
//    void testGetWord_Success() throws IOException {
//        // Mock the wordRepository to return our mockWord when finding by ID
//        when(wordRepository.findById(anyString())).thenReturn(Optional.of(mockWord));
//
//        // Call the service method
//        WordDTO result = wordService.getWord("word123");
//
//        // Verify the result
//        assertNotNull(result);
//        assertEquals("test", result.getWord());
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).findById("word123");
//    }
//
//    @Test
//    void testGetWord_NotFound() {
//        // Mock the wordRepository to return empty when finding by ID
//        when(wordRepository.findById(anyString())).thenReturn(Optional.empty());
//
//        // Call the service method and verify that it throws the expected exception
//        assertThrows(WordNotFoundException.class, () -> {
//            wordService.getWord("nonexistent");
//        });
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).findById("nonexistent");
//    }
//
//    @Test
//    void testGetAllWordsForLanguage_Success() throws IOException {
//        // Mock the languageRepository to return our mockLanguage when finding by ID
//        when(languageRepository.findById(anyString())).thenReturn(Optional.of(mockLanguage));
//
//        // Create a list of mock words
//        List<WordDTO> mockWords = Arrays.asList(mockWord);
//
//        // Mock the wordRepository to return our list of mock words when finding all
//        when(wordRepository.findAll()).thenReturn(mockWords);
//
//        // Call the service method
//        List<WordDTO> result = wordService.getAllWordsForLanguage(mockLanguage.getId());
//
//        // Verify the result
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals("test", result.get(0).getWord());
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(languageRepository, times(1)).findById(mockLanguage.getId());
//        verify(wordRepository, times(1)).findAll();
//    }
//
//    @Test
//    void testGetAllWordsForLanguage_LanguageNotFound() {
//        // Mock the languageRepository to return empty when finding by ID
//        when(languageRepository.findById(anyString())).thenReturn(Optional.empty());
//
//        // Call the service method and verify that it throws the expected exception
//        assertThrows(LanguageNotFoundException.class, () -> {
//            wordService.getAllWordsForLanguage("nonexistent");
//        });
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(languageRepository, times(1)).findById("nonexistent");
//        verify(wordRepository, never()).findAll();
//    }
//
//    @Test
//    void testUpdateWord_Success() throws IOException {
//        // Mock the wordRepository to return our mockWord when finding by ID
//        when(wordRepository.findById(anyString())).thenReturn(Optional.of(mockWord));
//
//        // Mock the fileStorageUtil to return a file ID when storing a file
//        when(fileStorageUtil.storeFile(any(MultipartFile.class))).thenReturn("file123");
//
//        // Mock the wordUtil to return true when checking if a word can be verified
//        when(wordUtil.canVerifyWord(any(LocalDateTime.class))).thenReturn(true);
//
//        // Create a word to update
//        WordDTO wordToUpdate = new WordDTO();
//        wordToUpdate.setId("word123");
//        wordToUpdate.setWord("updated_test");
//        wordToUpdate.setTranslation("updated_translation");
//        wordToUpdate.setDefinition("Updated definition");
//        wordToUpdate.setExample("Updated example");
//        wordToUpdate.setPronunciationTip("Updated pronunciation tip");
//        wordToUpdate.setVerified(true);
//
//        // Call the service method
//        wordService.updateWord(wordToUpdate, mockAudioFile, mockImageFile);
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).findById("word123");
//        verify(fileStorageUtil, times(1)).storeFile(mockAudioFile);
//        verify(fileStorageUtil, times(1)).storeFile(mockImageFile);
//        verify(wordRepository, times(1)).save(any(WordDTO.class));
//
//        // Verify that the word was updated correctly
//        assertEquals("updated_test", mockWord.getWord());
//        assertEquals("updated_translation", mockWord.getTranslation());
//        assertEquals("Updated definition", mockWord.getDefinition());
//        assertEquals("Updated example", mockWord.getExample());
//        assertEquals("Updated pronunciation tip", mockWord.getPronunciationTip());
//    }
//
//    @Test
//    void testUpdateWord_WordNotFound() throws IOException {
//        // Mock the wordRepository to return empty when finding by ID
//        when(wordRepository.findById(anyString())).thenReturn(Optional.empty());
//
//        // Create a word to update
//        WordDTO wordToUpdate = new WordDTO();
//        wordToUpdate.setId("nonexistent");
//
//        // Call the service method and verify that it throws the expected exception
//        assertThrows(WordNotFoundException.class, () -> {
//            wordService.updateWord(wordToUpdate, mockAudioFile, mockImageFile);
//        });
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).findById("nonexistent");
//        verify(fileStorageUtil, never()).storeFile(any(MultipartFile.class));
//        verify(wordRepository, never()).save(any(WordDTO.class));
//    }
//
//    @Test
//    void testUpdateWord_CannotVerify() throws IOException {
//        // Mock the wordRepository to return our mockWord when finding by ID
//        when(wordRepository.findById(anyString())).thenReturn(Optional.of(mockWord));
//
//        // Mock the wordUtil to return false when checking if a word can be verified
//        when(wordUtil.canVerifyWord(any(LocalDateTime.class))).thenReturn(false);
//
//        // Create a word to update with verification
//        WordDTO wordToUpdate = new WordDTO();
//        wordToUpdate.setId("word123");
//        wordToUpdate.setVerified(true);
//
//        // Call the service method and verify that it throws the expected exception
//        assertThrows(IllegalArgumentException.class, () -> {
//            wordService.updateWord(wordToUpdate, mockAudioFile, mockImageFile);
//        });
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).findById("word123");
//        verify(wordUtil, times(1)).canVerifyWord(any(LocalDateTime.class));
//        verify(fileStorageUtil, never()).storeFile(any(MultipartFile.class));
//        verify(wordRepository, never()).save(any(WordDTO.class));
//    }
//
//    @Test
//    void testDeleteWord_Success() throws IOException {
//        // Mock the wordRepository to not throw any exceptions when deleting a word
//        doNothing().when(wordRepository).deleteById(anyString());
//
//        // Call the service method
//        wordService.deleteWord("word123");
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).deleteById("word123");
//    }
//
//    @Test
//    void testAddWordWithFiles_Success() {
//        // Mock the wordRepository to return our mockWord when saving a word
//        when(wordRepository.save(any(WordDTO.class))).thenReturn(mockWord);
//
//        // Call the service method
//        WordDTO result = wordService.addWordWithFiles(mockWord, mockImageFile, mockAudioFile);
//
//        // Verify the result
//        assertNotNull(result);
//        assertEquals("test", result.getWord());
//        assertFalse(result.isVerified()); // addWordWithFiles sets isVerified to false
//
//        // Verify that the repository methods were called with the correct parameters
//        verify(wordRepository, times(1)).save(mockWord);
//    }
//}