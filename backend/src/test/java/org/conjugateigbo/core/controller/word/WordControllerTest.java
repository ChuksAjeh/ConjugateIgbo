//package org.languagecurationplatform.lcpcore.controller.word;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.languagecurationplatform.lcpcore.exception.WordNotFoundException;
//import org.languagecurationplatform.lcpcore.model.enums.WordTypeEnum;
//import org.languagecurationplatform.lcpcore.model.word.WordDTO;
//import org.languagecurationplatform.lcpcore.service.word.WordService;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//
//class WordControllerTest {
//
//    @Mock
//    private WordService wordService;
//
//    @Mock
//    private ObjectMapper objectMapper;
//
//    @InjectMocks
//    private WordController wordController;
//
//    private WordDTO mockWord;
//    private String wordJson;
//    private MockMultipartFile mockImageFile;
//    private MockMultipartFile mockAudioFile;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        // Create a mock word
//        mockWord = new WordDTO();
//        mockWord.setId("word123");
//        mockWord.setWord("test");
//        mockWord.setTranslation("test_translation");
//        mockWord.setPartOfSpeech(WordTypeEnum.NOUN);
//        mockWord.setDefinition("A sample word for testing");
//        mockWord.setLanguageId("lang123");
//        mockWord.setCreatedAt(LocalDateTime.now());
//
//        // Create mock files
//        mockImageFile = new MockMultipartFile(
//                "image",
//                "test-image.png",
//                MediaType.IMAGE_PNG_VALUE,
//                "test image content".getBytes()
//        );
//
//        mockAudioFile = new MockMultipartFile(
//                "audio",
//                "test-audio.mp3",
//                "audio/mpeg",
//                "test audio content".getBytes()
//        );
//
//        // Create word JSON
//        wordJson = "{\"id\":\"word123\",\"word\":\"test\",\"translation\":\"test_translation\",\"partOfSpeech\":\"NOUN\",\"definition\":\"A sample word for testing\",\"languageId\":\"lang123\"}";
//    }
//
//    @Test
//    void testAddWord_Success() throws Exception {
//        // Mock the objectMapper to return our mockWord when parsing the JSON
//        when(objectMapper.readValue(anyString(), eq(WordDTO.class))).thenReturn(mockWord);
//
//        // Mock the wordService to return our mockWord when adding a word
//        when(wordService.addWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class)))
//                .thenReturn(mockWord);
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.addWord(wordJson, mockImageFile, mockAudioFile);
//
//        // Verify the response
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(mockWord, response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).addWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//    }
//
//    @Test
//    void testAddWord_Failure() throws Exception {
//        // Mock the objectMapper to return our mockWord when parsing the JSON
//        when(objectMapper.readValue(anyString(), eq(WordDTO.class))).thenReturn(mockWord);
//
//        // Mock the wordService to throw an exception when adding a word
//        when(wordService.addWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class)))
//                .thenThrow(new RuntimeException("Failed to add word"));
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.addWord(wordJson, mockImageFile, mockAudioFile);
//
//        // Verify the response
//        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
//        assertTrue(response.getBody().toString().contains("Failed to add word"));
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).addWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//    }
//
//    @Test
//    void testGetWord_Success() throws IOException {
//        // Mock the wordService to return our mockWord when getting a word
//        when(wordService.getWord(anyString())).thenReturn(mockWord);
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.getWord("word123");
//
//        // Verify the response
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(mockWord, response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).getWord("word123");
//    }
//
//    @Test
//    void testGetWord_NotFound() throws IOException {
//        // Mock the wordService to throw a WordNotFoundException when getting a non-existent word
//        when(wordService.getWord(anyString())).thenThrow(new WordNotFoundException("Word not found"));
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.getWord("nonexistent");
//
//        // Verify the response
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        assertEquals("Word not found", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).getWord("nonexistent");
//    }
//
//    @Test
//    void testGetAllWordsForLanguage_Success() throws IOException {
//        // Create a list of mock words
//        List<WordDTO> mockWords = Arrays.asList(mockWord);
//
//        // Mock the wordService to return our list of mock words when getting all words for a language
//        when(wordService.getAllWordsForLanguage(anyString())).thenReturn(mockWords);
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.getAllWordsForLanguage("lang123");
//
//        // Verify the response
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(mockWords, response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).getAllWordsForLanguage("lang123");
//    }
//
//    @Test
//    void testGetAllWordsForLanguage_LanguageNotFound() throws IOException {
//        // Mock the wordService to throw an IllegalArgumentException when getting words for a non-existent language
//        when(wordService.getAllWordsForLanguage(anyString())).thenThrow(new IllegalArgumentException("Language not found"));
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.getAllWordsForLanguage("nonexistent");
//
//        // Verify the response
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        assertEquals("Language not found", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).getAllWordsForLanguage("nonexistent");
//    }
//
//    @Test
//    void testUpdateWord_Success() throws Exception {
//        // Mock the objectMapper to return our mockWord when parsing the JSON
//        when(objectMapper.readValue(anyString(), eq(WordDTO.class))).thenReturn(mockWord);
//
//        // Mock the wordService to not throw any exceptions when updating a word
//        doNothing().when(wordService).updateWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.updateWord(wordJson, mockImageFile, mockAudioFile);
//
//        // Verify the response
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals("Word updated successfully.", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).updateWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//    }
//
//    @Test
//    void testUpdateWord_Conflict() throws Exception {
//        // Mock the objectMapper to return our mockWord when parsing the JSON
//        when(objectMapper.readValue(anyString(), eq(WordDTO.class))).thenReturn(mockWord);
//
//        // Mock the wordService to throw an IllegalArgumentException with a specific message when updating a word
//        doThrow(new IllegalArgumentException("Word cannot be verified again within 4 weeks"))
//                .when(wordService).updateWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.updateWord(wordJson, mockImageFile, mockAudioFile);
//
//        // Verify the response
//        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
//        assertEquals("Word cannot be verified again within 4 weeks", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).updateWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//    }
//
//    @Test
//    void testUpdateWord_BadRequest() throws Exception {
//        // Mock the objectMapper to return our mockWord when parsing the JSON
//        when(objectMapper.readValue(anyString(), eq(WordDTO.class))).thenReturn(mockWord);
//
//        // Mock the wordService to throw an IllegalArgumentException with a different message when updating a word
//        doThrow(new IllegalArgumentException("Invalid word data"))
//                .when(wordService).updateWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.updateWord(wordJson, mockImageFile, mockAudioFile);
//
//        // Verify the response
//        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//        assertEquals("Invalid word data", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).updateWord(any(WordDTO.class), any(MultipartFile.class), any(MultipartFile.class));
//    }
//
//    @Test
//    void testDeleteWord_Success() throws IOException {
//        // Mock the wordService to not throw any exceptions when deleting a word
//        doNothing().when(wordService).deleteWord(anyString());
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.deleteWord("word123");
//
//        // Verify the response
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals("Word deleted successfully.", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).deleteWord("word123");
//    }
//
//    @Test
//    void testDeleteWord_NotFound() throws IOException {
//        // Mock the wordService to throw an IllegalArgumentException when deleting a non-existent word
//        doThrow(new IllegalArgumentException("Word not found")).when(wordService).deleteWord(anyString());
//
//        // Call the controller method
//        ResponseEntity<?> response = wordController.deleteWord("nonexistent");
//
//        // Verify the response
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        assertEquals("Word not found", response.getBody());
//
//        // Verify that the service method was called with the correct parameters
//        verify(wordService, times(1)).deleteWord("nonexistent");
//    }
//}
