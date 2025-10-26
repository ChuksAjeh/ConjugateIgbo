package org.conjugateigbo.core.service;

import org.conjugateigbo.core.model.dto.AudioDTO;
import org.conjugateigbo.core.model.dto.VerbDTO;
import org.conjugateigbo.core.model.enums.Dialect;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VerbService {

    List<VerbDTO> list(Dialect d, int limit, String search);

    VerbDTO one(Dialect d, long id);

    Optional<AudioDTO> audioMeta(Dialect d, long id);

    String signedAudioUrl(Dialect d, long id, Duration ttl);

    Map<String, Object> importVerbs(Dialect d, MultipartFile file, String filePath) throws Exception;
}
