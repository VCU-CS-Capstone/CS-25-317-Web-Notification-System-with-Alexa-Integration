import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

// API route handler for saving a device token
export async function POST(req) {
  try {
    const body = await req.json();
    const { token, userId } = body;

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Missing token or userId" },
        { status: 400 }
      );
    }

    // Use upsert to handle the case where the token already exists
    // This avoids race conditions and ensures we don't create duplicates
    const { data, error } = await supabase
      .from("user_devices")
      .upsert(
        {
          user_id: userId,
          device_token: token
        },
        {
          // The conflict target is the device_token column which is now unique
          onConflict: 'device_token',
          // Update the user_id if there's a conflict (though this shouldn't change)
          ignoreDuplicates: false
        }
      )
      .select("id");


    if (error) {
      console.error("Error saving token:", error);
      return NextResponse.json(
        { error: "Database error: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Device registered successfully",
      deviceId: data[0].id,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
