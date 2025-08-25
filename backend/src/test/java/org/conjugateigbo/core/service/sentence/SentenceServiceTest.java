//package org.languagecurationplatform.lcpcore.service.sentence;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.languagecurationplatform.lcpcore.model.enums.SentenceTypeEnum;
//import org.languagecurationplatform.lcpcore.model.language.LanguageDTO;
//import org.languagecurationplatform.lcpcore.model.sentence.SentenceDTO;
//import org.languagecurationplatform.lcpcore.repository.language.LanguageRepository;
//import org.languagecurationplatform.lcpcore.repository.sentence.SentenceRepository;
//import org.languagecurationplatform.lcpcore.util.FileStorageUtil;
//import org.languagecurationplatform.lcpcore.util.WordUtil;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.io.IOException;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class SentenceServiceTest {
//
//    @Mock
//    private SentenceRepository sentenceRepository;
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
//    private SentenceServiceImpl sentenceService;
//
//    private LanguageDTO mockLanguage;
//    private SentenceDTO mockSentence;
//
//    @BeforeEach
//    void setUp() {
//        mockLanguage = new LanguageDTO("English", "USA", "North America", false);
//        mockLanguage.setId("1");
//
//        mockSentence = new SentenceDTO("This is a test sentence.", "This is a test sentence.", "Esta es una oración de prueba.", SentenceTypeEnum.SENTENCE, null, null, null, mockLanguage.getId(), null, null, null, null);
//        mockSentence.setId("1");
//    }
//
//    @Test
//    void testAddSentence_Success() {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent(anyString(), anyString(), anyString()))
//                .thenReturn(Optional.of(mockLanguage));
//
//        when(sentenceRepository.save(any(SentenceDTO.class))).thenReturn(mockSentence);
//
//        SentenceDTO result = sentenceService.addSentence("This is a test sentence.", "This is a test sentence.", "Esta es una oración de prueba.", "SENTENCE", null, null, null,
//                "English", "USA", "North America", null, null);
//
//        assertNotNull(result);
//        assertEquals("This is a test sentence.", result.getSentence());
//        verify(sentenceRepository, times(1)).save(any(SentenceDTO.class));
//    }
//
//    @Test
//    void testGetSentence_Success() throws IOException {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent(anyString(), anyString(), anyString()))
//                .thenReturn(Optional.of(mockLanguage));
//
//        when(sentenceRepository.findAll()).thenReturn(List.of(mockSentence));
//
//        SentenceDTO result = sentenceService.getSentence("This is a test sentence.", "SENTENCE", "English", "USA", "North America");
//
//        assertNotNull(result);
//        assertEquals("This is a test sentence.", result.getSentence());
//    }
//
//    @Test
//    void testGetSentence_NotFound() {
//        when(sentenceRepository.findAll()).thenReturn(List.of());
//
//        assertThrows(IllegalArgumentException.class, () ->
//                sentenceService.getSentence("Unknown sentence.", "SENTENCE", "English", "USA", "North America"));
//    }
//
//    @Test
//    void testGetAllSentencesForLanguage() {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent(anyString(), anyString(), anyString()))
//                .thenReturn(Optional.of(mockLanguage));
//
//        when(sentenceRepository.findAll()).thenReturn(List.of(mockSentence));
//
//        List<SentenceDTO> result = sentenceService.getAllSentencesForLanguage("English", "USA", "North America");
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals("This is a test sentence.", result.get(0).getSentence());
//    }
//
//    @Test
//    void testUpdateSentence_Success() throws IOException {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent(anyString(), anyString(), anyString()))
//                .thenReturn(Optional.of(mockLanguage));
//
//        when(sentenceRepository.findAll()).thenReturn(List.of(mockSentence));
//
//        sentenceService.updateSentence("This is a test sentence.", "This is a test sentence.", "Esta es una oración de prueba.", "SENTENCE", null, null, null,
//                "English", "USA", "North America", "This is an updated test sentence.", false, null, null);
//
//        assertEquals("This is an updated test sentence.", mockSentence.getSentence());
//        verify(sentenceRepository, times(1)).save(mockSentence);
//    }
//
//    @Test
//    void testDeleteSentence_Success() throws IOException {
//        when(languageRepository.findByLanguageNameAndCountryAndContinent(anyString(), anyString(), anyString()))
//                .thenReturn(Optional.of(mockLanguage));
//
//        when(sentenceRepository.findAll()).thenReturn(List.of(mockSentence));
//
//        sentenceService.deleteSentence("This is a test sentence.", "SENTENCE", "English", "USA", "North America");
//
//        verify(sentenceRepository, times(1)).delete(mockSentence);
//    }
//}