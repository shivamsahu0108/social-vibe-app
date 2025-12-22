package com.vibeshare.Security;

import com.vibeshare.Model.User;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;

@Getter
@EqualsAndHashCode(of = "id")
public class UserPrincipal implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String email;
    private final String username;
    private final String password;

    public UserPrincipal(
            Long id,
            String email,
            String username,
            String password
    ) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
    }

    /** Factory method */
    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getPassword()
        );
    }

    /** Spring Security identity (used as principal name) */
    @Override
    public String getUsername() {
        return email;
    }

    /** Roles / authorities (add later if needed) */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    /** Account status flags */
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
