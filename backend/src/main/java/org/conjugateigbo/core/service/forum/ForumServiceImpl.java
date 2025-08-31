//package org.conjugateigbo.core.service.forum;
//
//import org.conjugateigbo.core.model.forum.CommentDTO;
//import org.conjugateigbo.core.model.forum.PostDTO;
//import org.conjugateigbo.core.repository.forum.CommentRepository;
//import org.conjugateigbo.core.repository.forum.PostRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.Instant;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//public class ForumServiceImpl implements ForumService {
//
//    private static final Logger LOGGER = LoggerFactory.getLogger(ForumServiceImpl.class);
//
//    @Autowired
//    private PostRepository postRepo;
//
//    @Autowired
//    private CommentRepository commentRepo;
//
//    @Override
//    public PostDTO createPost(PostDTO post) {
//        LOGGER.debug("Creating post: {}", post);
//        post.setCreatedAt(Instant.now());
//        PostDTO createdPost = postRepo.insert(post);
//        LOGGER.debug("Post created successfully: {}", createdPost);
//        return createdPost;
//    }
//
//    @Override
//    public List<PostDTO> getAllPosts() {
//        LOGGER.debug("Fetching all posts");
//        List<PostDTO> posts = postRepo.findAll();
//        LOGGER.debug("Retrieved posts: {}", posts);
//        return posts;
//    }
//
//    @Override
//    public PostDTO getPostById(String postId) {
//        LOGGER.debug("Fetching post by ID: {}", postId);
//        PostDTO post = postRepo.findById(postId).orElseThrow();
//        LOGGER.debug("Retrieved post: {}", post);
//        return post;
//    }
//
//    @Override
//    public CommentDTO addCommentToPost(String postId, String userId, CommentDTO comment) {
//        LOGGER.debug("Adding comment to post ID: {} by user ID: {}", postId, userId);
//        comment.setPostId(postId);
//        comment.setCreatedAt(Instant.now());
//        comment.setAuthorId(userId);
//        CommentDTO addedComment = commentRepo.insert(comment);
//        LOGGER.debug("Comment added successfully: {}", addedComment);
//        return addedComment;
//    }
//
//    @Override
//    public List<CommentDTO> getCommentsForPost(String postId) {
//        LOGGER.debug("Fetching comments for post ID: {}", postId);
//        List<CommentDTO> topLevel = commentRepo.findById(postId).get().getReplies();
//        for (CommentDTO comment : topLevel) {
//            comment.setReplies(fetchRepliesRecursive(comment.getId()));
//        }
//        LOGGER.debug("Retrieved comments for post ID {}: {}", postId, topLevel);
//        return topLevel;
//    }
//
//    @Override
//    public List<CommentDTO> getRepliesToComment(String parentCommentId) {
//        LOGGER.debug("Fetching replies for comment ID: {}", parentCommentId);
//        List<CommentDTO> replies = fetchRepliesRecursive(parentCommentId);
//        LOGGER.debug("Retrieved replies for comment ID {}: {}", parentCommentId, replies);
//        return replies;
//    }
//
//    @Override
//    public void incrementCommentLikes(String commentId) {
//        LOGGER.debug("Incrementing likes for comment ID: {}", commentId);
//        Optional<CommentDTO> comment = commentRepo.findById(commentId);
//
//        comment.ifPresent(c -> {
//            c.setLikes(c.getLikes() + 1);
//            commentRepo.save(c);
//            LOGGER.debug("Likes incremented for comment: {}", c);
//        });
//    }
//
//    private List<CommentDTO> fetchRepliesRecursive(String parentId) {
//        LOGGER.debug("Fetching replies recursively for parent comment ID: {}", parentId);
//        List<CommentDTO> replies = commentRepo.findByParentCommentId(parentId);
//        for (CommentDTO reply : replies) {
//            reply.setReplies(fetchRepliesRecursive(reply.getId()));
//        }
//        LOGGER.debug("Retrieved replies recursively for parent comment ID {}: {}", parentId, replies);
//        return replies;
//    }
//
//    @Override
//    public List<CommentDTO> getFlatCommentTree(String postId) {
//        LOGGER.debug("Fetching flat comment tree for post ID: {}", postId);
//        List<CommentDTO> all = commentRepo.findByPostId(postId);
//        List<CommentDTO> flatComments = flattenComments(null, all, 0);
//        LOGGER.debug("Retrieved flat comment tree for post ID {}: {}", postId, flatComments);
//        return flatComments;
//    }
//
//    private List<CommentDTO> flattenComments(String parentId, List<CommentDTO> allComments, int depth) {
//        LOGGER.debug("Flattening comments for parent ID: {} at depth: {}", parentId, depth);
//        List<CommentDTO> flattened = allComments.stream()
//                .filter(c -> {
//                    if (parentId == null) return c.getParentCommentId() == null;
//                    return parentId.equals(c.getParentCommentId());
//                })
//                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt())) // optional: sort by date
//                .flatMap(comment -> {
//                    comment.setDepth(depth);
//                    List<CommentDTO> children = flattenComments(comment.getId(), allComments, depth + 1);
//                    return java.util.stream.Stream.concat(java.util.stream.Stream.of(comment), children.stream());
//                })
//                .toList();
//        LOGGER.debug("Flattened comments for parent ID {}: {}", parentId, flattened);
//        return flattened;
//    }
//}