package com.diary.backend.service;

import com.diary.backend.model.User;
import com.diary.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    
    // 카카오 ID로 사용자 조회
    public Optional<User> findByKakaoId(String kakaoId) {
        return userRepository.findByKakaoId(kakaoId);
    }
    
    // 이메일로 사용자 조회
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // 사용자 생성 또는 업데이트 (OAuth 로그인 시)
    @Transactional
    public User createOrUpdateUser(String kakaoId, String email, String nickname, String profileImageUrl) {
        Optional<User> existingUser = userRepository.findByKakaoId(kakaoId);
        
        if (existingUser.isPresent()) {
            // 기존 사용자 정보 업데이트
            User user = existingUser.get();
            user.setEmail(email);
            user.setNickname(nickname);
            user.setProfileImageUrl(profileImageUrl);
            user.setLastLoginAt(LocalDateTime.now());
            
            log.info("기존 사용자 정보 업데이트: kakaoId={}, email={}", kakaoId, email);
            return user;
        } else {
            // 새 사용자 생성
            User newUser = User.builder()
                    .kakaoId(kakaoId)
                    .email(email)
                    .nickname(nickname)
                    .profileImageUrl(profileImageUrl)
                    .loginType(User.LoginType.KAKAO)
                    .lastLoginAt(LocalDateTime.now())
                    .build();
            
            User savedUser = userRepository.save(newUser);
            log.info("새 사용자 생성: kakaoId={}, email={}", kakaoId, email);
            return savedUser;
        }
    }
    
    // 사용자 정보 업데이트
    @Transactional
    public User updateUser(User user, String nickname, String profileImageUrl) {
        user.setNickname(nickname);
        if (profileImageUrl != null) {
            user.setProfileImageUrl(profileImageUrl);
        }
        
        log.info("사용자 정보 업데이트: userId={}, nickname={}", user.getId(), nickname);
        return user;
    }
    
    // 마지막 로그인 시간 업데이트
    @Transactional
    public void updateLastLoginTime(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        log.debug("마지막 로그인 시간 업데이트: userId={}", user.getId());
    }
    
    // 사용자 삭제 (회원 탈퇴)
    @Transactional
    public void deleteUser(User user) {
        userRepository.delete(user);
        log.info("사용자 삭제: userId={}, kakaoId={}", user.getId(), user.getKakaoId());
    }
    
    // 카카오 ID 존재 여부 체크
    public boolean existsByKakaoId(String kakaoId) {
        return userRepository.existsByKakaoId(kakaoId);
    }
    
    // 이메일 존재 여부 체크
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
