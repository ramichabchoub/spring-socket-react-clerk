package com.example.club_management.controller;

import com.example.club_management.model.Club;
import com.example.club_management.service.ClubService;
import com.example.club_management.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {
    private final ClubService clubService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club, @RequestParam String clerkId) {
        return ResponseEntity.ok(clubService.createClub(club, clerkId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClub(@PathVariable Long id, @RequestBody Club club,
            @RequestParam String clerkId) {
        return ResponseEntity.ok(clubService.updateClub(id, club, clerkId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/banner")
    public ResponseEntity<Club> uploadBanner(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam String clerkId) {
        return ResponseEntity.ok(clubService.updateBanner(id, file, clerkId));
    }
}
