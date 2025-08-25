//package org.languagecurationplatform.lcpcore.controller.sentence;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.languagecurationplatform.lcpcore.model.enums.SentenceTypeEnum;
//import org.languagecurationplatform.lcpcore.model.sentence.SentenceDTO;
//import org.languagecurationplatform.lcpcore.service.sentence.SentenceServiceImpl;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//
//import java.io.IOException;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertFalse;
//import static org.mockito.Mockito.*;
//
//public class SentenceControllerTest {
//
//    @Mock
//    private SentenceServiceImpl sentenceServiceImpl;
//
//    @InjectMocks
//    private SentenceController sentenceController;
//
//    private SentenceDTO mockSentence;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.openMocks(this);
//
//        mockSentence = new SentenceDTO(
//                "test sentence",
//                "Testing the native script (optional) field",
//                "Testing the translation field",
//                SentenceTypeEnum.SENTENCE,
//                "A sample sentence for testing",
//                null, // Example (optional)
//                null, // Pronunciation Tip (optional)
//                "lang123",
//                null,
//                null,
//                null, // No audio
//                null // No image
//        );
//    }
//
//    @Test
//    void testAddSentence_Success() {
//        when(sentenceServiceImpl.addSentence(anyString(), anyString(), anyString(), anyString(), anyString(), any(),
//                any(), anyString(), anyString(), anyString(), any(), any()))
//                .thenReturn(mockSentence);
//
//        ResponseEntity<?> response = sentenceController.addSentence(
//                "test sentence", "Testing the native script (optional) field", "Testing the translation field", "SENTENCE",
//                "A sample sentence for testing", "", "", "English",
//                "USA", "North America", null, null);
//
//        assertEquals(HttpStatus.CREATED, response.getStatusCode());
//        assertEquals("test sentence", ((SentenceDTO) response.getBody()).getSentence());
//        verify(sentenceServiceImpl, times(1)).addSentence(anyString(), anyString(), anyString(), anyString(), anyString(), anyString(),
//                anyString(), anyString(), anyString(), anyString(), any(), any());
//    }
//
//    @Test
//    void testAddSentence_Failure_BadRequest() {
//        when(sentenceServiceImpl.addSentence(anyString(), any(), anyString(), anyString(), anyString(), anyString(),
//                any(), any(), anyString(), anyString(), any(), any()))
//                .thenThrow(new IllegalArgumentException("Invalid data"));
//
//        ResponseEntity<?> response = sentenceController.addSentence(
//                "test sentence", "", "A sample sentence", "SENTENCE",
//                "English is a dumb language", "", "", "English",
//                "USA", "North America", null, null);
//        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
//        assertEquals("Invalid data", response.getBody());
//    }
//
//    @Test
//    void testGetSentence_Success() throws IOException {
//        when(sentenceServiceImpl.getSentence(anyString(), anyString(), anyString(), anyString(), anyString()))
//                .thenReturn(mockSentence);
//
//        ResponseEntity<?> response = sentenceController.getSentence(
//                "test sentence", "SENTENCE", "English", "USA", "North America");
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals("test sentence", ((SentenceDTO) response.getBody()).getSentence());
//        verify(sentenceServiceImpl, times(1)).getSentence(anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void testGetSentence_NotFound() throws IOException {
//        when(sentenceServiceImpl.getSentence(anyString(), anyString(), anyString(), anyString(), anyString()))
//                .thenThrow(new IllegalArgumentException("Sentence not found"));
//
//        ResponseEntity<?> response = sentenceController.getSentence(
//                "test sentence", "SENTENCE", "English", "USA", "North America");
//
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        assertEquals("Sentence not found", response.getBody());
//    }
//
//    @Test
//    void testGetAllSentencesForLanguage_Success() {
//        when(sentenceServiceImpl.getAllSentencesForLanguage(anyString(), anyString(), anyString()))
//                .thenReturn(List.of(mockSentence));
//
//        ResponseEntity<?> response = sentenceController.getAllSentencesForLanguage(
//                "English", "USA", "North America");
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertFalse(((List<?>) response.getBody()).isEmpty());
//        verify(sentenceServiceImpl, times(1)).getAllSentencesForLanguage(anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void testUpdateSentence_Success() throws IOException {
//        doNothing().when(sentenceServiceImpl).updateSentence(anyString(), anyString(), anyString(), anyString(), anyString(),
//                anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyBoolean(), any(), any());
//
//        ResponseEntity<?> response = sentenceController.updateSentence(
//                "testing change of existing sentence", "", "test translation",
//                "SENTENCE", "just testing bruv", "", "English is a dumb lang",
//                "English", "USA", "North America", "updated_test", false,
//                null, null);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals("Sentence updated successfully.", response.getBody());
//        verify(sentenceServiceImpl, times(1)).updateSentence(anyString(), anyString(), anyString(),
//                anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(),
//                anyBoolean(), any(), any());
//    }
//
//    @Test
//    void testUpdateSentence_Fail_Conflict() throws IOException {
//        doThrow(new IllegalArgumentException("Sentence cannot be verified again within 4 weeks"))
//                .when(sentenceServiceImpl).updateSentence(anyString(), anyString(), anyString(),
//                        anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString(),
//                        anyBoolean(), any(), any());
//
//        ResponseEntity<?> response = sentenceController.updateSentence(
//                "testing change of existing sentence", "", "test translation",
//                "SENTENCE", "just testing bruv", "", "English is a dumb lang",
//                "English", "USA", "North America", "updated_test", true, null, null);
//
//        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
//        assertEquals("Sentence cannot be verified again within 4 weeks", response.getBody());
//    }
//
//    @Test
//    void testDeleteSentence_Success() throws IOException {
//        doNothing().when(sentenceServiceImpl).deleteSentence(anyString(), anyString(), anyString(), anyString(), anyString());
//
//        ResponseEntity<?> response = sentenceController.deleteSentence(
//                "test sentence", "SENTENCE", "English", "USA", "North America");
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals("Sentence deleted successfully.", response.getBody());
//        verify(sentenceServiceImpl, times(1)).deleteSentence(anyString(), anyString(), anyString(), anyString(), anyString());
//    }
//
//    @Test
//    void testDeleteSentence_NotFound() throws IOException {
//        doThrow(new IllegalArgumentException("Sentence not found")).when(sentenceServiceImpl)
//                .deleteSentence(anyString(), anyString(), anyString(), anyString(), anyString());
//
//        ResponseEntity<?> response = sentenceController.deleteSentence(
//                "test sentence", "SENTENCE", "English", "USA", "North America");
//
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//        assertEquals("Sentence not found", response.getBody());
//    }
//}
