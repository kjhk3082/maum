package com.diary.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "diaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 30, message = "제목은 30자 이하로 입력해주세요")
    private String title;
    
    @NotBlank(message = "내용은 필수입니다")
    @Size(max = 3000, message = "내용은 3000자 이하로 입력해주세요")
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    private Emotion emotion;
    
    @Column(nullable = false)
    private LocalDate diaryDate;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaryImage> images;
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum Emotion {
        HAPPY("😊", "기쁨"),
        SAD("😢", "슬픔"),
        ANGRY("😠", "화남"),
        PEACEFUL("😴", "평온"),
        ANXIOUS("😰", "불안");
        
        private final String emoji;
        private final String label;
        
        Emotion(String emoji, String label) {
            this.emoji = emoji;
            this.label = label;
        }
        
        public String getEmoji() {
            return emoji;
        }
        
        public String getLabel() {
            return label;
        }
    }
}
