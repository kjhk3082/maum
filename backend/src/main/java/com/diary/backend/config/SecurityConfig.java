package com.diary.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // H2 콘솔 접근 허용 (개발용)
                .requestMatchers("/h2-console/**").permitAll()
                // Swagger 접근 허용
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 헬스체크 및 에러 페이지 접근 허용
                .requestMatchers("/actuator/**", "/error").permitAll()
                // 임시로 모든 API 접근 허용 (인증 구현 전)
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            )
            .headers(headers -> headers
                // H2 콘솔의 iframe 사용을 위해 설정
                .frameOptions(frameOptions -> frameOptions.deny())
            );
        
        return http.build();
    }
}
