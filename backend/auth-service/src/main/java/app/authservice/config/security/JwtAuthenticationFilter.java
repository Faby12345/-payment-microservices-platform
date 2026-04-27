package app.authservice.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * clinent -> request -> JwtAuthenticationFilter -> controller -> service -> response
 * */

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Spring's interface for loading users

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Look for the "Authorization" header in the incoming HTTP request
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        //  If there's no header, or it doesn't start with " Bearer ", reject or ignore it.
        // We pass it to the next filter (maybe it's a public endpoint like /login)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // Stop processing in THIS filter
        }

        //  Extract the actual token string (skipping the "Bearer " part)
        jwt = authHeader.substring(7);


        userEmail = jwtService.extractUsername(jwt);

        //  If we found an email AND the user isn't already authenticated in this thread
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Go to the Database and get the User details
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            //  Double-check: Is the token completely valid for this specific user?
            if (jwtService.isTokenValid(jwt, userDetails)) {

                //  Create the actual token for Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // We don't need credentials (password) here because the JWT proved who they are
                        userDetails.getAuthorities()
                );

                // Add extra details like their IP address or session info
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Store it in the Security Context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 9. Hand the request off to the next filter in the chain
        filterChain.doFilter(request, response);
    }
}