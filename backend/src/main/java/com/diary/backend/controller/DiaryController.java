package com.diary.backend.controller;

import com.diary.backend.dto.ApiResponse;
import com.diary.backend.dto.DiaryDto;
import com.diary.backend.model.Diary;
import com.diary.backend.model.User;
import com.diary.backend.service.DiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Diary", description = "일기 관리 API")
public class DiaryController {
    
    private final DiaryService diaryService;
    
    // TODO: 실제 인증 구현 후 @AuthenticationPrincipal 사용
    // 임시로 하드코딩된 사용자 사용
    private User getCurrentUser() {
        // 임시 사용자 (실제로는 Spring Security에서 인증된 사용자 정보 가져와야 함)
        return User.builder()
                .id(1L)
                .kakaoId("test_user")
                .email("test@example.com")
                .nickname("테스트 사용자")
                .loginType(User.LoginType.KAKAO)
                .build();
    }
    
    @Operation(summary = "일기 작성", description = "새로운 일기를 작성합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<DiaryDto.Response>> createDiary(
            @Valid @RequestBody DiaryDto.Request request) {
        try {
            User currentUser = getCurrentUser();
            DiaryDto.Response response = diaryService.createDiary(currentUser, request);
            return ResponseEntity.ok(ApiResponse.success("일기가 성공적으로 작성되었습니다.", response));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @Operation(summary = "특정 날짜 일기 조회", description = "특정 날짜의 일기를 조회합니다.")
    @GetMapping("/{date}")
    public ResponseEntity<ApiResponse<DiaryDto.Response>> getDiary(
            @Parameter(description = "조회할 날짜 (YYYY-MM-DD)")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            User currentUser = getCurrentUser();
            DiaryDto.Response response = diaryService.getDiary(currentUser, date);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @Operation(summary = "일기 목록 조회", description = "사용자의 모든 일기 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DiaryDto.Summary>>> getDiaryList() {
        User currentUser = getCurrentUser();
        List<DiaryDto.Summary> diaryList = diaryService.getDiaryList(currentUser);
        return ResponseEntity.ok(ApiResponse.success(diaryList));
    }
    
    @Operation(summary = "일기 수정", description = "특정 날짜의 일기를 수정합니다.")
    @PutMapping("/{date}")
    public ResponseEntity<ApiResponse<DiaryDto.Response>> updateDiary(
            @Parameter(description = "수정할 날짜 (YYYY-MM-DD)")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody DiaryDto.Request request) {
        try {
            User currentUser = getCurrentUser();
            DiaryDto.Response response = diaryService.updateDiary(currentUser, date, request);
            return ResponseEntity.ok(ApiResponse.success("일기가 성공적으로 수정되었습니다.", response));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @Operation(summary = "일기 삭제", description = "특정 날짜의 일기를 삭제합니다.")
    @DeleteMapping("/{date}")
    public ResponseEntity<ApiResponse<Void>> deleteDiary(
            @Parameter(description = "삭제할 날짜 (YYYY-MM-DD)")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            User currentUser = getCurrentUser();
            diaryService.deleteDiary(currentUser, date);
            return ResponseEntity.ok(ApiResponse.success("일기가 성공적으로 삭제되었습니다.", null));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @Operation(summary = "일기 검색", description = "키워드로 일기를 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DiaryDto.Summary>>> searchDiaries(
            @Parameter(description = "검색 키워드")
            @RequestParam String keyword) {
        User currentUser = getCurrentUser();
        List<DiaryDto.Summary> searchResults = diaryService.searchDiaries(currentUser, keyword);
        return ResponseEntity.ok(ApiResponse.success(searchResults));
    }
    
    @Operation(summary = "감정별 일기 조회", description = "특정 감정의 일기들을 조회합니다.")
    @GetMapping("/emotion/{emotion}")
    public ResponseEntity<ApiResponse<List<DiaryDto.Summary>>> getDiariesByEmotion(
            @Parameter(description = "감정 (HAPPY, SAD, ANGRY, PEACEFUL, ANXIOUS)")
            @PathVariable Diary.Emotion emotion) {
        User currentUser = getCurrentUser();
        List<DiaryDto.Summary> diaryList = diaryService.getDiariesByEmotion(currentUser, emotion);
        return ResponseEntity.ok(ApiResponse.success(diaryList));
    }
    
    @Operation(summary = "작성 가능 시간 체크", description = "현재 시간이 일기 작성 가능한 시간인지 확인합니다.")
    @GetMapping("/writable-time")
    public ResponseEntity<ApiResponse<Boolean>> checkWritableTime() {
        boolean isWritable = diaryService.isWritableTime();
        return ResponseEntity.ok(ApiResponse.success(isWritable));
    }
    
    @Operation(summary = "특정 날짜 일기 존재 여부", description = "특정 날짜에 일기가 있는지 확인합니다.")
    @GetMapping("/exists/{date}")
    public ResponseEntity<ApiResponse<Boolean>> checkDiaryExists(
            @Parameter(description = "확인할 날짜 (YYYY-MM-DD)")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User currentUser = getCurrentUser();
        boolean exists = diaryService.hasDiaryOnDate(currentUser, date);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }
}
