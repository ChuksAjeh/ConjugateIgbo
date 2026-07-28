package org.conjugateigbo.core.service.notion;

import org.conjugateigbo.core.model.dto.VerbCandidate;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the Notion extraction rules — no Spring context, no database.
 *
 * <p>Each case is drawn from a row that actually appears on the Notion verb
 * page, so the fixtures document the shapes the source data really contains
 * rather than idealised ones.
 */
class VerbCandidateExtractorTest {

    private final VerbCandidateExtractor extractor = new VerbCandidateExtractor();

    /** Wraps rows in the table markup the parser expects. */
    private static NotionPage page(boolean allVerbs, String... rows) {
        StringBuilder sb = new StringBuilder("<table header-row=\"true\">\n")
                .append("<tr><td>English</td><td>Verb(Kwale)</td><td>Verb(Delta Igbo)</td></tr>\n");
        for (String row : rows) sb.append(row).append('\n');
        sb.append("</table>");
        return new NotionPage("page-1", "Test Page", "https://notion.example", sb.toString(), allVerbs);
    }

    private static String row(String english, String kwale, String delta) {
        return "<tr><td>" + english + "</td><td>" + kwale + "</td><td>" + delta + "</td></tr>";
    }

    // -----------------------------------------------------------------------
    // Column selection
    // -----------------------------------------------------------------------

    @Test
    void readsTheDeltaColumnAndIgnoresKwale() {
        var result = extractor.extract(page(true, row("to understand", "ịghosa wo", "ịkwenye")));

        assertThat(result).singleElement()
                .extracting(VerbCandidate::igbo).isEqualTo("ịkwenye");
    }

    @Test
    void skipsRowsWhereOnlyKwaleIsRecorded() {
        // "to understand" on the real page has "- -" in the Delta column.
        var result = extractor.extract(page(true, row("to understand", "ịghosa wo", "- -")));
        assertThat(result).isEmpty();
    }

    @Test
    void skipsEntirelyEmptyRows() {
        var result = extractor.extract(page(true, row("", "", ""), row("to watch", "", "")));
        assertThat(result).isEmpty();
    }

    // -----------------------------------------------------------------------
    // Dual meaning: polysemy in the English column
    // -----------------------------------------------------------------------

