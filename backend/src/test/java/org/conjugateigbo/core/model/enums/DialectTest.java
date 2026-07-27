package org.conjugateigbo.core.model.enums;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link Dialect} slug handling.
 *
 * <p>The slug is the contract between three things that used to be maintained
 * separately: the REST path variable, the {@code audio_assets.dialect} column
 * value, and the mobile app's dialect profile. These tests pin it down.
 */
class DialectTest {

    @ParameterizedTest
    @ValueSource(strings = {"delta-igbo", "delta_igbo", "deltaigbo", "DELTA-IGBO", "Delta_Igbo"})
    void resolvesEveryDeltaSlugVariant(String slug) {
        assertThat(Dialect.fromSlug(slug)).contains(Dialect.DELTA_IGBO);
    }

    @ParameterizedTest
    @ValueSource(strings = {"central-igbo", "central_igbo", "centraligbo", "CENTRAL-IGBO"})
    void resolvesEveryCentralSlugVariant(String slug) {
        assertThat(Dialect.fromSlug(slug)).contains(Dialect.CENTRAL_IGBO);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "klingon", "anambra-igbo", "delta", "igbo"})
    void rejectsUnknownSlugs(String slug) {
        assertThat(Dialect.fromSlug(slug)).isEmpty();
    }

    @Test
    void everyDialectHasADistinctNonBlankSlug() {
        var slugs = java.util.Arrays.stream(Dialect.values()).map(Dialect::slug).toList();
        assertThat(slugs).doesNotContainNull().noneMatch(String::isBlank);
        assertThat(slugs).doesNotHaveDuplicates();
    }

    @Test
    void slugRoundTripsThroughFromSlug() {
        for (Dialect dialect : Dialect.values()) {
            assertThat(Dialect.fromSlug(dialect.slug())).contains(dialect);
        }
    }
}
