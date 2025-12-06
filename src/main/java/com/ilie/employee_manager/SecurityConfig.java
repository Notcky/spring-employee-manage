package com.ilie.employee_manager;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests((requests) -> requests
                        // ... (regulile raman la fel: GET=permitAll, POST/PUT/DELETE=hasRole("ADMIN")) ...
                        .requestMatchers("/", "/index.html", "/script.js", "/style.css", "/api/employees").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/employees/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/employees").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/employees/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/employees/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                // REVENIM LA ASTA: Autentificare de Baza (Header)
                .httpBasic(withDefaults());

        return http.build();
    }

    // Definirea Utilizatorilor (Rămâne la fel)
    @Bean
    public UserDetailsService userDetailsService() {
        // ... (admin:parola123, user:parola123)
        UserDetails admin = User.withDefaultPasswordEncoder()
                .username("admin")
                .password("parola123")
                .roles("ADMIN")
                .build();

        UserDetails user = User.withDefaultPasswordEncoder()
                .username("user")
                .password("parola123")
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, user);
    }
}