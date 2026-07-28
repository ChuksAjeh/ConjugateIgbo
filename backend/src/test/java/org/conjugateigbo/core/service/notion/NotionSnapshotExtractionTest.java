package org.conjugateigbo.core.service.notion;

import org.conjugateigbo.core.model.dto.VerbCandidate;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Runs the extractor over the snapshots actually checked into
 * {@code src/main/resources/notion}, rather than hand-built fixtures.
 *
 * <p>Unit tests prove the rules behave as designed; this proves they behave as
 * intended on the real page, which is hand-maintained and full of edge cases no
 * fixture would think to include. It also fails loudly if a re-captured
 * snapshot changes shape — a renamed column, say — instead of silently
 * importing nothing.
 *
 * <p>No database and no network: this runs in CI as an ordinary unit test.
 */
class NotionSnapshotExtractionTest {

    private static List<VerbCandidate> candidates;
    private static Map<String, VerbCandidate> byKey;

    @BeforeAll
    static void extractFromTheCommittedSnapshots() throws IOException {
        var source = new ClasspathNotionPageSource();
        var extractor = new VerbCandidateExtractor();

        var collected = new LinkedHashMap<String, VerbCandidate>();
        for (NotionPage page : source.pages()) {
            for (VerbCandidate candidate : extractor.extract(page)) {
                collected.putIfAbsent(candidate.dedupeKey(), candidate);
            }
        }
        byKey = collected;
        candidates = List.copyOf(collected.values());
    }

    /** Finds a candidate by exact form and gloss. */
    private static Optional<VerbCandidate> find(String igbo, String english) {
        return Optional.ofNullable(byKey.get(new VerbCandidate(igbo, english, null, null).dedupeKey()));
    }

    @Test
    void theManifestAndEverySnapshotItReferencesAreReadable() throws IOException {
        assertThat(new ClasspathNotionPageSource().pages())
                .hasSize(2)
                .extracting(NotionPage::title)
                .containsExactly("All Verbs in Kwale and Delta Igbo", "Time");
    }

    @Test
    void extractsASubstantialNumberOfVerbs() {
        // A guard against a parser or column-name regression quietly reducing
        // the import to a handful of rows.
        assertThat(candidates).hasSizeGreaterThan(150);
    }

    @Test
    void everyCandidateIsUsable() {
        assertThat(candidates).allSatisfy(candidate -> {
            assertThat(candidate.igbo()).isNotBlank();
            assertThat(candidate.english()).isNotBlank();
            assertThat(candidate.sourceRef()).isNotBlank();
            // Markdown emphasis and placeholder cells must never reach the DB.
            assertThat(candidate.igbo()).doesNotContain("*").isNotEqualTo("- -");
        });
    }

    @Test
    void candidatesAreUniqueOnFormAndSense() {
        assertThat(candidates).extracting(VerbCandidate::dedupeKey).doesNotHaveDuplicates();
    }

    @Test
    void splitsThePolysemousEntriesTheNotionPageDocuments() {
        // "Polysemous Verbs" page: ipu -> to leave / to depart / to take off.
        assertThat(find("ịpu", "to depart")).isPresent();
        assertThat(find("ịpu", "to leave")).isPresent();
        assertThat(find("ịpu", "to take off")).isPresent();
    }

    @Test
    void splitsAlternateFormsIntoSeparateVerbs() {
        // "to carry (a load)" is recorded as ịbulu/ibu.
        assertThat(find("ịbulu", "to carry (a load)")).isPresent();
        assertThat(find("ibu", "to carry (a load)")).isPresent();
    }

    @Test
    void keepsBracketedSlashesIntactRatherThanSplittingThem() {
        assertThat(find("ịdi", "to be (state of person/thing/location of an obj)")).isPresent();
    }

    @Test
    void splitDerivedRowsCarryTheirOriginalEntryAsProvenance() {
        var split = find("ịpu", "to leave").orElseThrow();
        assertThat(split.note()).startsWith("Split from Notion entry:");
    }

    @Test
    void verbatimRowsCarryNoNote() {
        assertThat(find("ịri", "to eat")).get()
                .extracting(VerbCandidate::note).isNull();
    }

    @Test
    void neverIngestsAKwaleOnlyForm() {
        // "to understand" has ịghosa wo in Kwale and "- -" in Delta.
        assertThat(find("ịghosa wo", "to understand")).isEmpty();
        assertThat(candidates).extracting(VerbCandidate::english)
                .doesNotContain("to understand");
    }

    @Test
    void stripsMarkdownEmphasisFromTheSourcePage() {
        assertThat(find("ị́zụ̀", "to train")).isPresent();
    }

    @Test
    void keepsTwoDistinctVerbsThatShareTheGlossToBoil() {
        assertThat(find("ígbọ̄", "to boil")).isPresent();
        assertThat(find("ísī", "to boil")).isPresent();
    }

    @Test
    void takesOnlyTheVerbalRowsFromTheTimeTopicPage() {
        var timePageId = "1f90da03-1c7f-8021-8558-c22d3488899a";
        var fromTime = candidates.stream()
                .filter(candidate -> timePageId.equals(candidate.sourceRef()))
                .toList();

        assertThat(fromTime).isNotEmpty();
        assertThat(fromTime).extracting(VerbCandidate::english)
                .doesNotContain("tomorrow", "week", "month", "year");
    }

    @Test
    void dropsTheProseUsageNoteRows() {
        assertThat(candidates).extracting(VerbCandidate::english)
                .noneMatch(gloss -> gloss.contains("without permission"));
    }

    @Test
    void dropsTheBareModalWhenSplittingToBeAbleToCan() {
        // "to be able to/can" must not coin the ungrammatical "to be can".
        assertThat(find("ịnwe ike", "to be able to")).isPresent();
        assertThat(candidates).extracting(VerbCandidate::english)
                .doesNotContain("to be can");
    }

    @Test
    void normalisesCasingSoTheSameVerbIsNotStoredTwice() {
        // The page writes both "To Finish"/"Iagwu" and lower-case variants.
        assertThat(candidates).extracting(VerbCandidate::igbo)
                .allSatisfy(igbo -> assertThat(igbo).isEqualTo(igbo.toLowerCase(java.util.Locale.ROOT)));
    }
}
