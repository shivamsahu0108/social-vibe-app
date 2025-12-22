package com.vibeshare.DTO.Request;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String username;   // new username
    private String bio;        // update bio section
    private String email;      // optional: update email
    private String name; // optional: update name
}
