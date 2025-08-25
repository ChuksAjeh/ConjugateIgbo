//package org.languagecurationplatform.lcpcore.service.language;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.languagecurationplatform.lcpcore.exception.DuplicateLanguageException;
//import org.languagecurationplatform.lcpcore.exception.LanguageNotFoundException;
//import org.languagecurationplatform.lcpcore.model.language.LanguageDTO;
//import org.languagecurationplatform.lcpcore.repository.language.LanguageRepository;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class LanguageServiceTest {
//
//    @Mock
//    private LanguageRepository languageRepository;
//
//    @InjectMocks
//    private LanguageServiceImpl languageService;
//
//    private LanguageDTO testLanguage;
//    private LanguageDTO updatedLanguage;
//
//    @BeforeEach
//    void setUp() {
//        testLanguage = new LanguageDTO("English", "UK", "Europe", false);
//        testLanguage.setId("1");
//        updatedLanguage = new LanguageDTO("English", "USA", "North America", false);
//        updatedLanguage.setId("2");
//    }
//
//    @Test
//    void testGetAllLanguages() {
//        when(languageRepository.findAll()).thenReturn(List.of(testLanguage));
//
//        List<LanguageDTO> result = languageService.getAllLanguages();
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals("English", result.get(0).getLanguageName());
//
//        verify(languageRepository, times(1)).findAll();
//    }
//
//    @Test
//    void testGetLanguageByName_Found() {
//        when(languageRepository.findByLanguageName("ENGLISH")).thenReturn(Optional.of(testLanguage));
//
//        LanguageDTO result = languageService.getLanguageByName("English");
//
//        assertNotNull(result);
//        assertEquals("English", result.getLanguageName());
//
//        verify(languageRepository, times(1)).findByLanguageName("ENGLISH");
//    }
//
//    @Test
//    void testGetLanguageByName_NotFound() {
//        when(languageRepository.findByLanguageName("UNKNOWN")).thenReturn(Optional.empty());
//
//        assertThrows(LanguageNotFoundException.class, () -> languageService.getLanguageByName("UNKNOWN"));
//
//        verify(languageRepository, times(1)).findByLanguageName("UNKNOWN");
//    }
//
//    @Test
//    void testAddLanguageByName_Success() {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent("ENGLISH", "UK", "EUROPE")).thenReturn(Optional.empty());
//
//
//        languageService.addLanguageByName(testLanguage, null);
//
//        verify(languageRepository, times(1)).insert(any(LanguageDTO.class));
//    }
//
//    @Test
//    void testAddLanguageByName_AlreadyExists() {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent("ENGLISH", "UK", "EUROPE")).thenReturn(Optional.of(testLanguage));
//        assertThrows(DuplicateLanguageException.class, () -> languageService.addLanguageByName(testLanguage, null));
//
//        verify(languageRepository, never()).insert(any(LanguageDTO.class));
//    }
//
//    @Test
//    void testUpdateLanguageByName_Success() {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent("ENGLISH", "UK", "EUROPE"))
//                .thenReturn(Optional.of(testLanguage));
//
//        languageService.updateLanguageByName(testLanguage, updatedLanguage);
//
//        verify(languageRepository, times(1)).save(any(LanguageDTO.class));
//    }
//
//    @Test
//    void testUpdateLanguageByName_NotFound() {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent("UNKNOWN", "UNKNOWN", "UNKNOWN"))
//                .thenReturn(Optional.empty());
//
//        LanguageDTO unknownLanguage = new LanguageDTO("Unknown", "Unknown", "Unknown", false);
//        assertThrows(LanguageNotFoundException.class, () -> languageService.updateLanguageByName(unknownLanguage, updatedLanguage));
//
//        verify(languageRepository, never()).save(any(LanguageDTO.class));
//    }
//
//    @Test
//    void testDeleteSingleLanguageByName_Success() {
//        when(languageRepository.findAll()).thenReturn(List.of(testLanguage));
//
//        languageService.deleteLanguageByName(testLanguage);
//
//        verify(languageRepository, times(1)).delete(any(LanguageDTO.class));
//    }
//
//    @Test
//    void testDeleteMultipleLanguageByName_Success() {
//        when(languageRepository.findAll()).thenReturn(List.of(testLanguage, updatedLanguage));
//
//        languageService.deleteLanguageByName(testLanguage);
//
//        verify(languageRepository, times(1)).deleteById(any(String.class));
//    }
//
//    @Test
//    void testDeleteLanguageByName_NotFound() {
//        when(languageRepository.findAll()).thenReturn(List.of());
//
//        assertThrows(LanguageNotFoundException.class, () -> languageService.deleteLanguageByName(testLanguage));
//
//        verify(languageRepository, never()).delete(any(LanguageDTO.class));
//    }
//
//    @Test
//    void testAddDialectLanguage_Success() {
//        LanguageDTO dialectLanguage = new LanguageDTO("English", "Canada", "North America", true);
//        when(languageRepository.findByLanguageNameAndCountryAndContinent("ENGLISH", "CANADA", "NORTH AMERICA")).thenReturn(Optional.empty());
//
//        languageService.addLanguageByName(dialectLanguage, "English");
//
//        verify(languageRepository, times(2)).insert(any(LanguageDTO.class));
//    }
//}