    @Test
    void splitsAPolysemousGlossIntoOneRowPerSense() {
        var result = extractor.extract(page(true, row("to depart/leave/take off", "", "ịpu")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("to depart", "to leave", "to take off");
        assertThat(result).extracting(VerbCandidate::igbo)
                .containsOnly("ịpu");
    }

    @Test
    void splitSensesInheritTheLeadingInfinitiveMarker() {
        var result = extractor.extract(page(true, row("to talk/to speak", "", "ikwu okwu")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("to talk", "to speak");
    }

    @Test
    void splitSensesInheritAMultiWordInfinitiveMarker() {
        // "to be older than/younger than/to be delicious" — the shared marker
        // is "to be", so a bare "to younger than" would be wrong.
        var result = extractor.extract(
                page(true, row("to be older than/younger than/to be delicious", "", "ịsọ́")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("to be older than", "to be younger than", "to be delicious");
    }

    @Test
    void dropsSplitFragmentsThatAreOnlyAPreposition() {
        // "to hold/use/with" is shorthand for "to hold, to use, to be with";
        // "to with" is not a sense of anything.
        var result = extractor.extract(page(true, row("to hold/use/with", "", "ịji")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("to hold", "to use");
    }

    @Test
    void dropsSplitFragmentsThatAreOnlyAModalAuxiliary() {
        // "to be able to/can" lists "can" as a synonym of the whole phrase, not
        // an adjective completing "to be ___"; inheriting the "to be " marker
        // would coin the ungrammatical "to be can". The infinitive already
        // carries the meaning, so only it is kept.
        var result = extractor.extract(page(true, row("to be able to/can", "", "ịnwe ike")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("to be able to");
    }

    @Test
    void recordsTheOriginalEntryOnEverySplitDerivedRow() {
        var result = extractor.extract(page(true, row("to carry/take", "", "ịbùlù")));

        assertThat(result).allSatisfy(candidate ->
                assertThat(candidate.note()).isEqualTo("Split from Notion entry: ịbùlù = to carry/take"));
    }

    @Test
    void leavesUnsplitRowsWithoutANote() {
        var result = extractor.extract(page(true, row("to eat", "", "ịri")));

        assertThat(result).singleElement()
                .extracting(VerbCandidate::note).isNull();
    }

    // -----------------------------------------------------------------------
    // Dual meaning: alternate forms in the Igbo column
    // -----------------------------------------------------------------------

    @Test
    void splitsAlternateFormsIntoOneRowPerForm() {
        var result = extractor.extract(page(true, row("to carry (a load)", "", "ịbulu/ibu")));

        assertThat(result).extracting(VerbCandidate::igbo)
                .containsExactly("ịbulu", "ibu");
        assertThat(result).extracting(VerbCandidate::english)
                .containsOnly("to carry (a load)");
    }

    @Test
    void takesTheProductWhenBothColumnsSplit() {
        var result = extractor.extract(page(true, row("to hold/use", "", "ịji/iji")));

        assertThat(result).extracting(VerbCandidate::igbo, VerbCandidate::english)
                .containsExactlyInAnyOrder(
                        org.assertj.core.api.Assertions.tuple("ịji", "to hold"),
                        org.assertj.core.api.Assertions.tuple("ịji", "to use"),
                        org.assertj.core.api.Assertions.tuple("iji", "to hold"),
                        org.assertj.core.api.Assertions.tuple("iji", "to use"));
    }

    // -----------------------------------------------------------------------
    // Splitting must not fire inside brackets
    // -----------------------------------------------------------------------

    @Test
    void doesNotSplitOnSlashesInsideParentheses() {
        var result = extractor.extract(
                page(true, row("to be (state of person/thing/location of an obj)", "", "ịdi")));

        assertThat(result).singleElement()
                .extracting(VerbCandidate::english)
                .isEqualTo("to be (state of person/thing/location of an obj)");
    }

    @Test
    void splitsOutsideBracketsWhileKeepingBracketedTextIntact() {
        var result = extractor.extract(page(true, row("to watch (tv/film)/to view", "", "ịkili")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("to watch (tv/film)", "to view");
    }

    // -----------------------------------------------------------------------
    // Normalisation
    // -----------------------------------------------------------------------

    @Test
    void stripsMarkdownEmphasisFromForms() {
        var result = extractor.extract(page(true, row("to train", "", "**ị́zụ̀**")));

        assertThat(result).singleElement()
                .extracting(VerbCandidate::igbo).isEqualTo("ị́zụ̀");
    }

    @Test
    void lowerCasesSoCasingVariantsCollapseToOneEntry() {
        // The verb page writes the same verb both ways: "To Finish"/"Iagwu"
        // and "to finish"/"iagwu".
        var result = extractor.extract(page(true,
                row("To Finish", "", "Iagwu"),
                row("to finish", "", "iagwu")));

        assertThat(result).singleElement()
                .extracting(VerbCandidate::igbo, VerbCandidate::english)
                .containsExactly("iagwu", "to finish");
    }

    @Test
    void normalisesDecomposedUnicodeSoOneVerbIsNotStoredTwice() {
        String composed = "ịri";
        String decomposed = java.text.Normalizer.normalize(composed, java.text.Normalizer.Form.NFD);
        assertThat(decomposed).isNotEqualTo(composed);

        var result = extractor.extract(page(true,
                row("to eat", "", composed),
                row("to eat", "", decomposed)));

        assertThat(result).hasSize(1);
    }

    @Test
    void collapsesDuplicateRowsWithinAPage() {
        var result = extractor.extract(page(true,
                row("to boil", "", "ígbọ̄"),
                row("to boil", "", "ígbọ̄")));

        assertThat(result).hasSize(1);
    }

    @Test
    void keepsDistinctFormsThatShareAGloss() {
        // The real page lists two unrelated verbs both glossed "to boil".
        var result = extractor.extract(page(true,
                row("to boil", "", "**ígbọ̄**"),
                row("to boil", "", "**ísī**")));

        assertThat(result).extracting(VerbCandidate::igbo).containsExactly("ígbọ̄", "ísī");
    }

    // -----------------------------------------------------------------------
    // Topic pages
    // -----------------------------------------------------------------------

    @Test
    void keepsOnlyVerbalRowsOnATopicPage() {
        var result = extractor.extract(page(false,
                row("Tomorrow", "", "Échí"),
                row("Timing (verb)", "", "aku"),
                row("to give", "", "ịnye")));

        assertThat(result).extracting(VerbCandidate::english)
                .containsExactly("timing (verb)", "to give");
    }

    @Test
    void keepsEveryRowOnADedicatedVerbPage() {
        // "Counting to know how many" is a verb even though it is not an
        // infinitive gloss, so the verb page must not apply the topic filter.
        var result = extractor.extract(page(true, row("Counting to know how many", "", "ịgụ̄")));

        assertThat(result).hasSize(1);
    }

    @Test
    void dropsProseEntriesThatAreUsageNotesRatherThanGlosses() {
        var result = extractor.extract(page(true, row(
                "Counting and noting the numbers if you don’t want someone taking it without permission",
                "", "ịgụ̄ ọnụ̄")));

        assertThat(result).isEmpty();
    }

    // -----------------------------------------------------------------------
    // Dedupe key
    // -----------------------------------------------------------------------

    @Test
    void dedupeKeyIgnoresCaseAndSurroundingWhitespace() {
        var a = new VerbCandidate("ịri", "to eat", null, "p");
        var b = new VerbCandidate("  ỊRI  ", " To  Eat ", "note", "q");

        assertThat(a.dedupeKey()).isEqualTo(b.dedupeKey());
    }

    @Test
    void dedupeKeySeparatesDistinctSensesOfOneForm() {
        var a = new VerbCandidate("ịpu", "to leave", null, "p");
        var b = new VerbCandidate("ịpu", "to take off", null, "p");

        assertThat(a.dedupeKey()).isNotEqualTo(b.dedupeKey());
    }

    // -----------------------------------------------------------------------
    // Splitting helpers, exercised directly
    // -----------------------------------------------------------------------

    @Test
    void splitSensesReturnsTheWholeGlossWhenThereIsNothingToSplit() {
        assertThat(VerbSenseSplitter.splitSenses("to eat")).containsExactly("to eat");
    }

    @Test
    void splitFormsReturnsTheWholeFormWhenThereIsNothingToSplit() {
        assertThat(VerbSenseSplitter.splitForms("ịri")).containsExactly("ịri");
    }

    @Test
    void looksVerbalAcceptsInfinitivesAndExplicitVerbMarkers() {
        assertThat(VerbCandidateExtractor.looksVerbal("to run")).isTrue();
        assertThat(VerbCandidateExtractor.looksVerbal("To Run")).isTrue();
        assertThat(VerbCandidateExtractor.looksVerbal("Timing (verb)")).isTrue();
        assertThat(VerbCandidateExtractor.looksVerbal("Tomorrow")).isFalse();
        assertThat(VerbCandidateExtractor.looksVerbal("Today")).isFalse();
    }

    @Test
    void handlesAPageWithNoTablesWithoutThrowing() {
        var empty = new NotionPage("p", "Empty", "u", "Just some prose.", true);
        List<VerbCandidate> result = extractor.extract(empty);
        assertThat(result).isEmpty();
    }
}
