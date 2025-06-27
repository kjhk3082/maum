package com.diary.backend.repository;

import com.diary.backend.model.Diary;
import com.diary.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Long> {
    
    Optional<Diary> findByUserAndDiaryDate(User user, LocalDate diaryDate);
    
    List<Diary> findByUserOrderByDiaryDateDesc(User user);
    
    List<Diary> findByUserAndDiaryDateBetweenOrderByDiaryDateDesc(
        User user, LocalDate startDate, LocalDate endDate);
    
    boolean existsByUserAndDiaryDate(User user, LocalDate diaryDate);
    
    @Query("SELECT d FROM Diary d WHERE d.user = :user AND " +
           "(LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Diary> searchByKeyword(@Param("user") User user, @Param("keyword") String keyword);
    
    List<Diary> findByUserAndEmotion(User user, Diary.Emotion emotion);
}
