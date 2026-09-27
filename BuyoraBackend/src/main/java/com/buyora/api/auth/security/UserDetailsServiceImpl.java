package com.buyora.api.auth.security;

import com.buyora.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .map(user -> {
                var authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName()))
                    .toList();
                return User.builder()
                    .username(user.getEmail())
                    .password(user.getPasswordHash())
                    .authorities(authorities)
                    .accountExpired(false)
                    .accountLocked(user.getStatus() == com.buyora.api.user.entity.UserStatus.SUSPENDED)
                    .credentialsExpired(false)
                    .disabled(!user.isActive())
                    .build();
            })
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
