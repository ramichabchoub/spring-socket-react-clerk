package com.example.club_management.service;

import com.example.club_management.model.Book;
import com.example.club_management.repository.BookRepository;
import com.example.club_management.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final UserService userService;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with id: " + id));
    }

    public Book createBook(Book book, String clerkId) {
        User user = userService.getUserByClerkId(clerkId);
        book.setUser(user);
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails, String clerkId) {
        Book book = getBookById(id);

        if (!book.getUser().getClerkId().equals(clerkId)) {
            throw new RuntimeException("Unauthorized to update this book");
        }

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setDescription(bookDetails.getDescription());
        book.setPrice(bookDetails.getPrice());
        book.setPublicationYear(bookDetails.getPublicationYear());
        book.setIsbn(bookDetails.getIsbn());

        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }
}
