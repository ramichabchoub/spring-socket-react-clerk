package com.example.club_management.service;

import com.example.club_management.model.User;
import com.example.club_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User createOrUpdateUser(User user) {
        user.setUpdatedAt(LocalDateTime.now());

        if (!userRepository.existsByClerkId(user.getClerkId())) {
            user.setCreatedAt(LocalDateTime.now());
        }

        return userRepository.save(user);
    }

    public User getUserByClerkId(String clerkId) {
        return userRepository.findById(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}