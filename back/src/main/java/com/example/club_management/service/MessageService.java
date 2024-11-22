package com.example.club_management.service;

import com.example.club_management.model.Message;
import com.example.club_management.model.User;
import com.example.club_management.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public Message createMessage(Message message, String clerkId) {
        User user = userService.getUserByClerkId(clerkId);
        message.setUser(user);
        Message savedMessage = messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/messages", savedMessage);
        return savedMessage;
    }
}