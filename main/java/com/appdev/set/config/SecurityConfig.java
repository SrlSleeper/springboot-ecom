package com.appdev.set.config;

import com.appdev.set.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

   private final CustomUserDetailsService userDetailsService;

   public SecurityConfig(CustomUserDetailsService userDetailsService) {
       this.userDetailsService = userDetailsService;
   }

   @Bean
   public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       http
           .csrf(AbstractHttpConfigurer::disable)
           .authorizeHttpRequests(authorize -> authorize
               .requestMatchers(
                   "/",
                   "/auth/**",
                   "/register",
                   "/verify-email",
                   "/login",
                   "/forgot-password",
                   "/reset-password",
                   "/css/**",
                   "/js/**",
                   "/images/**",
                   "/webjars/**",
                   "/placeholder.svg",
                   "/placeholder.svg/**",  // Add this line to allow placeholder.svg with parameters
                   "/favicon.ico",
                   "/error",
                   "/error/**"
               ).permitAll()
               .requestMatchers("/admin/**").hasRole("ADMIN")
               .anyRequest().authenticated()
           )
           .formLogin(form -> form
               .loginPage("/auth/login")
               .loginProcessingUrl("/auth/login")
               .defaultSuccessUrl("/")
               .failureUrl("/auth/login?error=true")
               .permitAll()
           )
           .logout(logout -> logout
               .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout"))
               .logoutSuccessUrl("/auth/login?logout=true")
               .deleteCookies("JSESSIONID")
               .invalidateHttpSession(true)
               .clearAuthentication(true)
               .permitAll()
           )
           .rememberMe(remember -> remember
               .key("uniqueAndSecretKey")
               .tokenValiditySeconds(86400) // 1 day
           );
       
       return http.build();
   }

   @Bean
   public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
       return http.getSharedObject(AuthenticationManagerBuilder.class)
               .userDetailsService(userDetailsService)
               .passwordEncoder(passwordEncoder())
               .and()
               .build();
   }

   @Bean
   public PasswordEncoder passwordEncoder() {
       return new BCryptPasswordEncoder();
   }
}
