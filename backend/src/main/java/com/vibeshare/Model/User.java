package com.vibeshare.Model;
import com.vibeshare.Model.Notification;
import com.vibeshare.Model.Post;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;
    private String password;

    private String name;
    private String bio;
    private String profilePic;

    @ManyToMany
    @JoinTable(
            name = "post_likes",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "post_id")
    )
    private Set<Post> likedPosts = new HashSet<>();


    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Follower> following = new HashSet<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Follower> followers = new HashSet<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bookmark> bookmarks;

    private boolean isOnline = false;
    private java.time.LocalDateTime lastSeen;

    private String resetPasswordToken;
    private java.time.LocalDateTime resetPasswordTokenExpiry;

    private String verificationToken;
    private java.time.LocalDateTime verificationTokenExpiry;
    private boolean isVerified = false;

}
