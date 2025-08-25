package org.conjugateigbo.core.service.forum;

import org.conjugateigbo.core.model.forum.CommentDTO;
import org.conjugateigbo.core.model.forum.PostDTO;

import java.util.List;

public interface ForumService {
    PostDTO createPost(PostDTO post);

    List<PostDTO> getAllPosts();

    PostDTO getPostById(String postId);

    List<CommentDTO> getFlatCommentTree(String postId);

    CommentDTO addCommentToPost(String postId, String userId, CommentDTO comment);

    List<CommentDTO> getCommentsForPost(String postId); // full tree

    List<CommentDTO> getRepliesToComment(String parentCommentId);

    void incrementCommentLikes(String commentId);
}
