package com.example.springlesson.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.springlesson.entity.User;

public class UserDetailsImpl implements UserDetails {
  private final User user;
  private final Collection<GrantedAuthority> authorities;
  
  // コンストラクターインジェクション
  public UserDetailsImpl(User user, Collection<GrantedAuthority> authorities) {
    this.user = user;
    this.authorities = authorities;
  }
  
  public User getUser() {
    return this.user;
  }
  
  @Override
  public String getUsername() {
    return this.user.getEmail();
  }
  
  @Override
  public String getPassword() {
    return this.user.getPassword();
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return this.authorities;
  }



}
