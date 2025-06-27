package com.diary.backend.dto;

import com.diary.backend.model.Diary;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DiaryDto {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 30, message = "제목은 30자 이하로 입력해주세요")
        private String title;
        
        @NotBlank(message = "내용은 필수입니다")
        @Size(max = 3000, message = "내용은 3000자 이하로 입력해주세요")
        private String content;
        
        @NotNull(message = "감정은 필수입니다")
        private Diary.Emotion emotion;
        
        @NotNull(message = "일기 날짜는 필수입니다")
        private LocalDate diaryDate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private Diary.Emotion emotion;
        private LocalDate diaryDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String authorNickname;
        
        public static Response from(Diary diary) {
            return Response.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .content(diary.getContent())
                .emotion(diary.getEmotion())
                .diaryDate(diary.getDiaryDate())
                .createdAt(diary.getCreatedAt())
                .updatedAt(diary.getUpdatedAt())
                .authorNickname(diary.getUser().getNickname())
                .build();
        }
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String title;
        private Diary.Emotion emotion;
        private LocalDate diaryDate;
        private String contentPreview; // 내용 일부만
        
        public static Summary from(Diary diary) {
            String preview = diary.getContent().length() > 50 
                ? diary.getContent().substring(0, 50) + "..." 
                : diary.getContent();
            
            return Summary.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .emotion(diary.getEmotion())
                .diaryDate(diary.getDiaryDate())
                .contentPreview(preview)
                .build();
        }
    }
}
