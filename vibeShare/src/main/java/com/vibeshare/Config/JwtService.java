package com.vibeshare.Config;

import com.vibeshare.Model.User;
import com.vibeshare.Repository.UserRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.vibeshare.Security.UserPrincipal;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import java.security.Key;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final UserRepository userRepository;

    private static final String SECRET =
            "jfosihgfhgdufhgdvbghguidsbigsdvgh8yfvgudfgvidhfdgjvhhfsdiufudsgfuygvfrygvslibvsdhgbuodfgbduhvduhfguobh";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    /* ================= TOKEN GENERATION ================= */

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("id", user.getId())
                .claim("username", user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + (1000L * 60 * 60 * 24 * 7)) // 7 days
                )
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public UserPrincipal extractUserPrincipal(String token) {
        Claims claims = extractAllClaims(token);

        Long id = claims.get("id", Long.class);
        String email = claims.getSubject();
        String username = claims.get("username", String.class);

        return new UserPrincipal(
                id,
                email,
                username,
                null   // ✅ password not needed for WS auth
        );
    }


    /* ================= TOKEN PARSING ================= */

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /* ================= TOKEN VALIDATION ================= */

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    /* ================= REFRESH ================= */

    public String refreshAccessToken(String refreshToken) {
        Claims claims = extractAllClaims(refreshToken);
        String email = claims.getSubject();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return generateToken(user);
    }
}
