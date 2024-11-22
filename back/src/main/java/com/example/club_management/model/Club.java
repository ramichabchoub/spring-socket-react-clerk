package com.example.club_management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clubs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "founding_year")
    private Integer foundingYear;

    @Column(name = "membership_fee")
    private Double membershipFee;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "current_members")
    private Integer currentMembers;

    @Column(name = "contact_email")
    private String contactEmail;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "banner_url")
    private String bannerUrl;
}
