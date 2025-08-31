package org.conjugateigbo.core.repository.verb;


import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;

import java.util.List;
import java.util.Optional;

public interface VerbRepository {
    List<VerbDTO> list(Dialect dialect, int limit, String search);

    Optional<VerbDTO> findOne(Dialect dialect, long id);

    Optional<AudioDTO> findAudio(Dialect dialect, long verbId);
}
