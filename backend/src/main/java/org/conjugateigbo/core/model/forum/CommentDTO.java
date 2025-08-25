package org.conjugateigbo.core.model.forum;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Document(collection = "comments")
public class CommentDTO {

    @Id
    private String id;

    private String postId;              // the root post ID
    private String parentCommentId;     // null if top-level
    private String authorId;
    private String text;
    private Instant createdAt = Instant.now();
    private int likes = 0;

    // Threaded replies – built at runtime
    @Transient
    private List<CommentDTO> replies;

    // Used in flat comment trees
    @Transient
    private int depth;
}
