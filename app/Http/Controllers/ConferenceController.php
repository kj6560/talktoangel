<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ConferenceController extends Controller
{
    public function index(Request $request){
        return view('conference.testing');
    }

    public function mobile(Request $request){
        return view('conference.testing');
    }
}
