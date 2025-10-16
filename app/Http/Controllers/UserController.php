<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::with('threads', 'comments')->find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'username' => 'sometimes|unique:users,username,' . $user->id,
            'bio' => 'sometimes|max:500',
            'profile_photo' => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profiles', 'public');
            $validated['profile_photo'] = $path;
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'Profile updated successfully'
        ]);
    }
}
