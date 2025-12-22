package com.vibeshare.Service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.vibeshare.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file) {

        try {
            if(file.getSize() > 100 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds 100MB");
            }
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto" // auto detects image/video
                    ));

            String url = uploadResult.get("secure_url").toString();
            if (url.contains("/upload/")) {
                url = url.replace("/upload/", "/upload/f_auto,q_auto/");
            }
            return url;

        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage());
        }
    }
}
