package org.conjugateigbo.core.util;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Component
public class FileStorageUtil {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageUtil.class);

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private GridFSBucket gridFSBucket;

    // Store a file (audio/image) and return its ID
    public String storeFile(MultipartFile file) throws IOException {
        logger.info("Storing file: {} (Type: {})", file.getOriginalFilename(), file.getContentType());
        ObjectId fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
        logger.info("File stored successfully with ID: {}", fileId.toHexString());
        return fileId.toHexString();
    }

    // Retrieve file stream (audio/image)
    public InputStream getFileStream(String fileId) throws IOException {
        logger.info("Retrieving file with ID: {}", fileId);
        GridFSFile gridFSFile = gridFsTemplate.findOne(query(where("_id").is(new ObjectId(fileId))));
        if (gridFSFile == null) {
            logger.error("File not found: {}", fileId);
            throw new IOException("File not found: " + fileId);
        }
        logger.info("File retrieved successfully: {}", fileId);
        return gridFSBucket.openDownloadStream(gridFSFile.getObjectId());
    }

    public GridFsResource getFileResource(String fileId) {
        logger.info("Retrieving file resource with ID: {}", fileId);
        GridFSFile gridFSFile = gridFsTemplate.findOne(query(where("_id").is(new ObjectId(fileId))));
        if (gridFSFile == null) {
            logger.error("File not found: {}", fileId);
            return null;
        }
        logger.info("File resource retrieved successfully: {}", fileId);
        return new GridFsResource(gridFSFile, gridFSBucket.openDownloadStream(gridFSFile.getObjectId()));
    }
}
