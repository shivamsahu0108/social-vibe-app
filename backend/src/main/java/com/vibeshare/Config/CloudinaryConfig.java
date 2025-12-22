package com.vibeshare.Config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dyv8n0zmy",
                "api_key", "596273685536643",
                "api_secret", "aCZEVCCuRQ0ft0G1RT3BGQu6xr8"
        ));
    }
}
