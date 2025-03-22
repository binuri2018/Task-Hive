package com.example.Backend.config;

import com.example.Backend.enums.RegistrationSource;
import com.example.Backend.model.User;
import com.example.Backend.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;
import java.security.Key;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthenticationFilter;
    private final UserService userService;
    @Autowired
    public SecurityConfig(Key jwtSecretKey,@Lazy UserService userService) {
        this.jwtAuthenticationFilter = new JWTAuthenticationFilter(jwtSecretKey);
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(t ->
                        t.configurationSource(corsConfigurationSource())
                )
                .csrf(t -> t.disable())
                .sessionManagement(t -> t.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(t ->
                        t.requestMatchers("/api/users/login", "/api/users/register").permitAll()
                                .requestMatchers("/oauth2/**").permitAll()
                                .requestMatchers("/api/auth/**").permitAll()
                                .anyRequest().authenticated()
                )
                .oauth2Login(t ->
                        t.loginPage("/oauth2/authorization/google")
                                .successHandler(oAuth2AuthenticationSuccessHandler())
                                .permitAll()
                )
                .logout(t ->
                        t.logoutUrl("/logout")
                                .logoutSuccessUrl("http://127.0.0.1:5173/login")
                                .invalidateHttpSession(true)
                                .clearAuthentication(true)
                                .deleteCookies("JSESSIONID")
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                                Authentication authentication) throws IOException, ServletException {
                OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();


                String name = oauthUser.getAttribute("name");
                String email = oauthUser.getAttribute("email");
                String picture = oauthUser.getAttribute("picture");

                //create or get user and generate JWT token
                User user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setProfileImage(picture);
                user.setRegistrationSource(RegistrationSource.GOOGLE);

                //generate token using UserService
                String token = userService.generateJwtTokenForOAuthUser(user);

                //redirect to frontend with token
                response.sendRedirect("http://127.0.0.1:5173/oauth-success?token=" + token);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://127.0.0.1:5173", "http://localhost:5173"));
        configuration.setAllowedMethods(List.of("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setMaxAge(3600L);
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public JWTAuthenticationFilter jwtAuthenticationFilter(Key jwtSecretKey) {
        return new JWTAuthenticationFilter(jwtSecretKey);
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 