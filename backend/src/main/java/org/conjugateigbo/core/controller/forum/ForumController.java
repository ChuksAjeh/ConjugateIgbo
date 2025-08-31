//package org.conjugateigbo.core.controller.forum;
//
//import org.conjugateigbo.core.model.forum.CommentDTO;
//import org.conjugateigbo.core.model.forum.PostDTO;
//import org.conjugateigbo.core.service.forum.ForumService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/forum")
//public class ForumController {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(ForumController.class);
//
//    @Autowired
//    private ForumService forumService;
//
//    @PostMapping("/create-post")
//    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO post) {
//        try {
//            PostDTO createdPost = forumService.createPost(post);
//            LOGGER.info("Post created successfully: {}", createdPost);
//            return ResponseEntity.ok(createdPost);
//        } catch (Exception e) {
//            LOGGER.error("Error while creating post: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/get-all-posts")
//    public ResponseEntity<List<PostDTO>> getAllPosts() {
//        try {
//            List<PostDTO> posts = forumService.getAllPosts();
//            LOGGER.info("Successfully retrieved all posts.");
//            return ResponseEntity.ok(posts);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching posts: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/posts")
//    public ResponseEntity<PostDTO> getPostById(@RequestParam String id) {
//        try {
//            PostDTO post = forumService.getPostById(id);
//            LOGGER.info("Successfully retrieved post with ID: {}", id);
//            return ResponseEntity.ok(post);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching post with ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PostMapping("/posts/{postId}/comments/{userId}")
//    public ResponseEntity<CommentDTO> addComment(@PathVariable String postId, @PathVariable String userId, @RequestBody CommentDTO comment) {
//        try {
//            CommentDTO addedComment = forumService.addCommentToPost(postId, userId, comment);
//            LOGGER.info("Comment added successfully to post ID: {}", postId);
//            return ResponseEntity.ok(addedComment);
//        } catch (Exception e) {
//            LOGGER.error("Error while adding comment to post ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/posts/{postId}/comments")
//    public ResponseEntity<List<CommentDTO>> getThreadedComments(@PathVariable String postId) {
//        try {
//            List<CommentDTO> comments = forumService.getCommentsForPost(postId);
//            LOGGER.info("Successfully retrieved threaded comments for post ID: {}", postId);
//            return ResponseEntity.ok(comments);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching threaded comments for post ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/comments/{parentCommentId}/replies")
//    public ResponseEntity<List<CommentDTO>> getReplies(@PathVariable String parentCommentId) {
//        try {
//            List<CommentDTO> replies = forumService.getRepliesToComment(parentCommentId);
//            LOGGER.info("Successfully retrieved replies for comment ID: {}", parentCommentId);
//            return ResponseEntity.ok(replies);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching replies for comment ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @GetMapping("/posts/{postId}/comments/flat")
//    public ResponseEntity<List<CommentDTO>> getFlatComments(@PathVariable String postId) {
//        try {
//            List<CommentDTO> flatComments = forumService.getFlatCommentTree(postId);
//            LOGGER.info("Successfully retrieved flat comments for post ID: {}", postId);
//            return ResponseEntity.ok(flatComments);
//        } catch (Exception e) {
//            LOGGER.error("Error while fetching flat comments for post ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//
//    @PutMapping("/comments/{commentId}/like")
//    public ResponseEntity<Void> likeComment(@PathVariable String commentId) {
//        try {
//            forumService.incrementCommentLikes(commentId);
//            LOGGER.info("Successfully liked comment with ID: {}", commentId);
//            return ResponseEntity.ok().build();
//        } catch (Exception e) {
//            LOGGER.error("Error while liking comment with ID: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//}