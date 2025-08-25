//package org.languagecurationplatform.lcpcore.controller.language;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.languagecurationplatform.lcpcore.exception.DuplicateLanguageException;
//import org.languagecurationplatform.lcpcore.exception.LanguageNotFoundException;
//import org.languagecurationplatform.lcpcore.model.language.LanguageDTO;
//import org.languagecurationplatform.lcpcore.service.language.LanguageService;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.ResponseEntity;
//
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//import static org.springframework.http.HttpStatus.*;
//
//@ExtendWith(MockitoExtension.class)
//class LanguageControllerTest {
//
//    @Mock
//    private LanguageService languageService;
//
//    @InjectMocks
//    private LanguageController languageController;
//
//    private LanguageDTO englishUK;
//    private LanguageDTO englishUSA;
//
//    @BeforeEach
//    void setUp() {
//        englishUK = new LanguageDTO("English", "UK", "Europe", false);
//        englishUSA = new LanguageDTO("English", "USA", "North America", false);
//    }
//
//    @Test
//    void testGetAllLanguages_Success() {
//        when(languageService.getAllLanguages()).thenReturn(List.of(englishUK, englishUSA));
//
//        ResponseEntity<List<LanguageDTO>> response = languageController.getAllLanguages();
//
//        assertNotNull(response);
//        assertEquals(OK, response.getStatusCode());
//        assertEquals(2, response.getBody().size());
//
//        verify(languageService, times(1)).getAllLanguages();
//    }
//
//    @Test
//    void testGetAllLanguages_InternalServerError() {
//        when(languageService.getAllLanguages()).thenThrow(new RuntimeException("DB Error"));
//
//        ResponseEntity<List<LanguageDTO>> response = languageController.getAllLanguages();
//
//        assertEquals(INTERNAL_SERVER_ERROR, response.getStatusCode());
//        assertNull(response.getBody());
//
//        verify(languageService, times(1)).getAllLanguages();
//    }
//
//    @Test
//    void testAddDialectLanguage_Success() {
//        LanguageDTO englishCanada = new LanguageDTO("English", "Canada", "North America", true);
//        doNothing().when(languageService).addLanguageByName(englishCanada, "English");
//
//        ResponseEntity<String> response = languageController.addLanguage(englishCanada);
//
//        assertEquals(OK, response.getStatusCode());
//        assertEquals("Language saved successfully", response.getBody());
//
//        verify(languageService, times(1)).addLanguageByName(englishCanada, "English");
//    }
//
//    @Test
//    void testAddDuplicateLanguage_Error() {
//        doThrow(new DuplicateLanguageException("Duplicate language")).when(languageService).addLanguageByName(englishUK, null);
//
//        ResponseEntity<String> response = languageController.addLanguage(englishUK);
//
//        assertEquals(CONFLICT, response.getStatusCode());
//
//        verify(languageService, times(1)).addLanguageByName(englishUK, null);
//    }
//
//    @Test
//    void testGetLanguageByName_Success() {
//        when(languageService.getLanguageByName("English")).thenReturn(englishUK);
//
//        ResponseEntity<LanguageDTO> response = languageController.getLanguage("English");
//
//        assertNotNull(response);
//        assertEquals(OK, response.getStatusCode());
//        assertEquals("English", response.getBody().getLanguageName());
//
//        verify(languageService, times(1)).getLanguageByName("English");
//    }
//
//    @Test
//    void testGetLanguageByName_NotFound() {
//        when(languageService.getLanguageByName("Unknown")).thenThrow(new LanguageNotFoundException("Not found"));
//
//        ResponseEntity<LanguageDTO> response = languageController.getLanguage("Unknown");
//
//        assertEquals(NOT_FOUND, response.getStatusCode());
//        assertNull(response.getBody());
//
//        verify(languageService, times(1)).getLanguageByName("Unknown");
//    }
//
//    @Test
//    void testAddLanguage_Success() {
//        doNothing().when(languageService).addLanguageByName(englishUK, null);
//
//        ResponseEntity<String> response = languageController.addLanguage(englishUK);
//
//        assertEquals(OK, response.getStatusCode());
//        assertEquals("Language saved successfully", response.getBody());
//
//        verify(languageService, times(1)).addLanguageByName(englishUK, null);
//    }
//
/// /    @Test
/// /    void testUpdateLanguage_Success() {
/// /        doNothing().when(languageService).updateLanguageByName(any(LanguageDTO.class), eq(englishUSA));
/// /
/// /        ResponseEntity<String> response = languageController.updateLanguage("English", "UK", "Europe", false, englishUSA);
/// /
/// /        assertEquals(OK, response.getStatusCode());
/// /        assertEquals("Language updated successfully", response.getBody());
/// /
/// /        verify(languageService, times(1)).updateLanguageByName(any(LanguageDTO.class), eq(englishUSA));
/// /    }
/// /
/// /    @Test
/// /    void testUpdateLanguage_NotFound() {
/// /        doThrow(new LanguageNotFoundException("Not found")).when(languageService).updateLanguageByName(any(LanguageDTO.class), eq(englishUSA));
/// /
/// /
/// /        ResponseEntity<String> response = languageController.updateLanguage("English", "UK", "Europe", false, englishUSA);
/// /
/// /        assertEquals(NOT_FOUND, response.getStatusCode());
/// /
/// /        verify(languageService, times(1)).updateLanguageByName(any(LanguageDTO.class), eq(englishUSA));
/// /    }
//
////    @Test
////    void testDeleteLanguage_Success() {
////        doNothing().when(languageService).deleteLanguageByName(any(LanguageDTO.class));
////
////        ResponseEntity<String> response = languageController.deleteLanguage("English", "UK", "Europe", false);
////
////        assertEquals(OK, response.getStatusCode());
////        assertEquals("Language deleted successfully", response.getBody());
////
////        verify(languageService, times(1)).deleteLanguageByName(any(LanguageDTO.class));
////    }
////
////    @Test
////    void testDeleteLanguage_NotFound() {
////        doThrow(new LanguageNotFoundException("Not found")).when(languageService).deleteLanguageByName(any(LanguageDTO.class));
////
////        ResponseEntity<String> response = languageController.deleteLanguage("English", "UK", "Europe", false);
////
////        assertEquals(NOT_FOUND, response.getStatusCode());
////
////        verify(languageService, times(1)).deleteLanguageByName(any(LanguageDTO.class));
////    }
//}