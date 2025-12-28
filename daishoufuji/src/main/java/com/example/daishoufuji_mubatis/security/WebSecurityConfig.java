package com.example.daishoufuji_mubatis.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {
  @Order(1)
  @Bean
  public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/admin/**") // 管理者ページのURLパターン
        .authorizeHttpRequests((requests) -> requests
            .requestMatchers( "/admin/login").permitAll() // ログインページとログイン処理はすべてのユーザーにアクセスを許可
            .requestMatchers("/admin/login", "/admin/login/**").permitAll()

            .anyRequest().hasRole("ADMIN") // その他の管理者ページはADMINロールを持つユーザーのみアクセス可能
        )
        .formLogin((form) -> form
            .loginPage("/admin/login") // 管理者ログインページのURL
            .loginProcessingUrl("/admin/dologin") // 管理者ログインフォームの送信先URL
            .usernameParameter("email")  // ★これが重要！
            .passwordParameter("password")
            .defaultSuccessUrl("/admin/adminPage", true) // ログイン成功時のリダイレクト先URL
            .failureUrl("/admin/login?error") // ログイン失敗時のリダイレクト先URL
            .permitAll())
        .logout((logout) -> logout
            .logoutSuccessUrl("/admin/login?loggedOut") // ログアウト時のリダイレクト先URL
            .permitAll());

    return http.build();
  }
  @Order(2)
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests((requests) -> requests
            .requestMatchers("/css/**", "/images/**", "/js/**", "/storage/**").permitAll() // すべてのユーザーにアクセスを許可するURL
            .requestMatchers("/", "/login","/login/**", "/auth/**").permitAll()
            .requestMatchers("/product/**").permitAll()
            .requestMatchers("/review/**").permitAll()
            .requestMatchers("/purchase/**").permitAll()
            .anyRequest().authenticated() // 上記以外のURLはログインが必要（会員または管理者のどちらでもOK）
        )
        .formLogin((form) -> form
            .loginPage("/auth/login") // ログインページのURL
            .loginProcessingUrl("/auth/login") // ログインフォームの送信先URL
            .usernameParameter("email")  // ★これが重要！
            .passwordParameter("password")
            .defaultSuccessUrl("/product", true) // ログイン成功時のリダイレクト先URL
            .failureUrl("/auth/login?error") // ログイン失敗時のリダイレクト先URL
            .permitAll())
        .logout((logout) -> logout
            .logoutSuccessUrl("/?loggedOut=true") // ログアウト時のリダイレクト先URL
            .permitAll());

    return http.build();
  }

//  // 本番用
  @Bean
  public PasswordEncoder passwordEncoder() {
   return new BCryptPasswordEncoder();
  }
}
