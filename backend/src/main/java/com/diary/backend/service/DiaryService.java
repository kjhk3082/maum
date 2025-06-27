package com.diary.backend.service;

import com.diary.backend.dto.DiaryDto;
import com.diary.backend.model.Diary;
import com.diary.backend.model.User;
import com.diary.backend.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DiaryService {
    
    private final DiaryRepository diaryRepository;
    
    // 작성 가능 시간 체크 - 과거 일기는 언제든 작성 가능, 오늘 일기는 18:00-24:00 제한
    public boolean isWritableTime(LocalDate diaryDate) {
        LocalDate today = LocalDate.now();
        
        // 과거 날짜는 언제든 작성 가능
        if (diaryDate.isBefore(today)) {
            return true;
        }
        
        // 오늘 날짜는 18:00-24:00 시간 제한
        if (diaryDate.equals(today)) {
            LocalTime now = LocalTime.now();
            LocalTime startTime = LocalTime.of(18, 0);
            LocalTime endTime = LocalTime.of(23, 59, 59);
            return now.isAfter(startTime) && now.isBefore(endTime.plusNanos(1));
        }
        
        // 미래 날짜는 작성 불가
        return false;
    }
    
    // 기존 메서드 호환성을 위해 유지 (오늘 날짜 기준)
    public boolean isWritableTime() {
        return isWritableTime(LocalDate.now());
    }
    
    // 수정 가능 시간 체크 (과거 일기는 언제든, 오늘 일기는 18:00-24:00 제한)
    public boolean isEditableTime(LocalDate diaryDate) {
        return isWritableTime(diaryDate);
    }
    
    // 일기 생성
    @Transactional
    public DiaryDto.Response createDiary(User user, DiaryDto.Request request) {
        // 시간 제한 체크
        if (!isWritableTime(request.getDiaryDate())) {
            throw new IllegalStateException("일기는 18:00부터 24:00 사이에만 작성할 수 있습니다.");
        }
        
        // 하루 1개 제한 체크
        if (diaryRepository.existsByUserAndDiaryDate(user, request.getDiaryDate())) {
            throw new IllegalStateException("해당 날짜에 이미 일기가 작성되었습니다.");
        }
        
        Diary diary = Diary.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .emotion(request.getEmotion())
                .diaryDate(request.getDiaryDate())
                .user(user)
                .build();
        
        Diary savedDiary = diaryRepository.save(diary);
        log.info("일기 생성됨: userId={}, diaryId={}, date={}", 
                user.getId(), savedDiary.getId(), request.getDiaryDate());
        
        return DiaryDto.Response.from(savedDiary);
    }
    
    // 일기 조회 (특정 날짜)
    public DiaryDto.Response getDiary(User user, LocalDate diaryDate) {
        Diary diary = diaryRepository.findByUserAndDiaryDate(user, diaryDate)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 일기를 찾을 수 없습니다."));
        
        return DiaryDto.Response.from(diary);
    }
    
    // 일기 목록 조회 (요약)
    public List<DiaryDto.Summary> getDiaryList(User user) {
        List<Diary> diaries = diaryRepository.findByUserOrderByDiaryDateDesc(user);
        return diaries.stream()
                .map(DiaryDto.Summary::from)
                .collect(Collectors.toList());
    }
    
    // 일기 수정
    @Transactional
    public DiaryDto.Response updateDiary(User user, LocalDate diaryDate, DiaryDto.Request request) {
        // 수정 가능 시간 체크
        if (!isEditableTime(diaryDate)) {
            String message = diaryDate.equals(LocalDate.now()) 
                ? "오늘 일기는 18:00~24:00 사이에만 수정할 수 있습니다."
                : "미래 날짜의 일기는 수정할 수 없습니다.";
            throw new IllegalStateException(message);
        }
        
        Diary diary = diaryRepository.findByUserAndDiaryDate(user, diaryDate)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 일기를 찾을 수 없습니다."));
        
        // 소유자 체크
        if (!diary.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("본인의 일기만 수정할 수 있습니다.");
        }
        
        diary.setTitle(request.getTitle());
        diary.setContent(request.getContent());
        diary.setEmotion(request.getEmotion());
        
        log.info("일기 수정됨: userId={}, diaryId={}, date={}", 
                user.getId(), diary.getId(), diaryDate);
        
        return DiaryDto.Response.from(diary);
    }
    
    // 일기 삭제
    @Transactional
    public void deleteDiary(User user, LocalDate diaryDate) {
        // 수정 가능 시간 체크 (삭제도 같은 제한)
        if (!isEditableTime(diaryDate)) {
            String message = diaryDate.equals(LocalDate.now()) 
                ? "오늘 일기는 18:00~24:00 사이에만 삭제할 수 있습니다."
                : "미래 날짜의 일기는 삭제할 수 없습니다.";
            throw new IllegalStateException(message);
        }
        
        Diary diary = diaryRepository.findByUserAndDiaryDate(user, diaryDate)
                .orElseThrow(() -> new IllegalArgumentException("해당 날짜의 일기를 찾을 수 없습니다."));
        
        // 소유자 체크
        if (!diary.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("본인의 일기만 삭제할 수 있습니다.");
        }
        
        diaryRepository.delete(diary);
        log.info("일기 삭제됨: userId={}, diaryId={}, date={}", 
                user.getId(), diary.getId(), diaryDate);
    }
    
    // 일기 검색
    public List<DiaryDto.Summary> searchDiaries(User user, String keyword) {
        List<Diary> diaries = diaryRepository.searchByKeyword(user, keyword);
        return diaries.stream()
                .map(DiaryDto.Summary::from)
                .collect(Collectors.toList());
    }
    
    // 감정별 일기 조회
    public List<DiaryDto.Summary> getDiariesByEmotion(User user, Diary.Emotion emotion) {
        List<Diary> diaries = diaryRepository.findByUserAndEmotion(user, emotion);
        return diaries.stream()
                .map(DiaryDto.Summary::from)
                .collect(Collectors.toList());
    }
    
    // 특정 날짜에 일기 존재 여부 체크
    public boolean hasDiaryOnDate(User user, LocalDate date) {
        return diaryRepository.existsByUserAndDiaryDate(user, date);
    }
}
