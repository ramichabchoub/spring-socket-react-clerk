package com.example.club_management.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.util.Arrays;

@RestController
public class TestController {

        @GetMapping("/test")
        public Map<String, Object> test() {
                List<Map<String, Object>> books = Arrays.asList(
                                Map.of(
                                                "id", 1,
                                                "title", "The Great Gatsby",
                                                "author", "F. Scott Fitzgerald",
                                                "year", 1925,
                                                "available", true),
                                Map.of(
                                                "id", 2,
                                                "title", "To Kill a Mockingbird",
                                                "author", "Harper Lee",
                                                "year", 1960,
                                                "available", false),
                                Map.of(
                                                "id", 3,
                                                "title", "1984",
                                                "author", "George Orwell",
                                                "year", 1949,
                                                "available", true));

                return Map.of(
                                "status", "success",
                                "message", "Book management system",
                                "total_books", books.size(),
                                "books", books);
        }
}
