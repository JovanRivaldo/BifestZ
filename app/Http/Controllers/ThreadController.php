<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ThreadController extends Controller
{
    public function index()
    {
        $threads = Thread::with('user', 'comments', 'likes')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($threads);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:200',
            'content' => 'required|max:5000',
        ]);

        $thread = Thread::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'thread' => $thread->load('user'),
            'message' => 'Thread created successfully'
        ]);
    }

    public function show($id)
    {
        $thread = Thread::with('user', 'comments.user', 'likes')->find($id);

        if (!$thread) {
            return response()->json(['message' => 'Thread not found'], 404);
        }

        return response()->json($thread);
    }

    public function destroy($id)
    {
        $thread = Thread::find($id);

        if (!$thread) {
            return response()->json(['message' => 'Thread not found'], 404);
        }

        if ($thread->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $thread->delete();

        return response()->json([
            'success' => true,
            'message' => 'Thread deleted successfully'
        ]);
    }
}
