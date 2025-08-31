//package org.conjugateigbo.core.repository.forum;
//
//import org.conjugateigbo.core.model.forum.CommentDTO;
//import org.springframework.data.mongodb.repository.MongoRepository;
//
//import java.util.List;
//
//public interface CommentRepository extends MongoRepository<CommentDTO, String> {
//    List<CommentDTO> findByPostIdAndParentCommentIdIsNull(String postId);
//
//    List<CommentDTO> findByParentCommentId(String parentCommentId);
//
//    List<CommentDTO> findByPostId(String postId);
//
//}
