package com.diary.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "diary_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "파일명은 필수입니다")
    private String fileName;
    
    @NotBlank(message = "파일 URL은 필수입니다")
    private String fileUrl;
    
    private String originalFileName;
    
    private Long fileSize;
    
    private String contentType;
    
    private Integer textPosition; // 텍스트 내 이미지 위치
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id", nullable = false)
    private Diary diary;
}
