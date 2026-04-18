# Hospital Management System - System Design

## Overview
This system manages hospital operations like patients, doctors, appointments, and billing.

---

## Patient Model
- id
- name
- age
- gender
- contact
- disease
- status

---

## Doctor Model
- id
- name
- specialization
- availability
- contact

---

## Appointment Model
- id
- patient_id
- doctor_id
- date
- time
- status

---

## Billing Model
- id
- patient_id
- amount
- status

---

## Management Model
- id
- hospital name
- hospital address
- no. of doctors
- no. of beds
- status(services)

---
## API Endpoints

### Patients
GET /patients  
POST /patients  

### Doctors
GET /doctors  

### Appointments
GET /appointments  
POST /appointments  

### Billing
GET /billing  

---