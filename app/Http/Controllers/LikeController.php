<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Thread;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggleThreadLike($threadId)
    {
        $thread = Thread::find($threadId);

        if (!$thread) {
            return response()->json(['message' => 'Thread not found'], 404);
        }

        $like = Like::where('user_id', Auth::id())
            ->where('thread_id', $threadId)
            ->first();

        if ($like) {
            $like->delete();
            $thread->decrement('likes_count');
            return response()->json([
                'success' => true,
                'liked' => false,
                'message' => 'Like removed'
            ]);
        } else {
            Like::create([
                'user_id' => Auth::id(),
                'thread_id' => $threadId,
            ]);
            $thread->increment('likes_count');
            return response()->json([
                'success' => true,
                'liked' => true,
                'message' => 'Thread liked'
            ]);
        }
    }

    public function toggleCommentLike($commentId)
    {
        $comment = Comment::find($commentId);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $like = Like::where('user_id', Auth::id())
            ->where('comment_id', $commentId)
            ->first();

        if ($like) {
            $like->delete();
            $comment->decrement('likes_count');
            return response()->json([
                'success' => true,
                'liked' => false,
                'message' => 'Like removed'
            ]);
        } else {
            Like::create([
                'user_id' => Auth::id(),
                'comment_id' => $commentId,
            ]);
            $comment->increment('likes_count');
            return response()->json([
                'success' => true,
                'liked' => true,
                'message' => 'Comment liked'
            ]);
        }
    }
}
