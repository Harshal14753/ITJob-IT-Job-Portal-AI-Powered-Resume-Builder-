package com.itjob.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.itjob.services.JwtService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getServletPath();

        String authHeader = request.getHeader("Authorization");

        log.info("[JWT-FILTER] {} {} - Auth header present: {}", method, path, authHeader != null);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[JWT-FILTER] No valid Authorization header for {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = authHeader.substring(7);
        log.info("[JWT-FILTER] Token extracted (first 20 chars): {}...", accessToken.substring(0, Math.min(20, accessToken.length())));

        try {

            String username = jwtService.extractUsername(accessToken);
            log.info("[JWT-FILTER] Extracted username: {}", username);

            if (username != null
                    && SecurityContextHolder.getContext()
                            .getAuthentication() == null) {

                // Load user from database
                UserDetails userDetails
                        = userDetailsService.loadUserByUsername(username);

                log.info("[JWT-FILTER] User loaded: {}, Authorities: {}", username, userDetails.getAuthorities());

                // Validate token
                if (jwtService.isTokenValid(accessToken, userDetails)) {

                    log.info("[JWT-FILTER] Token VALID for {}", username);

                    UsernamePasswordAuthenticationToken authenticationToken
                            = new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authenticationToken);

                    log.info("[JWT-FILTER] Authentication SET for {}", username);
                } else {
                    log.warn("[JWT-FILTER] Token INVALID for {}", username);
                }
            }
        } catch (ExpiredJwtException ex) {
            log.warn("[JWT-FILTER] Token EXPIRED: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("""
                {
                    "error": "TOKEN_EXPIRED"
                }
            """);
            return;
        } catch (JwtException ex) {
            log.warn("[JWT-FILTER] Token INVALID: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("""
                {
                    "error": "INVALID_TOKEN"
                }
            """);
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request){
        String path = request.getServletPath();
        // Skip filter for public auth endpoints and AI endpoints (AIController does its own JWT validation)
        if (path.startsWith("/api/v1/auth") || path.startsWith("/api/v1/ai")) {
            log.info("[JWT-FILTER] Skipping filter for public path: {}", path);
            return true;
        }
        return false;
    }

}
