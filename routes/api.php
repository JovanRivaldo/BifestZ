<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::post('/threads', [ThreadController::class, 'store']);
    Route::delete('/threads/{id}', [ThreadController::class, 'destroy']);
    
    Route::post('/threads/{threadId}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
    
    Route::post('/threads/{threadId}/like', [LikeController::class, 'toggleThreadLike']);
    Route::post('/comments/{commentId}/like', [LikeController::class, 'toggleCommentLike']);
    
    Route::put('/profile', [UserController::class, 'update']);
});

Route::get('/threads', [ThreadController::class, 'index']);
Route::get('/threads/{id}', [ThreadController::class, 'show']);
Route::get('/users/{id}', [UserController::class, 'show']);
