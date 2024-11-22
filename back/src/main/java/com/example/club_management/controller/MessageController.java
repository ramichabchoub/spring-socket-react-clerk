package com.example.club_management.controller;

import com.example.club_management.model.Message;
import com.example.club_management.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @PostMapping
    public ResponseEntity<Message> createMessage(@RequestBody Message message, @RequestParam String clerkId) {
        return ResponseEntity.ok(messageService.createMessage(message, clerkId));
    }
}