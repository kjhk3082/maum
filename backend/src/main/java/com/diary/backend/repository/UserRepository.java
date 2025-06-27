package com.diary.backend.repository;

import com.diary.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByKakaoId(String kakaoId);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByKakaoId(String kakaoId);
    
    boolean existsByEmail(String email);
}
