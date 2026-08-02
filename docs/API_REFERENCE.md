# 📡 Fridge Fusion API Reference

This document outlines the RESTful endpoints available on the Express backend (`http://localhost:5000`).

## Authentication Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registers a new user account and hashes password. | ❌ No |
| `POST` | `/api/auth/login` | Authenticates credentials and returns a JWT token. | ❌ No |
| `POST` | `/api/auth/forgot-password` | Generates a mock password reset code. | ❌ No |
| `POST` | `/api/auth/reset-password` | Resets the user's password given a valid code. | ❌ No |

## Recipe Operations
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/recipe/` | Retrieves all public community recipes. | ❌ No |
| `GET` | `/api/recipe/my-recipes` | Retrieves recipes created by the authenticated user. | ✅ Yes (JWT) |
| `POST` | `/api/recipe/create` | Creates and persists a new recipe card to the library. | ✅ Yes (JWT) |
| `DELETE` | `/api/recipe/:id` | Deletes a recipe owned by the authenticated user. | ✅ Yes (JWT) |

## AI Chef Assistant
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/generate` | Calls Groq Llama-3.3-70B API. Enforces food-only domain constraints and returns markdown instructions. | ❌ No |

## Media Processing
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/upload/profile-image` | Accepts image binary via Multer and saves to `/uploads/profiles/`. | ✅ Yes (JWT) |
