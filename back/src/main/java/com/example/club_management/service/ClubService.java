package com.example.club_management.service;

import com.example.club_management.model.Club;
import com.example.club_management.repository.ClubRepository;
import com.example.club_management.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubService {
    private final ClubRepository clubRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    public Club getClubById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + id));
    }

    public Club createClub(Club club, String clerkId) {
        User user = userService.getUserByClerkId(clerkId);
        club.setUser(user);
        Club savedClub = clubRepository.save(club);

        messagingTemplate.convertAndSend("/topic/clubs", savedClub);
        return savedClub;
    }

    public Club updateClub(Long id, Club clubDetails, String clerkId) {
        Club club = getClubById(id);

        if (!club.getUser().getClerkId().equals(clerkId)) {
            throw new RuntimeException("Unauthorized to update this club");
        }

        club.setName(clubDetails.getName());
        club.setDescription(clubDetails.getDescription());
        club.setLocation(clubDetails.getLocation());
        club.setFoundingYear(clubDetails.getFoundingYear());
        club.setMembershipFee(clubDetails.getMembershipFee());
        club.setMaxCapacity(clubDetails.getMaxCapacity());
        club.setCurrentMembers(clubDetails.getCurrentMembers());
        club.setContactEmail(clubDetails.getContactEmail());

        Club updatedClub = clubRepository.save(club);
        messagingTemplate.convertAndSend("/topic/clubs", updatedClub);
        return updatedClub;
    }

    public void deleteClub(Long id) {
        Club club = getClubById(id);
        clubRepository.delete(club);
        messagingTemplate.convertAndSend("/topic/clubs/delete", id);
    }
}
