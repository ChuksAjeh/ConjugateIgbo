package org.conjugateigbo.core.model.forum;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class PostDTO {

    @Id
    private String id;

    private String authorId;
    private String title;
    private String content;
    private List<String> tags;
    private Instant createdAt = Instant.now();
}
