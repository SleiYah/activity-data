<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use GuzzleHttp\Psr7\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "msg" => "validation error",
                "errors" => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            "success" => true,
            "msg" => "User registered successfully",
            "user" => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "msg" => "missing attr",
                "errors" => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                "success" => false,
                "error" => "Email or Password Incorrect"
            ], 401);
        }
        try{
            $tokenResult = $user->createToken('auth-token');

            $token = $tokenResult->accessToken;
            
            return response()->json([
                "success" => true,
                "user" => $user,
                "token" => $token,
            
            ]);
        }
        catch(Exception $e){
            return response()->json([
                "error" => $e->getMessage()
               
            ]);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        
        return response()->json([
            "success" => true,
            "msg" => "Logged out successfully"
        ]);
    }
}