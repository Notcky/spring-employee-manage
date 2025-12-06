package com.ilie.employee_manager;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // VALIDARE: Numele este obligatoriu
    @NotBlank(message = "Numele este obligatoriu.")
    @Size(min = 3, max = 100, message = "Numele trebuie să aibă între 3 și 100 de caractere.")
    private String name;

    // VALIDARE: Email valid si obligatoriu
    @NotBlank(message = "Email-ul este obligatoriu.")
    @Email(message = "Formatul email-ului este invalid.")
    private String email;

    // VALIDARE: Job obligatoriu
    @NotBlank(message = "Funcția/Job-ul este obligatoriu.")
    private String jobTitle;

    // 🟢 DATA CREAȚIE
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 🟡 DATA ULTIMEI MODIFICĂRI
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructor gol (obligatoriu pentru JPA)
    public Employee() {}

    // Constructor cu parametri
    public Employee(String name, String email, String jobTitle) {
        this.name = name;
        this.email = email;
        this.jobTitle = jobTitle;
    }

    // 🟢 Se execută automat când se creează un angajat
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 🟡 Se execută automat când se actualizează un angajat
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters si Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
