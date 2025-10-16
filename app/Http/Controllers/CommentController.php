<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Thread;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, $threadId)
    {
        $thread = Thread::find($threadId);

        if (!$thread) {
            return response()->json(['message' => 'Thread not found'], 404);
        }

        $validated = $request->validate([
            'content' => 'required|max:1000',
        ]);

        $comment = Comment::create([
            'thread_id' => $threadId,
            'user_id' => Auth::id(),
            'content' => $validated['content'],
        ]);

        $thread->increment('comments_count');

        return response()->json([
            'success' => true,
            'comment' => $comment->load('user'),
            'message' => 'Comment created successfully'
        ]);
    }

    public function destroy($id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $thread = $comment->thread;
        $thread->decrement('comments_count');
        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully'
        ]);
    }
}
